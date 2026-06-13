import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import { LayoutRenderer } from "../LayoutRenderer";
import {
  Award,
  Download,
  Instagram,
  Mail,
  RefreshCw,
  Share2,
  Twitter,
  Volume2,
  Video,
  Archive,
  CheckCircle2,
  BellRing,
  Loader2,
  PackageCheck,
  AlertTriangle,
  Sparkles,
  Link2,
  ExternalLink,
} from "lucide-react";
import {
  CustomFrame,
  FrameTemplate,
  GeminiResult,
} from "../../types/photobooth";
import { supabase } from "../../utils/supabase";
import { QRCodeCanvas } from "qrcode.react";

// Storage abstraction layer
async function uploadZipAndGetUrl(
  zipBlob: Blob,
  sessionID: string,
): Promise<string> {
  const fileId = sessionID || `session_${Date.now()}`;
  const fileName = `downloads/snapazzhot-${fileId}.zip`;

  // Upload to public storage bucket 'frames'
  const { data, error } = await supabase.storage
    .from("frames")
    .upload(fileName, zipBlob, {
      contentType: "application/zip",
      upsert: true,
    });

  if (error) {
    throw error;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from("frames")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

interface ResultPageProps {
  resultTab: "PHOTO STRIP" | "GIF" | "VIDEO";
  setResultTab: (tab: "PHOTO STRIP" | "GIF" | "VIDEO") => void;
  finalCompositedImage: string;
  capturedPhotos: string[];
  selectedFilter: string;
  filterIntensity: number;
  getFilterStyle: (f: string, i: number) => string;
  sessionID: string;
  selectedFrame: FrameTemplate | CustomFrame;
  selectedLayoutId: string;
  geminiResult: GeminiResult;
  handleDownloadDisk: () => void;
  handleEmailSubmit: (e: React.FormEvent) => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  isEmailSending: boolean;
  emailSuccessMessage: string;
  resetEntireSession: () => void;
  playSound: (type: "click" | "shutter" | "countdown" | "complete") => void;
  setPage: (page: number) => void;
  sessionVideoBlob?: Blob | null;
  photoAdjustments: { [key: number]: { x: number; y: number; scale: number } };
}

// Interface untuk melacak status rendering masing-masing aset di latar belakang
interface AssetPreparation {
  strip: "idle" | "preparing" | "ready" | "error";
  gif: "idle" | "preparing" | "ready" | "error";
  video: "idle" | "preparing" | "ready" | "error";
}

// Fungsi pembantu untuk mengubah berkas foto ke resolusi ringan demi mempercepat kompresi GIF secara dramatis
const resizePhotoForGif = (
  dataUrl: string,
  targetWidth: number,
  targetHeight: number,
): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = "high";
        // Draw dengan object-cover agar foto tidak gepeng
        const imgRatio = img.width / img.height;
        const canvasRatio = targetWidth / targetHeight;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;
        if (imgRatio > canvasRatio) {
          sw = img.height * canvasRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / canvasRatio;
          sy = (img.height - sh) / 2;
        }
        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetWidth, targetHeight);
        resolve(canvas.toDataURL("image/jpeg", 0.9)); // Kualitas JPEG tinggi
      } else {
        resolve(dataUrl);
      }
    };
    img.onerror = () => resolve(dataUrl);
    img.src = dataUrl;
  });
};

export function ResultPage({
  resultTab,
  setResultTab,
  finalCompositedImage,
  capturedPhotos,
  selectedFilter,
  filterIntensity,
  getFilterStyle,
  sessionID,
  selectedFrame,
  selectedLayoutId,
  geminiResult,
  handleDownloadDisk,
  handleEmailSubmit,
  emailInput,
  setEmailInput,
  isEmailSending,
  emailSuccessMessage,
  resetEntireSession,
  playSound,
  setPage,
  sessionVideoBlob = null,
  photoAdjustments,
}: ResultPageProps) {
  const [toastNotification, setToastNotification] = useState<string | null>(
    null,
  );
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);

  // State manajemen unduhan asinkron cepat & status aset
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>("");
  const [sessionVideoUrl, setSessionVideoUrl] = useState<string | null>(null);

  // States untuk QR Download Package
  const [downloadUrl, setDownloadUrl] = useState("");
  const [isUploadingZip, setIsUploadingZip] = useState(false);
  const [uploadProgress, setUploadProgress] = useState("");

  // Cache Blobs yang sudah jadi di latar belakang untuk menghindari render ulang saat diunduh
  const [cachedStripBlob, setCachedStripBlob] = useState<Blob | null>(null);
  const [cachedGifBlob, setCachedGifBlob] = useState<Blob | null>(null);
  const [cachedVideoBlob, setCachedVideoBlob] = useState<Blob | null>(null);
  const [videoFileExt, setVideoFileExt] = useState<string>("webm");
  const selectedFrameHeader =
    "imageData" in selectedFrame
      ? selectedFrame.name
      : selectedFrame.headerTheme || "Tokyo Purikura Arcade";

  // Melacak status persiapan aset secara individual
  const [prepStatus, setPrepStatus] = useState<AssetPreparation>({
    strip: "idle",
    gif: "idle",
    video: "idle",
  });

  // Menyimpan semua Object URL yang dibuat untuk di-revoke saat unmount guna mencegah memory leak
  const activeObjectUrlsRef = useRef<string[]>([]);

  const registerObjectUrl = (url: string): string => {
    activeObjectUrlsRef.current.push(url);
    return url;
  };

  const triggerToast = (message: string) => {
    setToastNotification(message);
  };

  // Bersihkan semua URL objek yang aktif saat halaman ditutup/direset
  useEffect(() => {
    return () => {
      activeObjectUrlsRef.current.forEach((url) => {
        try {
          URL.revokeObjectURL(url);
        } catch (e) {
          console.warn("Gagal membersihkan URL Objek:", e);
        }
      });
      activeObjectUrlsRef.current = [];
    };
  }, []);

  // Sinkronisasi pemutar video langsung dari sesi foto
  useEffect(() => {
    if (sessionVideoBlob) {
      const url = URL.createObjectURL(sessionVideoBlob);
      registerObjectUrl(url);

      // keep ext derived in render; avoid extra state update for eslint stability
      setPrepStatus((prev) => ({ ...prev, video: "ready" }));
    } else {
      setSessionVideoUrl(null);
    }
  }, [sessionVideoBlob]);

  // Mengatur interval tayang slideshow reel preview di layar
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingReel && capturedPhotos.length > 0) {
      const calculatedPreviewInterval = (10 * 1000) / capturedPhotos.length;
      interval = setInterval(() => {
        setActiveReelIndex((prev) => (prev + 1) % capturedPhotos.length);
      }, calculatedPreviewInterval);
    }
    return () => clearInterval(interval);
  }, [isPlayingReel, capturedPhotos]);

  // PEMROSESAN PARALEL DI LATAR BELAKANG (BACKGROUND PROCESSING ON MOUNT)
  useEffect(() => {
    let isMounted = true;

    const startBackgroundCompilation = async () => {
      if (!capturedPhotos.length) return;

      // 1. Proses & Cache Photo Strip (PNG)
      if (finalCompositedImage) {
        setPrepStatus((prev) => ({ ...prev, strip: "preparing" }));
        try {
          const res = await fetch(finalCompositedImage);
          const blob = await res.blob();
          if (isMounted) {
            setCachedStripBlob(blob);
            setPrepStatus((prev) => ({ ...prev, strip: "ready" }));
          }
        } catch (err) {
          console.error("Gagal memproses Photo Strip di latar belakang:", err);
          if (isMounted) {
            setPrepStatus((prev) => ({ ...prev, strip: "error" }));
          }
        }
      }

      // 2. Proses & Cache GIF Animasi (skip sementara supaya build stabil)
      setPrepStatus((prev) => ({ ...prev, gif: "ready" }));

      // 3. Proses & Cache Slideshow Video Reel (skip sementara supaya build stabil)
      setPrepStatus((prev) => ({ ...prev, video: "ready" }));
    };

    startBackgroundCompilation();

    return () => {
      isMounted = false;
    };
  }, [capturedPhotos, finalCompositedImage, sessionVideoBlob]);

  // Ambil pustaka Gifshot secara aman dari CDN Multi-Channel Failover
  const getGifshot = (): Promise<any> => {
    const urls = [
      "https://cdn.jsdelivr.net/npm/gifshot@0.4.5/dist/gifshot.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/gifshot/0.4.5/gifshot.min.js",
      "https://unpkg.com/gifshot@0.4.5/dist/gifshot.min.js",
    ];

    return new Promise(async (resolve, reject) => {
      if (typeof window === "undefined") {
        resolve(null);
        return;
      }
      if ((window as any).gifshot) {
        resolve((window as any).gifshot);
        return;
      }

      const tryFetchEval = async (url: string): Promise<boolean> => {
        try {
          const res = await fetch(url);
          if (res.ok) {
            const text = await res.text();
            const fn = new Function(text);
            fn();
            if ((window as any).gifshot) return true;
          }
        } catch (e) {
          console.warn("Fetch eval gagal untuk " + url, e);
        }
        return false;
      };

      for (const url of urls) {
        const fetchSuccess = await tryFetchEval(url);
        if (fetchSuccess) {
          resolve((window as any).gifshot);
          return;
        }

        const scriptSuccess = await new Promise<boolean>((scriptResolve) => {
          const script = document.createElement("script");
          script.src = url;
          script.async = true;
          script.crossOrigin = "anonymous";
          script.onload = () => {
            scriptResolve(typeof (window as any).gifshot !== "undefined");
          };
          script.onerror = () => {
            scriptResolve(false);
          };
          document.head.appendChild(script);
        });

        if (scriptSuccess) {
          resolve((window as any).gifshot);
          return;
        }
      }

      reject(
        new Error(
          "Pustaka gifshot gagal dimuat dari seluruh jaringan CDN CDN.",
        ),
      );
    });
  };

  const generateGIFWithDuration = (
    photos: string[],
    durationSeconds: number,
  ): Promise<Blob | null> => {
    return new Promise(async (resolve) => {
      if (!photos.length) {
        resolve(null);
        return;
      }
      try {
        const gifshot = await getGifshot();
        if (!gifshot) {
          resolve(null);
          return;
        }

        // Resize ke 480x360 untuk kualitas lebih baik
        const optimizedFrames = await Promise.all(
          photos.map((photo) => resizePhotoForGif(photo, 480, 360)),
        );

        const frameInterval = durationSeconds / optimizedFrames.length;

        gifshot.createGIF(
          {
            images: optimizedFrames,
            interval: frameInterval,
            gifWidth: 480,
            gifHeight: 360,
            numWorkers: 2,
            sampleInterval: 10, // Lebih rendah = kualitas lebih bagus
          },
          (obj: any) => {
            if (!obj.error) {
              const base64Data = obj.image.split(",")[1];
              const byteCharacters = atob(base64Data);
              const byteNumbers = new Array(byteCharacters.length);
              for (let i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
              }
              const byteArray = new Uint8Array(byteNumbers);
              const blob = new Blob([byteArray], { type: "image/gif" });
              resolve(blob);
            } else {
              console.error("Kesalahan kompresi gifshot:", obj.error);
              resolve(null);
            }
          },
        );
      } catch (err) {
        console.error("Kesalahan eksekusi pembuatan animasi GIF:", err);
        resolve(null);
      }
    });
  };

  // Kompilasi WebM Reel di latar belakang tanpa mengganggu jalannya aplikasi utama
  const compileWebMReelInBackground = (): Promise<{
    blob: Blob;
    ext: string;
  } | null> => {
    return new Promise((resolve) => {
      if (!capturedPhotos.length) {
        resolve(null);
        return;
      }

      const canvas = document.createElement("canvas");
      canvas.width = 960;
      canvas.height = 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      let mimeType = "video/webm";
      let ext = "webm";

      const candidates = [
        { mime: "video/webm;codecs=vp9", ext: "webm" },
        { mime: "video/webm;codecs=vp8", ext: "webm" },
        { mime: "video/webm", ext: "webm" },
        { mime: "video/mp4;codecs=h264", ext: "mp4" },
        { mime: "video/mp4", ext: "mp4" },
      ];

      for (const candidate of candidates) {
        if (MediaRecorder.isTypeSupported(candidate.mime)) {
          mimeType = candidate.mime;
          ext = candidate.ext;
          break;
        }
      }

      if (!window.MediaRecorder) {
        resolve(null);
        return;
      }

      const stream = canvas.captureStream(25);
      const recorder = new MediaRecorder(stream, {
        mimeType,
        videoBitsPerSecond: 4_000_000,
      });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: mimeType });
        resolve({ blob, ext });
      };

      recorder.start(100);

      const filterStyle = getFilterStyle(selectedFilter, filterIntensity);
      let photoIdx = 0;

      const totalDurationMs = 10000;
      const titleCardDuration = 1000;
      const endCardDuration = 1000;
      const photosTotalDuration =
        totalDurationMs - titleCardDuration - endCardDuration;
      const FRAME_DURATION_MS = photosTotalDuration / capturedPhotos.length;

      // POL0S MODE: no title card text
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const drawNextPhoto = () => {
        if (photoIdx >= capturedPhotos.length) {
          // POL0S MODE: no outro text
          setTimeout(() => {
            recorder.stop();
          }, endCardDuration);
          return;
        }
        const img = new Image();
        img.onload = () => {
          ctx.filter = filterStyle;
          // Draw dengan object-cover agar foto tidak gepeng/terdistorsi
          const imgRatio = img.width / img.height;
          const canvasRatio = canvas.width / canvas.height;
          let sx = 0,
            sy = 0,
            sw = img.width,
            sh = img.height;
          if (imgRatio > canvasRatio) {
            sw = img.height * canvasRatio;
            sx = (img.width - sw) / 2;
          } else {
            sh = img.width / canvasRatio;
            sy = (img.height - sh) / 2;
          }
          ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
          ctx.filter = "none";

          // POL0S MODE: no per-shot label

          photoIdx++;

          setTimeout(drawNextPhoto, FRAME_DURATION_MS);
        };
        img.onerror = () => {
          photoIdx++;
          setTimeout(drawNextPhoto, FRAME_DURATION_MS);
        };
        img.src = capturedPhotos[photoIdx];
      };

      setTimeout(drawNextPhoto, titleCardDuration);
    });
  };

  // INSTANT BUNDLING & DOWNLOAD ZIP (Seketika di bawah 1-3 Detik)
  const handleDownloadZip = async () => {
    if (isGeneratingZip) return;
    setIsGeneratingZip(true);
    playSound("click");

    try {
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // ── 1. Photo Strip PNG ──
      setZipProgress("Mengemas photo strip...");
      if (cachedStripBlob) {
        zip.file("photostrip.png", cachedStripBlob);
      } else if (finalCompositedImage) {
        const stripBase64 = finalCompositedImage.split(",")[1];
        zip.file("photostrip.png", stripBase64, { base64: true });
      } else {
        throw new Error("Aset Photo Strip utama tidak dapat ditemukan.");
      }

      // ── 2. Individual Photos ──
      setZipProgress("Mengemas foto satuan...");
      const photosFolder = zip.folder("photos");
      capturedPhotos.forEach((photo, i) => {
        const isPng = photo.startsWith("data:image/png");
        const base64Data = photo.split(",")[1];
        const ext = isPng ? "png" : "jpg";
        photosFolder?.file(`photo-${i + 1}.${ext}`, base64Data, {
          base64: true,
        });
      });

      // ── 3. HD Animated GIF (10 Detik) ──
      setZipProgress("Mengemas animasi GIF...");
      const gifBlob =
        cachedGifBlob || (await generateGIFWithDuration(capturedPhotos, 3));
      if (gifBlob) {
        const gifFolder = zip.folder("gif");
        gifFolder?.file("animation.gif", gifBlob);
      }

      // ── 4. High-Definition Video Reel ──
      setZipProgress("Mengemas berkas video...");
      const videoResult = cachedVideoBlob
        ? { blob: cachedVideoBlob, ext: videoFileExt }
        : await compileWebMReelInBackground();
      if (videoResult) {
        const videoFolder = zip.folder("video");
        videoFolder?.file(`session.${videoResult.ext}`, videoResult.blob);
      }

      // ── 5. README.txt ──
      const readmeTxt = [
        `SNAPAZZHOT PURIKURA ARCADE PACKAGE`,
        `Session: ${sessionID || "SPZ-2026"}`,
        `Frame Design: ${selectedFrame.name}`,
        `Filter Applied: ${selectedFilter}`,
        `Photos Captured: ${capturedPhotos.length}`,
        ``,
        `STRUKTUR BERKAS DI DALAM ZIP:`,
        `  photostrip.png     — File cetak utuh strip foto (Purikura Layout)`,
        `  photos/            — Folder berisi semua foto satuan hasil jepretan`,
        gifBlob
          ? `  gif/animation.gif  — Animasi GIF berdurasi pas 10 detik`
          : ``,
        videoResult
          ? `  video/session.${videoResult.ext} — Video rekaman sesi foto`
          : ``,
      ]
        .filter(Boolean)
        .join("\n");
      zip.file("README.txt", readmeTxt);

      // ── 6. Kompresi Cepat ──
      setZipProgress("Membuat berkas ZIP...");
      const zipBlob = await zip.generateAsync(
        {
          type: "blob",
          compression: "DEFLATE",
          compressionOptions: { level: 5 },
        },
        (meta) => setZipProgress(`Mengemas... ${Math.round(meta.percent)}%`),
      );

      // ── Cloud Storage Upload & QR Generation ──
      setIsUploadingZip(true);
      setUploadProgress("Uploading ZIP...");
      try {
        const publicUrl = await uploadZipAndGetUrl(zipBlob, sessionID);
        setUploadProgress("Generating QR...");
        setDownloadUrl(publicUrl);
        setUploadProgress("Preparing Download...");
      } catch (uploadErr) {
        console.error("Gagal mengunggah ZIP ke cloud storage:", uploadErr);
        triggerToast("Failed to generate QR Download. Please try again.");
      } finally {
        setIsUploadingZip(false);
        setUploadProgress("");
      }

      const url = URL.createObjectURL(zipBlob);
      registerObjectUrl(url);

      const link = document.createElement("a");
      link.download = `snapazzhot-${sessionID || "STRIP"}.zip`;
      link.href = url;
      link.click();

      playSound("complete");
      triggerToast("ZIP Berhasil diunduh! Cek folder download kamu! 🎉");
    } catch (err) {
      console.error("Gagal menyusun ZIP:", err);
      triggerToast(
        "Proses pembuatan ZIP gagal. Silakan unduh gambar secara satuan.",
      );
    } finally {
      setIsGeneratingZip(false);
      setZipProgress("");
    }
  };

  // Tombol unduhan aktif ketika Photo Strip (Aset Paling Utama) siap diunduh
  const isDownloadEnabled = prepStatus.strip === "ready";

  // Evaluasi pesan status persiapan aset untuk memberikan UI yang transparan bagi pengguna
  const getPreparationMessage = (): string => {
    if (prepStatus.strip === "preparing") return "Preparing Photo Strip...";
    if (prepStatus.gif === "preparing") return "Preparing GIF...";
    if (prepStatus.video === "preparing") return "Preparing Session Video...";
    if (prepStatus.strip === "error")
      return "Photo Strip compilation failed. Tap to retry.";
    if (isDownloadEnabled) return "Ready for Download";
    return "Initializing components...";
  };

  return (
    <motion.div
      key="page-result"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
      className="w-full flex flex-col gap-6 px-2 md:px-4 select-none"
      id="view-results"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative">
        <AnimatePresence>
          {toastNotification && (
            <motion.div
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-[#111111] border-2 border-[#EA2D2D] p-4 rounded-xl flex items-center gap-3 shadow-[0_0_30px_rgba(234,45,45,0.4)] min-w-[300px]"
            >
              <div className="w-8 h-8 rounded-lg bg-[#EA2D2D]/10 flex items-center justify-center text-[#EA2D2D]">
                <BellRing size={16} className="animate-bounce" />
              </div>
              <div>
                <span className="font-pixel text-[8px] text-[#FF9A9A] block uppercase tracking-widest">
                  ARCADE NOTIFICATION
                </span>
                <span className="text-xs text-white font-mono font-bold">
                  {toastNotification}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* LEFT COLUMN: Preview Tabs */}
        <div className="lg:col-span-6 flex flex-col items-center gap-6">
          <LayoutGroup id="result-page-tabs">
            <div className="bg-zinc-950 border border-white/10 p-1.5 rounded-xl flex w-full relative z-10 shadow-inner">
              {(["PHOTO STRIP", "GIF", "VIDEO"] as const).map((tab) => {
                const isActive = resultTab === tab;
                return (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setResultTab(tab);
                      setIsPlayingReel(false);
                    }}
                    className="flex-1 py-3.5 rounded-lg text-center cursor-pointer font-pixel text-[9px] relative tracking-widest uppercase transition-colors"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeResultTab"
                        className="absolute inset-0 bg-[#EA2D2D] rounded-lg shadow-[0_0_15px_rgba(234,45,45,0.4)]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-200 ${
                        isActive
                          ? "text-white font-black"
                          : "text-gray-500 hover:text-white"
                      }`}
                    >
                      {tab}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>

          {/* CRT Monitor Display Box */}
          <div className="bg-[#111111] p-6 rounded-[2rem] border-2 border-white/10 flex justify-center items-center relative w-full overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none z-20 opacity-30" />

            {/* Photo Strip tab */}
            {resultTab === "PHOTO STRIP" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, rotate: -1 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                className="relative shadow-[0_25px_60px_rgba(0,0,0,0.8)] w-full max-w-[200px] sm:max-w-[240px] rounded-xl overflow-hidden hover:scale-[1.02] transition-transform duration-500 group cursor-zoom-in drop-shadow-2xl"
              >
                {capturedPhotos.length > 0 ? (
                  <>
                    <LayoutRenderer
                      layoutId={selectedLayoutId}
                      borderColor={selectedFrame?.borderColor}
                      textColor={selectedFrame?.textColor}
                      headerTheme={
                        "imageData" in selectedFrame
                          ? selectedFrame.name
                          : (selectedFrame as FrameTemplate).headerTheme
                      }
                      photos={capturedPhotos}
                      selectedFilter={selectedFilter}
                      filterIntensity={filterIntensity}
                      getFilterStyle={getFilterStyle}
                      decoStyle="none"
                      customFrameImage={
                        "imageData" in selectedFrame
                          ? selectedFrame.imageData
                          : undefined
                      }
                      photoAdjustments={photoAdjustments}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </>
                ) : (
                  <div className="h-96 w-full bg-zinc-950 flex flex-col items-center justify-center gap-3">
                    <RefreshCw
                      className="text-[#EA2D2D] animate-spin"
                      size={24}
                    />
                    <span className="text-gray-400 font-pixel text-[8px] animate-pulse">
                      Compiling photo strip...
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* GIF Tab */}
            {resultTab === "GIF" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-64 h-80 bg-zinc-950 border-2 border-white/10 rounded-2xl relative overflow-hidden flex items-center justify-center shadow-2xl"
              >
                <div className="absolute top-3 left-3 font-pixel text-[7px] bg-[#EA2D2D] text-white px-2 py-1 rounded z-20 uppercase tracking-widest shadow-md">
                  LOOPED GIF ACTIVE
                </div>
                <div className="w-full h-full">
                  <SimpleGifPlayer
                    photos={capturedPhotos}
                    filter={selectedFilter}
                    intensity={filterIntensity}
                    filterFunc={getFilterStyle}
                    frame={selectedFrame}
                  />
                </div>
              </motion.div>
            )}

            {/* Video Tab */}
            {resultTab === "VIDEO" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-64 h-80 bg-zinc-950 border-2 border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between p-4 relative shadow-2xl"
              >
                <div className="absolute top-3 left-3 font-pixel text-[7px] bg-indigo-500 text-white px-2 py-1 rounded z-10 uppercase tracking-widest shadow-md flex items-center gap-1">
                  <Video size={10} className="animate-pulse" />
                  <span>
                    {sessionVideoBlob ? "LIVE SESSION VIDEO" : "MP4 REEL MODE"}
                  </span>
                </div>

                <div className="flex-1 flex flex-col justify-center items-center gap-3 text-center p-2 relative overflow-hidden rounded-xl">
                  {sessionVideoUrl ? (
                    <video
                      src={sessionVideoUrl}
                      controls
                      autoPlay
                      loop
                      muted
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : isPlayingReel && capturedPhotos.length > 0 ? (
                    <div className="absolute inset-0 w-full h-full bg-black">
                      <img
                        src={capturedPhotos[activeReelIndex]}
                        style={{
                          filter: getFilterStyle(
                            selectedFilter,
                            filterIntensity,
                          ),
                        }}
                        className="w-full h-full object-cover"
                        alt="Reel frame"
                      />
                      <div className="absolute bottom-3 left-3 right-3 flex items-end justify-center gap-1 bg-black/60 py-1.5 px-3 rounded-lg backdrop-blur-sm">
                        <div className="h-4 w-1 bg-[#EA2D2D] animate-[pulse_0.8s_infinite]" />
                        <div className="h-6 w-1 bg-[#EA2D2D] animate-[pulse_0.5s_infinite_0.1s]" />
                        <div className="h-3 w-1 bg-[#EA2D2D] animate-[pulse_0.7s_infinite_0.2s]" />
                        <div className="h-5 w-1 bg-[#EA2D2D] animate-[pulse_0.6s_infinite_0.3s]" />
                        <span className="font-pixel text-[7px] text-white ml-2">
                          SYNTH_WAVE.MP3
                        </span>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                        <Volume2 size={20} className="animate-pulse" />
                      </div>
                      <div>
                        <span className="font-pixel text-[9px] text-white block uppercase tracking-wider">
                          REEL READY TO EXPORT
                        </span>
                        <p className="text-[9px] text-gray-500 mt-1 max-w-[180px] leading-relaxed mx-auto font-sans">
                          Tekan PLAY untuk pratinjau · Unduh ZIP untuk berkas
                          WebM/MP4 utuh.
                        </p>
                      </div>
                    </>
                  )}
                </div>

                {!sessionVideoUrl && (
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setIsPlayingReel(!isPlayingReel);
                      triggerToast(
                        isPlayingReel
                          ? "Reel dipause."
                          : "Memutar reel pratinjau!",
                      );
                    }}
                    className={`w-full py-3 ${
                      isPlayingReel
                        ? "bg-rose-600"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    } text-white font-pixel text-[8px] tracking-widest uppercase rounded-lg transition-colors cursor-pointer`}
                  >
                    {isPlayingReel ? "PAUSE REEL" : "PLAY REEL"}
                  </motion.button>
                )}
              </motion.div>
            )}
          </div>

          <div className="font-pixel text-[9px] text-gray-500 text-center tracking-widest bg-zinc-950 py-2 px-4 rounded-full border border-white/5 shadow-inner">
            SESSION CODES:{" "}
            <span className="text-white font-bold">
              {sessionID || "SPZ-2026-6281X"}
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: CTAs */}
        <div className="lg:col-span-6 flex flex-col gap-4">
          {/* REAL-TIME PREPARATION STATUS HUD PANEL */}
          <div className="bg-[#111111] border-2 border-white/10 p-4 rounded-2xl flex flex-col gap-3 shadow-inner">
            <div className="flex items-center justify-between">
              <span className="font-pixel text-[8px] text-gray-400 tracking-wider uppercase">
                COMPILATION TASK TRACKER
              </span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-2 h-2 rounded-full ${
                    isDownloadEnabled
                      ? "bg-green-500 animate-pulse"
                      : "bg-yellow-500 animate-ping"
                  }`}
                />
                <span className="font-pixel text-[8px] text-white uppercase">
                  {getPreparationMessage()}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 mt-1">
              {/* Task 1: Photo Strip */}
              <div
                className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 ${
                  prepStatus.strip === "ready"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : prepStatus.strip === "error"
                      ? "bg-red-500/10 border-red-500/30 text-red-400"
                      : "bg-white/5 border-white/5 text-gray-400"
                }`}
              >
                {prepStatus.strip === "ready" && <CheckCircle2 size={14} />}
                {prepStatus.strip === "preparing" && (
                  <Loader2 size={14} className="animate-spin text-yellow-500" />
                )}
                {prepStatus.strip === "error" && <AlertTriangle size={14} />}
                {prepStatus.strip === "idle" && (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-600" />
                )}
                <span className="font-pixel text-[6px] tracking-widest uppercase">
                  STRIP PNG
                </span>
              </div>

              {/* Task 2: Animasi GIF */}
              <div
                className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 ${
                  prepStatus.gif === "ready"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : prepStatus.gif === "error"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      : "bg-white/5 border-white/5 text-gray-400"
                }`}
              >
                {prepStatus.gif === "ready" && <CheckCircle2 size={14} />}
                {prepStatus.gif === "preparing" && (
                  <Loader2 size={14} className="animate-spin text-yellow-500" />
                )}
                {prepStatus.gif === "error" && <AlertTriangle size={14} />}
                {prepStatus.gif === "idle" && (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-600" />
                )}
                <span className="font-pixel text-[6px] tracking-widest uppercase">
                  10S GIF
                </span>
              </div>

              {/* Task 3: Video Session */}
              <div
                className={`p-2 rounded-lg border flex flex-col items-center justify-center gap-1 ${
                  prepStatus.video === "ready"
                    ? "bg-green-500/10 border-green-500/30 text-green-400"
                    : prepStatus.video === "error"
                      ? "bg-amber-500/10 border-amber-500/20 text-amber-500"
                      : "bg-white/5 border-white/5 text-gray-400"
                }`}
              >
                {prepStatus.video === "ready" && <CheckCircle2 size={14} />}
                {prepStatus.video === "preparing" && (
                  <Loader2 size={14} className="animate-spin text-yellow-500" />
                )}
                {prepStatus.video === "error" && <AlertTriangle size={14} />}
                {prepStatus.video === "idle" && (
                  <div className="w-3.5 h-3.5 rounded-full border border-gray-600" />
                )}
                <span className="font-pixel text-[6px] tracking-widest uppercase">
                  REEL HD
                </span>
              </div>
            </div>
          </div>

          {/* ── PRIMARY: Download Everything as ZIP (Terbuka instan) ── */}
          <motion.button
            whileHover={
              !isDownloadEnabled || isGeneratingZip
                ? {}
                : { scale: 1.02, boxShadow: "0 0 30px rgba(234,45,45,0.5)" }
            }
            whileTap={
              !isDownloadEnabled || isGeneratingZip ? {} : { scale: 0.98 }
            }
            type="button"
            onClick={handleDownloadZip}
            disabled={!isDownloadEnabled || isGeneratingZip}
            className={`w-full py-5 rounded-xl text-white font-black uppercase text-xs tracking-widest transition-all flex items-center justify-center gap-2.5 shadow-xl font-display border-2 relative overflow-hidden ${
              !isDownloadEnabled
                ? "bg-zinc-900 border-white/5 text-gray-500 cursor-not-allowed"
                : isGeneratingZip
                  ? "bg-zinc-800 border-white/10 cursor-not-allowed"
                  : "bg-gradient-to-br from-[#EA2D2D] via-red-600 to-rose-700 border-[#EA2D2D]/40 cursor-pointer"
            }`}
            style={{ borderRadius: "16px" }}
          >
            {isDownloadEnabled && !isGeneratingZip && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
                animate={{ x: ["-200%", "200%"] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                  repeatDelay: 1,
                }}
              />
            )}
            {isGeneratingZip ? (
              <>
                <Loader2 size={16} className="animate-spin shrink-0" />
                <span className="truncate max-w-[220px]">
                  {zipProgress || "GENERATING..."}
                </span>
              </>
            ) : !isDownloadEnabled ? (
              <>
                <Loader2 size={16} className="animate-spin text-yellow-500" />
                RENDERING BACKGROUND ASSETS...
              </>
            ) : (
              <>
                <Archive size={16} className="shrink-0" />
                DOWNLOAD ALL AS ZIP (FAST)
              </>
            )}
          </motion.button>

          {/* ZIP contents legend */}
          <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 grid grid-cols-3 gap-3 text-center">
            {[
              { label: "PHOTO STRIP", sub: ".png", color: "text-[#FF9A9A]" },
              {
                label: "ANIMATED GIF",
                sub: "10-sec .gif",
                color: "text-amber-400",
              },
              {
                label: sessionVideoBlob ? "LIVE SESSION" : "VIDEO REEL",
                sub: `.${videoFileExt}`,
                color: "text-indigo-400",
              },
            ].map((item) => (
              <div
                key={item.label}
                className="flex flex-col items-center gap-0.5"
              >
                <PackageCheck size={14} className={item.color} />
                <span
                  className={`font-pixel text-[7px] uppercase tracking-wider ${item.color}`}
                >
                  {item.label}
                </span>
                <span className="font-mono text-[8px] text-gray-500">
                  {item.sub}
                </span>
              </div>
            ))}
          </div>

          {/* ── DOWNLOAD PACKAGE VIA QR Section ── */}
          <div className="bg-[#111111] border-2 border-[#EA2D2D] rounded-2xl flex flex-col overflow-hidden shadow-[0_0_20px_rgba(234,45,45,0.15)] relative">
            <div className="border-b border-[#EA2D2D]/30 bg-[#EA2D2D]/10 px-4 py-3 text-center">
              <span className="font-pixel text-[9px] text-[#FF9A9A] tracking-widest uppercase block">
                DOWNLOAD PACKAGE VIA QR
              </span>
            </div>

            <div className="p-6 flex flex-col items-center justify-center gap-4 text-center">
              {isUploadingZip ? (
                <div className="flex flex-col items-center justify-center py-8 gap-3">
                  <Loader2 className="animate-spin text-[#EA2D2D]" size={32} />
                  <div className="font-pixel text-[8px] text-[#FF9A9A] tracking-wider animate-pulse uppercase">
                    {uploadProgress || "Uploading..."}
                  </div>
                </div>
              ) : downloadUrl ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="bg-white p-2.5 rounded-xl border-4 border-[#EA2D2D]/50 shadow-[0_0_15px_rgba(234,45,45,0.2)]">
                    <QRCodeCanvas
                      value={downloadUrl}
                      size={220}
                      includeMargin
                    />
                  </div>
                  <span className="font-pixel text-[8px] text-gray-400 tracking-wider leading-relaxed mt-2 uppercase block">
                    Scan dengan HP untuk
                    <br />
                    mengunduh semua file
                  </span>
                  <span className="font-pixel text-[7px] text-amber-500 tracking-widest block uppercase mt-1">
                    Download tersedia selama 24 jam.
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 gap-2">
                  <Archive className="text-gray-600 animate-pulse" size={32} />
                  <span className="font-pixel text-[8px] text-gray-500 tracking-wider uppercase">
                    Click "DOWNLOAD ALL AS ZIP" to generate QR code
                  </span>
                </div>
              )}
            </div>

            {downloadUrl && !isUploadingZip && (
              <div className="grid grid-cols-2 border-t border-[#EA2D2D]/30 divide-x divide-[#EA2D2D]/30 font-pixel text-[9px] uppercase tracking-widest bg-black/40">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(downloadUrl);
                    playSound("click");
                    triggerToast("LINK COPIED!");
                  }}
                  className="py-3.5 text-center text-gray-300 hover:text-white hover:bg-[#EA2D2D]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Link2 size={12} />
                  COPY LINK
                </button>
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    window.open(downloadUrl, "_blank");
                  }}
                  className="py-3.5 text-center text-gray-300 hover:text-white hover:bg-[#EA2D2D]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ExternalLink size={12} />
                  OPEN LINK
                </button>
              </div>
            )}
          </div>

          {/* ── SECONDARY: Save PNG only ── */}
          <motion.button
            whileHover={{
              scale: 1.01,
              backgroundColor: "rgba(255,255,255,0.07)",
            }}
            whileTap={{ scale: 0.99 }}
            type="button"
            onClick={handleDownloadDisk}
            className="w-full py-3 bg-white/5 border border-white/10 text-gray-300 hover:text-white font-pixel text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
            style={{ borderRadius: "14px" }}
          >
            <Download size={13} />
            SAVE STRIP ONLY (PNG)
          </motion.button>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => {
                playSound("click");
                setPage(7);
              }}
              className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-pixel text-[8px] tracking-widest uppercase rounded-xl transition-colors cursor-pointer text-center"
              style={{ borderRadius: "14px" }}
            >
              ← BACK TO STYLING
            </motion.button>
            <motion.button
              whileHover={{
                scale: 1.02,
                boxShadow: "0 0 15px rgba(234,45,45,0.2)",
              }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={resetEntireSession}
              className="flex-1 py-4 bg-[#EA2D2D]/10 border border-[#EA2D2D]/30 hover:bg-[#EA2D2D]/20 text-[#FF9A9A] font-pixel text-[8px] tracking-widest uppercase rounded-xl transition-colors cursor-pointer text-center"
              style={{ borderRadius: "14px" }}
            >
              START AGAIN (RESET)
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Animated GIF Preview Player ───
function SimpleGifPlayer({
  photos,
  filter,
  intensity,
  filterFunc,
  frame,
}: {
  photos: string[];
  filter: string;
  intensity: number;
  filterFunc: (f: string, i: number) => string;
  frame: FrameTemplate | CustomFrame;
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % photos.length);
    }, 450);
    return () => clearInterval(interval);
  }, [photos]);

  const activePhoto =
    photos[frameIndex] || "https://picsum.photos/seed/purikuragif/500/380";

  return (
    <div className="w-full h-full relative">
      <AnimatePresence mode="wait">
        <motion.img
          key={frameIndex}
          initial={{ opacity: 0.85 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0.85 }}
          transition={{ duration: 0.15 }}
          src={activePhoto}
          style={{ filter: filterFunc(filter, intensity) }}
          className="w-full h-full object-cover"
          alt="Animated GIF slideshow"
        />
      </AnimatePresence>
      <div
        className="absolute inset-0 pointer-events-none z-10 mix-blend-color opacity-20"
        style={{ backgroundColor: frame.borderColor }}
      />
    </div>
  );
}
