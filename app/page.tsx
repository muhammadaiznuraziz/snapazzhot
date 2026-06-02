"use models/gemini-3.5-flash";
"use client";

import React, { useState, useRef, useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { Info, ShieldCheck } from "lucide-react";

import {
  CustomFrame,
  FrameTemplate,
  User,
  GeminiResult,
  LAYOUT_PRESETS,
} from "../types/photobooth";
import { LandingView } from "../components/views/LandingView";
import { ChooseLayoutView } from "../components/views/ChooseLayoutView";

import { PhotoSessionPage } from "../components/views/PhotoSessionPage";
import { FilterSelectionPage } from "../components/views/FilterSelectionPage";
import { ResultPage } from "../components/views/ResultPage";
import { Navbar } from "../components/Navbar/Navbar";

// Design Token Colors
const BRAND_RED = "#EA2D2D";
const DEEP_RED = "#C61D1D";
const SOFT_RED = "#FF6B6B";
const ACCENT_PINK = "#FF9A9A";

// Frames Data and Configuration
const FRAMES_LIST: FrameTemplate[] = [
  {
    id: "nippon-neon",
    name: "Nippon Neon Purikura",
    category: "Retro",
    rarity: "Legendary",
    layoutCount: 4,
    borderColor: "#12081c",
    textColor: "#FF9A9A",
    headerTheme: "東京 BEAT",
    decoStyle: "tokyo-neon",
  },
  {
    id: "shibuya-rain",
    name: "Shibuya Rain Booth",
    category: "Retro",
    rarity: "Rare",
    layoutCount: 2,
    borderColor: "#26324f",
    textColor: "#9ad7ff",
    headerTheme: "SHIBUYA RAIN",
    decoStyle: "rain-glass",
  },
  {
    id: "y2k-metallic",
    name: "Y2K Pop Star",
    category: "Retro",
    rarity: "Epic",
    layoutCount: 3,
    borderColor: "#fd0066",
    textColor: "#ffffff",
    headerTheme: "Y2K ANGEL",
    decoStyle: "y2k-stickers",
  },
  {
    id: "vhs-midnight",
    name: "VHS Midnight Arcade",
    category: "Retro",
    rarity: "Common",
    layoutCount: 4,
    borderColor: "#18181b",
    textColor: "#22d3ee",
    headerTheme: "VHS 1998",
    decoStyle: "retro-vhs",
  },
  {
    id: "chrome-diner",
    name: "Chrome Diner Flash",
    category: "Retro",
    rarity: "Legendary",
    layoutCount: 1,
    borderColor: "#b91c1c",
    textColor: "#fef08a",
    headerTheme: "DINER FLASH",
    decoStyle: "chrome-pop",
  },
  {
    id: "turf-champions",
    name: "Champions Turf v1",
    category: "Football",
    rarity: "Rare",
    layoutCount: 4,
    borderColor: "#0d5c34",
    textColor: "#FDB022",
    headerTheme: "GOAL! 2026",
    decoStyle: "football-badge",
  },
  {
    id: "derby-night",
    name: "Derby Night Flare",
    category: "Football",
    rarity: "Epic",
    layoutCount: 2,
    borderColor: "#111827",
    textColor: "#86efac",
    headerTheme: "DERBY NIGHT",
    decoStyle: "stadium-night",
  },
  {
    id: "ultras-smoke",
    name: "Ultras Smoke Banner",
    category: "Football",
    rarity: "Legendary",
    layoutCount: 4,
    borderColor: "#7f1d1d",
    textColor: "#ffffff",
    headerTheme: "ULTRAS ZONE",
    decoStyle: "ultras-banner",
  },
  {
    id: "pitch-daylight",
    name: "Pitch Daylight",
    category: "Football",
    rarity: "Common",
    layoutCount: 3,
    borderColor: "#15803d",
    textColor: "#fef3c7",
    headerTheme: "MATCH DAY",
    decoStyle: "pitch-lines",
  },
  {
    id: "golden-final",
    name: "Golden Final Cup",
    category: "Football",
    rarity: "Rare",
    layoutCount: 1,
    borderColor: "#422006",
    textColor: "#facc15",
    headerTheme: "FINAL CUP",
    decoStyle: "cup-final",
  },
  {
    id: "sakura-dream",
    name: "Sakura Blossom Sweet",
    category: "Aesthetic",
    rarity: "Common",
    layoutCount: 4,
    borderColor: "#FFEBEB",
    textColor: "#FF6B6B",
    headerTheme: "さくら DAYS",
    decoStyle: "sakura-petals",
  },
  {
    id: "milk-tea-soft",
    name: "Milk Tea Soft Glow",
    category: "Aesthetic",
    rarity: "Common",
    layoutCount: 2,
    borderColor: "#f5d0c5",
    textColor: "#7c2d12",
    headerTheme: "SOFT GLOW",
    decoStyle: "soft-cloud",
  },
  {
    id: "blue-hour",
    name: "Blue Hour Mood",
    category: "Aesthetic",
    rarity: "Rare",
    layoutCount: 3,
    borderColor: "#1e3a8a",
    textColor: "#bfdbfe",
    headerTheme: "BLUE HOUR",
    decoStyle: "blue-hour",
  },
  {
    id: "candy-cloud",
    name: "Candy Cloud Studio",
    category: "Aesthetic",
    rarity: "Epic",
    layoutCount: 4,
    borderColor: "#f9a8d4",
    textColor: "#701a75",
    headerTheme: "CANDY CLOUD",
    decoStyle: "candy-sticker",
  },
  {
    id: "mono-gallery",
    name: "Mono Gallery Clean",
    category: "Aesthetic",
    rarity: "Legendary",
    layoutCount: 1,
    borderColor: "#f8fafc",
    textColor: "#111827",
    headerTheme: "MONO GALLERY",
    decoStyle: "clean-gallery",
  },
  {
    id: "idol-stage",
    name: "Idol Stage Lights",
    category: "K-Pop",
    rarity: "Epic",
    layoutCount: 4,
    borderColor: "#7c3aed",
    textColor: "#fde68a",
    headerTheme: "IDOL STAGE",
    decoStyle: "idol-stage",
  },
  {
    id: "pink-venue",
    name: "Pink Venue Pass",
    category: "K-Pop",
    rarity: "Rare",
    layoutCount: 2,
    borderColor: "#db2777",
    textColor: "#ffffff",
    headerTheme: "BACKSTAGE",
    decoStyle: "backstage-pass",
  },
  {
    id: "lightstick-wave",
    name: "Lightstick Wave",
    category: "K-Pop",
    rarity: "Legendary",
    layoutCount: 3,
    borderColor: "#020617",
    textColor: "#67e8f9",
    headerTheme: "LIGHTSTICK",
    decoStyle: "lightstick-wave",
  },
  {
    id: "comeback-teaser",
    name: "Comeback Teaser",
    category: "K-Pop",
    rarity: "Common",
    layoutCount: 1,
    borderColor: "#f472b6",
    textColor: "#4a044e",
    headerTheme: "COMEBACK",
    decoStyle: "comeback-pink",
  },
  {
    id: "dance-practice",
    name: "Dance Practice Room",
    category: "K-Pop",
    rarity: "Rare",
    layoutCount: 4,
    borderColor: "#27272a",
    textColor: "#a7f3d0",
    headerTheme: "DANCE CUT",
    decoStyle: "practice-room",
  },
  {
    id: "manga-speed",
    name: "Shonen Action Speed",
    category: "Anime",
    rarity: "Epic",
    layoutCount: 6,
    borderColor: "#000000",
    textColor: "#ffff00",
    headerTheme: "BANG! 💥",
    decoStyle: "manga-action",
  },
  {
    id: "mecha-blueprint",
    name: "Mecha Blueprint",
    category: "Anime",
    rarity: "Rare",
    layoutCount: 2,
    borderColor: "#0f172a",
    textColor: "#38bdf8",
    headerTheme: "MECHA UNIT",
    decoStyle: "mecha-blueprint",
  },
  {
    id: "magical-spark",
    name: "Magical Spark Scene",
    category: "Anime",
    rarity: "Legendary",
    layoutCount: 3,
    borderColor: "#c026d3",
    textColor: "#fef3c7",
    headerTheme: "MAGIC SPARK",
    decoStyle: "magical-spark",
  },
  {
    id: "school-festival",
    name: "School Festival Arc",
    category: "Anime",
    rarity: "Common",
    layoutCount: 4,
    borderColor: "#fb7185",
    textColor: "#ffffff",
    headerTheme: "FESTIVAL ARC",
    decoStyle: "festival-arc",
  },
  {
    id: "villain-shadow",
    name: "Villain Shadow Cut",
    category: "Anime",
    rarity: "Epic",
    layoutCount: 1,
    borderColor: "#09090b",
    textColor: "#ef4444",
    headerTheme: "DARK CUT",
    decoStyle: "villain-shadow",
  },
  {
    id: "grad-caps",
    name: "Class of 26 Golden Gala",
    category: "Graduation",
    rarity: "Legendary",
    layoutCount: 4,
    borderColor: "#080c14",
    textColor: "#FDB022",
    headerTheme: "GRADUATE 🎓",
    decoStyle: "grad-gold",
  },
  {
    id: "campus-blue",
    name: "Campus Blue Honor",
    category: "Graduation",
    rarity: "Rare",
    layoutCount: 2,
    borderColor: "#1d4ed8",
    textColor: "#fef3c7",
    headerTheme: "HONOR ROLL",
    decoStyle: "campus-honor",
  },
  {
    id: "diploma-cream",
    name: "Diploma Cream Classic",
    category: "Graduation",
    rarity: "Common",
    layoutCount: 3,
    borderColor: "#fef3c7",
    textColor: "#78350f",
    headerTheme: "DIPLOMA DAY",
    decoStyle: "diploma-classic",
  },
  {
    id: "midnight-valedictorian",
    name: "Midnight Valedictorian",
    category: "Graduation",
    rarity: "Epic",
    layoutCount: 4,
    borderColor: "#020617",
    textColor: "#fbbf24",
    headerTheme: "TOP CLASS",
    decoStyle: "valedictorian",
  },
  {
    id: "confetti-sendoff",
    name: "Confetti Sendoff",
    category: "Graduation",
    rarity: "Legendary",
    layoutCount: 1,
    borderColor: "#7f1d1d",
    textColor: "#fde68a",
    headerTheme: "SENDOFF",
    decoStyle: "confetti-sendoff",
  },
];

export default function SnapazPhotobooth() {
  // Navigation: pages 1 to 8
  const [page, setPage] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);

  // Theme state
  const [selectedTheme, setSelectedTheme] = useState<string>("Retro");

  // Custom frames state
  const [customFrames, setCustomFrames] = useState<CustomFrame[]>([]);

  // Layout selections
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate | CustomFrame>(
    FRAMES_LIST[0],
  );
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("LAYOUT_A");
  const [photoStripLayout, setPhotoStripLayout] = useState<number>(3); // Matches LAYOUT_A count (3)
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Modern Audio effect toggler
  const [muted, setMuted] = useState<boolean>(false);

  // Camera permissions & settings
  const [hasCameraPermission, setHasCameraPermission] = useState<
    boolean | null
  >(null);
  const [isMirror, setIsMirror] = useState<boolean>(true);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isFlashActive, setIsFlashActive] = useState<boolean>(false);
  const [isLiveCamera, setIsLiveCamera] = useState<boolean>(true); // true = raw camera, false = simulated cute presets or files

  // Captures state
  const [capturedPhotos, setCapturedPhotos] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isShooting, setIsShooting] = useState<boolean>(false);

  // Custom filters
  const [selectedFilter, setSelectedFilter] = useState<string>("Original");
  const [filterIntensity, setFilterIntensity] = useState<number>(100);

  // Modals Info
  const [activeModal, setActiveModal] = useState<"about" | "privacy" | null>(
    null,
  );

  // Final Results
  const [sessionID, setSessionID] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [isEmailSending, setIsEmailSending] = useState<boolean>(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string>("");
  const [resultTab, setResultTab] = useState<"PHOTO STRIP" | "GIF" | "VIDEO">(
    "PHOTO STRIP",
  );

  // Canvas combined result binary
  const [finalCompositedImage, setFinalCompositedImage] = useState<string>("");

  // Gemini customization states
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiResult, setGeminiResult] = useState<GeminiResult>({
    commentary: "ARCADE OVERDRIVE! 🔥",
    stickers: [
      { text: "KAWAII!", type: "bubble", color: "#FF9A9A" },
      { text: "SUPER STAR", type: "star", color: "#FDB022" },
      { text: "SNAP!", type: "arcade", color: "#EA2D2D" },
    ],
    fortune: "Your future rating is EPIC! Keep taking retro snapshots.",
  });

  // Reference hooks
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  // Audio helper
  const playSound = (type: "click" | "shutter" | "countdown" | "complete") => {
    if (muted) return;
    try {
      const frequencies: { [key: string]: number[] } = {
        click: [440, 0.08],
        countdown: [587, 0.12],
        shutter: [1000, 0.4],
        complete: [880, 0.2, 1320, 0.3],
      };

      const ctx = new (
        window.AudioContext || (window as any).webkitAudioContext
      )();
      if (type === "shutter") {
        const bufferSize = ctx.sampleRate * frequencies[type][1];
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.setValueAtTime(800, ctx.currentTime);
        noise.connect(filter);
        filter.connect(ctx.destination);
        noise.start();
      } else {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        const data = frequencies[type];
        if (data.length === 2) {
          osc.frequency.setValueAtTime(data[0], ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + data[1],
          );
          osc.start();
          osc.stop(ctx.currentTime + data[1]);
        } else if (data.length === 4) {
          osc.frequency.setValueAtTime(data[0], ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.start();
          osc.frequency.setValueAtTime(data[2], ctx.currentTime + data[1]);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + data[1] + data[3],
          );
          osc.stop(ctx.currentTime + data[1] + data[3]);
        }
      }
    } catch (e) {
      // Audio block ignored
    }
  };

  // Generate a random Session ID
  const generateNewSessionID = () => {
    const r = Math.floor(1000 + Math.random() * 9000);
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const letter =
      chars[Math.floor(Math.random() * chars.length)] +
      chars[Math.floor(Math.random() * chars.length)];
    return `SPZ-2026-${r}${letter}`;
  };

  // Handle Google Login simulation
  const handleLoginGoogle = () => {
    playSound("click");
    setUser({ name: "Aiz Purikura", isGuest: false });
    setPage(3);
  };

  // Handle Guest simulation
  const handleContinueGuest = () => {
    playSound("click");
    setUser({ name: "Retro Guest", isGuest: true });
    setPage(3);
  };

  // Switch camera access on/off
  const requestCameraAccess = async (): Promise<boolean> => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: false,
      });
      streamRef.current = stream;
      setActiveStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setIsLiveCamera(true);
      playSound("complete");
      return true;
    } catch (err) {
      console.warn(
        "webcam access failed/blocked. Falling back to Simulation Mode.",
        err,
      );
      setHasCameraPermission(false);
      setIsLiveCamera(false);
      return false;
    }
  };

  // Stop camera stream helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setActiveStream(null);
  };

  // Trigger permission allow flow
  const handleAllowAccess = async () => {
    playSound("click");
    const allowed = await requestCameraAccess();
    setPage(6);
  };

  // Trigger startshooting countdown & automated snaps
  const triggerSessionPhotos = () => {
    if (isShooting) return;
    setIsShooting(true);
    setCapturedPhotos([]);
    setCurrentIndex(0);
    takeNextScheduledPhoto(0, []);
  };

  // Run the sequential capture process automatic with flash overlay
  const takeNextScheduledPhoto = (index: number, currentAcc: string[]) => {
    if (index >= photoStripLayout) {
      setCapturedPhotos(currentAcc);
      setIsShooting(false);
      playSound("complete");
      setPage(7); // Go to edit filter
      return;
    }

    setCurrentIndex(index);
    let count = 3;
    setCountdown(count);
    playSound("countdown");

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playSound("countdown");
      } else {
        clearInterval(interval);
        setCountdown(null);

        setIsFlashActive(true);
        playSound("shutter");
        setTimeout(() => setIsFlashActive(false), 300);

        let base64Img = "";

        if (isLiveCamera && videoRef.current && streamRef.current) {
          try {
            const canvasSnap = document.createElement("canvas");
            canvasSnap.width = 640;
            canvasSnap.height = 480;
            const ctx = canvasSnap.getContext("2d");
            if (ctx) {
              const video = videoRef.current;
              const videoW = video.videoWidth;
              const videoH = video.videoHeight;

              if (isMirror) {
                ctx.translate(canvasSnap.width, 0);
                ctx.scale(-1, 1);
              }

              if (videoW && videoH) {
                const targetRatio = 4 / 3;
                const videoRatio = videoW / videoH;

                let sx = 0;
                let sy = 0;
                let sw = videoW;
                let sh = videoH;

                if (videoRatio > targetRatio) {
                  // Video is wider than 4:3 (e.g., 16:9)
                  sw = videoH * targetRatio;
                  sx = (videoW - sw) / 2;
                } else {
                  // Video is taller than 4:3
                  sh = videoW / targetRatio;
                  sy = (videoH - sh) / 2;
                }

                ctx.drawImage(
                  video,
                  sx,
                  sy,
                  sw,
                  sh,
                  0,
                  0,
                  canvasSnap.width,
                  canvasSnap.height,
                );
              } else {
                ctx.drawImage(video, 0, 0, canvasSnap.width, canvasSnap.height);
              }

              base64Img = canvasSnap.toDataURL("image/jpeg");
            }
          } catch (e) {
            base64Img = getRandomCuteSimulationImage();
          }
        } else {
          base64Img = getRandomCuteSimulationImage();
        }

        const updated = [...currentAcc, base64Img];
        setCapturedPhotos(updated);

        setTimeout(() => {
          takeNextScheduledPhoto(index + 1, updated);
        }, 1200);
      }
    }, 1000);
  };

  // Generate gorgeous pixel simulator placeholders
  const getRandomCuteSimulationImage = () => {
    const seeds = [
      "cyberpunk",
      "kawaii",
      "retro",
      "arcadestar",
      "chibi",
      "footballchamp",
      "idol",
      "graduate",
    ];
    const activeSeed =
      seeds[Math.floor(Math.random() * seeds.length)] +
      "-" +
      Math.floor(Math.random() * 100);
    return `https://picsum.photos/seed/${activeSeed}/600/450`;
  };

  // Manual fallback file selector
  const handleUploadClick = () => {
    playSound("click");
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const loadedStr = event.target.result as string;
          if (capturedPhotos.length < photoStripLayout) {
            const updated = [...capturedPhotos, loadedStr];
            setCapturedPhotos(updated);
            setCurrentIndex(updated.length);
            playSound("click");
            if (updated.length === photoStripLayout) {
              setPage(7);
            }
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Drag and Drop simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const loadedStr = event.target.result as string;
          if (capturedPhotos.length < photoStripLayout) {
            const updated = [...capturedPhotos, loadedStr];
            setCapturedPhotos(updated);
            setCurrentIndex(updated.length);
            playSound("click");
            if (updated.length === photoStripLayout) {
              setPage(7);
            }
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // CSS Filter styles compiler
  const getFilterStyle = (f: string, intensity: number) => {
    const val = intensity / 100;
    switch (f) {
      case "B&W":
        return `grayscale(${val})`;
      case "Vintage":
        return `sepia(${0.8 * val}) contrast(${1 + 0.1 * val})`;
      case "Warm":
        return `saturate(${1 + 0.4 * val}) sepia(${0.15 * val}) hue-rotate(${-10 * val}deg)`;
      case "Soft":
        return `brightness(${1 + 0.05 * val}) contrast(${1 - 0.1 * val}) saturate(${1 + 0.1 * val})`;
      case "Tokyo Night":
        return `contrast(${1 + 0.1 * val}) saturate(${1 + 0.3 * val}) hue-rotate(${240 * val}deg)`;
      case "Cyberpunk":
        return `contrast(${1 + 0.3 * val}) hue-rotate(${320 * val}deg) saturate(${1 + 0.5 * val})`;
      case "Film 1998":
        return `contrast(${1 - 0.05 * val}) saturate(${1 + 0.1 * val}) sepia(${0.12 * val})`;
      case "Y2K":
        return `saturate(${1 + 0.8 * val}) contrast(${1 + 0.1 * val}) hue-rotate(${180 * val}deg)`;
      case "Dreamy":
        return `brightness(${1 + 0.1 * val}) contrast(${1 - 0.15 * val}) saturate(${1 + 0.2 * val}) sepia(${0.05 * val})`;
      default:
        return "none";
    }
  };

  // Helper to safely access frame properties (handles both FrameTemplate and CustomFrame)
  const getFrameProp = (prop: "headerTheme" | "decoStyle", fallback: string) => {
    if ("imageData" in selectedFrame) {
      // Custom frame - use fallback values
      return prop === "headerTheme" ? selectedFrame.name : "custom-frame";
    }
    // FrameTemplate
    return (selectedFrame as FrameTemplate)[prop] || fallback;
  };

  // Stitch final result image using browser canvas
  const renderCompositedPhotoStrip = async () => {
    setIsLoadingGemini(true);
    playSound("click");

    const generatedSessionID = generateNewSessionID();
    setSessionID(generatedSessionID);

    const frameHeaderTheme = getFrameProp("headerTheme", "SNAPAZZHOT");
    let geminiObj = {
      commentary: `${frameHeaderTheme} POWER! ⭐`,
      stickers: [
        { text: "KAWAII!", type: "bubble", color: "#FF9A9A" },
        { text: "SUPER STAR", type: "star", color: "#FDB022" },
        { text: "SNAP!", type: "arcade", color: "#EA2D2D" },
      ],
      fortune:
        "Your purikura scale is maximum rare. Best days are coming with neon highscores!",
    };

    try {
      const gRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: selectedTheme,
          layout: `${photoStripLayout} Photos`,
          mood: `A happy arcade snap utilizing ${selectedFrame.name}`,
        }),
      });
      if (gRes.ok) {
        const payload = await gRes.json();
        geminiObj = payload;
        setGeminiResult(payload);
      }
    } catch (e) {
      console.warn("Fallback to default offline metadata presets.", e);
    }

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Determine canvas dimensions based on the selected layout ID
    let canvasWidth = 400;
    let canvasHeight = 1120;

    if (selectedLayoutId === "LAYOUT_A") {
      canvasWidth = 400;
      canvasHeight = 1120;
    } else if (selectedLayoutId === "LAYOUT_B") {
      canvasWidth = 400;
      canvasHeight = 1380;
    } else if (
      selectedLayoutId === "LAYOUT_C" ||
      selectedLayoutId === "LAYOUT_D" ||
      selectedLayoutId === "LAYOUT_E"
    ) {
      canvasWidth = 600;
      canvasHeight = 900;
    } else {
      // Landscape layouts (LAYOUT_F to LAYOUT_K) are size 4x6 LANDSCAPE
      canvasWidth = 900;
      canvasHeight = 600;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Draw frame background
    ctx.fillStyle = selectedFrame.borderColor;
    ctx.fillRect(0, 0, canvasWidth, canvasHeight);

    // Apply background textures or decoration styles
    const decoStyle = getFrameProp("decoStyle", "");
    if (decoStyle.includes("neon") || decoStyle.includes("vhs") || decoStyle.includes("blue") || decoStyle.includes("practice") || decoStyle.includes("lightstick") || decoStyle.includes("rain")) {
      ctx.strokeStyle = "rgba(255, 107, 107, 0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvasWidth; x += 25) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvasHeight);
        ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += 25) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvasWidth, y);
        ctx.stroke();
      }
    } else if (decoStyle.includes("sakura") || decoStyle.includes("soft") || decoStyle.includes("candy") || decoStyle.includes("festival") || decoStyle.includes("magical") || decoStyle.includes("pink")) {
      ctx.fillStyle = "rgba(255, 182, 193, 0.25)";
      for (let i = 0; i < 25; i++) {
        const p1 = Math.sin(i + 1) * 12345;
        const seed1 = p1 - Math.floor(p1);
        const p2 = Math.cos(i + 2) * 54321;
        const seed2 = p2 - Math.floor(p2);
        const p3 = Math.sin(i + 3) * 67890;
        const seed3 = p3 - Math.floor(p3);

        ctx.beginPath();
        ctx.arc(
          seed1 * canvasWidth,
          seed2 * canvasHeight,
          10 + seed3 * 15,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    } else if (decoStyle.includes("football") || decoStyle.includes("stadium") || decoStyle.includes("pitch") || decoStyle.includes("cup") || decoStyle.includes("ultras")) {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let y = 0; y < canvasHeight; y += 80) {
        ctx.fillRect(0, y, canvasWidth, 40);
      }
    } else if (decoStyle.includes("manga") || decoStyle.includes("mecha") || decoStyle.includes("villain")) {
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      for (let y = 0; y < canvasHeight; y += 14) {
        for (let x = 0; x < canvasWidth; x += 14) {
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    } else if (decoStyle.includes("grad") || decoStyle.includes("campus") || decoStyle.includes("diploma") || decoStyle.includes("valedictorian") || decoStyle.includes("confetti")) {
      const confettiColors = ["#fbbf24", "#ffffff", "#f87171", "#60a5fa"];
      for (let i = 0; i < 40; i++) {
        ctx.fillStyle = confettiColors[i % confettiColors.length];
        ctx.save();
        ctx.translate((i * 47) % canvasWidth, (i * 83) % canvasHeight);
        ctx.rotate((i % 6) * 0.35);
        ctx.fillRect(-4, -2, 8, 4);
        ctx.restore();
      }
    } else if (decoStyle.includes("idol") || decoStyle.includes("backstage") || decoStyle.includes("comeback")) {
      ctx.strokeStyle = "rgba(244,114,182,0.24)";
      ctx.lineWidth = 3;
      for (let x = -canvasHeight; x < canvasWidth; x += 55) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + canvasHeight, canvasHeight);
        ctx.stroke();
      }
    }

    // Top Header Titles
    ctx.fillStyle = selectedFrame.textColor;
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(frameHeaderTheme, canvasWidth / 2, 45);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px monospace";
    ctx.fillText("✧ SNAPAZZHOT ARCADE PURIKURA v1.1 ✧", canvasWidth / 2, 70);

    // Load available images onto canvas helper
    const loadedImagesPromises = capturedPhotos.map((url) => {
      return new Promise<HTMLImageElement>((resolve) => {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.onload = () => resolve(img);
        img.onerror = () => resolve(img);
        img.src = url;
      });
    });

    const loadedImgs = await Promise.all(loadedImagesPromises);

    // Frame-stitching utility
    const drawCanvasPhotoSlot = (
      img: HTMLImageElement | undefined,
      x: number,
      y: number,
      w: number,
      h: number,
      idx: number,
    ) => {
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(x, y, w, h);

      if (img && img.width > 0) {
        ctx.save();
        ctx.filter = getCanvasFilterString(selectedFilter, filterIntensity);

        // Emulate object-cover aspect ratio calculation
        const imgRatio = img.width / img.height;
        const slotRatio = w / h;
        let sx = 0,
          sy = 0,
          sw = img.width,
          sh = img.height;

        if (imgRatio > slotRatio) {
          sw = img.height * slotRatio;
          sx = (img.width - sw) / 2;
        } else {
          sh = img.width / slotRatio;
          sy = (img.height - sh) / 2;
        }

        ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
        ctx.restore();
      } else {
        // Fallback placeholder block if snap didn't exist or failed
        ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = "rgba(255, 255, 255, 0.2)";
        ctx.font = "italic 11px monospace";
        ctx.textAlign = "center";
        ctx.fillText(`SLOT #${idx + 1}`, x + w / 2, y + h / 2);
      }

      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 3;
      ctx.strokeRect(x, y, w, h);
    };

    const drawEmptyBlackBlock = (
      label: string,
      x: number,
      y: number,
      w: number,
      h: number,
    ) => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(x, y, w, h);

      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x, y, w, h);

      ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
      ctx.font = "10px monospace";
      ctx.textAlign = "center";
      ctx.fillText(label, x + w / 2, y + h / 2 + 3);
    };

    // Render slots depending on chosen layout ID preset
    switch (selectedLayoutId) {
      case "LAYOUT_A": {
        drawCanvasPhotoSlot(loadedImgs[0], 30, 100, 340, 255, 0);
        drawCanvasPhotoSlot(loadedImgs[1], 30, 380, 340, 255, 1);
        drawCanvasPhotoSlot(loadedImgs[2], 30, 660, 340, 255, 2);
        drawEmptyBlackBlock("SNAPAZZHOT ORIGINAL TALL", 30, 940, 340, 60);
        break;
      }
      case "LAYOUT_B": {
        drawCanvasPhotoSlot(loadedImgs[0], 30, 100, 340, 255, 0);
        drawCanvasPhotoSlot(loadedImgs[1], 30, 380, 340, 255, 1);
        drawCanvasPhotoSlot(loadedImgs[2], 30, 660, 340, 255, 2);
        drawCanvasPhotoSlot(loadedImgs[3], 30, 940, 340, 255, 3);
        drawEmptyBlackBlock("SNAPAZZHOT QUADRANT", 30, 1210, 340, 60);
        break;
      }
      case "LAYOUT_C": {
        drawCanvasPhotoSlot(loadedImgs[0], 40, 130, 245, 245, 0);
        drawCanvasPhotoSlot(loadedImgs[1], 315, 130, 245, 245, 1);
        drawCanvasPhotoSlot(loadedImgs[2], 40, 410, 245, 245, 2);
        drawCanvasPhotoSlot(loadedImgs[3], 315, 410, 245, 245, 3);
        drawEmptyBlackBlock("CHAMPIONS GRID", 40, 685, 520, 50);
        break;
      }
      case "LAYOUT_D": {
        drawCanvasPhotoSlot(loadedImgs[0], 50, 130, 500, 600, 0);
        drawEmptyBlackBlock("SINGLE SHOT PORTRAIT", 50, 755, 500, 50);
        break;
      }
      case "LAYOUT_E": {
        drawCanvasPhotoSlot(loadedImgs[0], 40, 130, 520, 280, 0);
        drawCanvasPhotoSlot(loadedImgs[1], 40, 440, 520, 280, 1);
        drawEmptyBlackBlock("DUAL STACK PORTRAIT", 40, 755, 520, 50);
        break;
      }
      case "LAYOUT_F": {
        drawCanvasPhotoSlot(loadedImgs[0], 120, 100, 660, 380, 0);
        drawEmptyBlackBlock("LANDSCAPE SOLO", 120, 500, 660, 40);
        break;
      }
      case "LAYOUT_G": {
        drawCanvasPhotoSlot(loadedImgs[0], 50, 110, 380, 360, 0);
        drawCanvasPhotoSlot(loadedImgs[1], 470, 110, 380, 360, 1);
        drawEmptyBlackBlock("SIDE BY SIDE LANDSCAPE", 50, 490, 800, 40);
        break;
      }
      case "LAYOUT_H": {
        drawCanvasPhotoSlot(loadedImgs[0], 50, 110, 380, 180, 0);
        drawEmptyBlackBlock("SNAPAZZHOT ARTWORK", 470, 110, 380, 180);
        drawCanvasPhotoSlot(loadedImgs[1], 50, 310, 250, 180, 1);
        drawCanvasPhotoSlot(loadedImgs[2], 325, 310, 250, 180, 2);
        drawCanvasPhotoSlot(loadedImgs[3], 600, 310, 250, 180, 3);
        drawEmptyBlackBlock("★ DUAL STRIP ARTWORK ★", 50, 510, 800, 40);
        break;
      }
      case "LAYOUT_I": {
        drawCanvasPhotoSlot(loadedImgs[0], 50, 110, 380, 180, 0);
        drawCanvasPhotoSlot(loadedImgs[1], 50, 310, 380, 180, 1);
        drawEmptyBlackBlock("ARCHIVE-M ARTWORK", 470, 110, 380, 180);
        drawCanvasPhotoSlot(loadedImgs[2], 470, 310, 380, 180, 2);
        drawEmptyBlackBlock("STATION THREE", 50, 510, 800, 40);
        break;
      }
      case "LAYOUT_J": {
        drawCanvasPhotoSlot(loadedImgs[0], 50, 110, 380, 180, 0);
        drawCanvasPhotoSlot(loadedImgs[1], 50, 310, 380, 180, 1);
        drawCanvasPhotoSlot(loadedImgs[2], 470, 110, 380, 180, 2);
        drawEmptyBlackBlock("RETRO-GLOW", 470, 310, 380, 180);
        drawEmptyBlackBlock("SPECTRUM J", 50, 510, 800, 40);
        break;
      }
      case "LAYOUT_K": {
        drawCanvasPhotoSlot(loadedImgs[0], 50, 110, 380, 180, 0);
        drawCanvasPhotoSlot(loadedImgs[1], 50, 310, 380, 180, 1);
        drawEmptyBlackBlock("VOID SECTIONS", 470, 110, 380, 380);
        drawEmptyBlackBlock("K-SERIES CO", 50, 510, 800, 40);
        break;
      }
    }

    // Draw custom frame image overlay if available (after photos but before text)
    if ("imageData" in selectedFrame && selectedFrame.imageData) {
      const frameImg = new Image();
      frameImg.crossOrigin = "anonymous";
      await new Promise<void>((resolve) => {
        frameImg.onload = () => {
          ctx.drawImage(frameImg, 0, 0, canvasWidth, canvasHeight);
          resolve();
        };
        frameImg.onerror = () => resolve();
        frameImg.src = selectedFrame.imageData;
      });
    }

    const themeStickers = (() => {
      if (decoStyle.includes("football") || decoStyle.includes("stadium") || decoStyle.includes("pitch") || decoStyle.includes("cup") || decoStyle.includes("ultras")) {
        return ["GOAL", "MATCH", "90+", "WIN"];
      }
      if (decoStyle.includes("idol") || decoStyle.includes("backstage") || decoStyle.includes("lightstick") || decoStyle.includes("comeback") || decoStyle.includes("practice")) {
        return ["IDOL", "LIVE", "FAN", "STAR"];
      }
      if (decoStyle.includes("manga")) return ["BANG", "POW", "ACTION", "SPEED"];
      if (decoStyle.includes("mecha")) return ["UNIT", "CORE", "SYNC", "01"];
      if (decoStyle.includes("villain")) return ["DARK", "EDGE", "NOIR", "CUT"];
      if (decoStyle.includes("grad") || decoStyle.includes("campus") || decoStyle.includes("diploma") || decoStyle.includes("valedictorian") || decoStyle.includes("confetti")) {
        return ["CLASS", "2026", "HONOR", "GOLD"];
      }
      if (decoStyle.includes("vhs") || decoStyle.includes("chrome")) return ["VHS", "REC", "PLAY", "RETRO"];
      return ["DREAM", "SOFT", "SNAP", "LOVE"];
    })();

    const drawThemeSticker = (
      text: string,
      x: number,
      y: number,
      angle: number,
      fill: string,
      ink: string,
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.font = "bold 16px monospace";
      const width = Math.max(56, ctx.measureText(text).width + 24);
      ctx.fillStyle = fill;
      ctx.strokeStyle = "rgba(255,255,255,0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-width / 2, -17, width, 34, 10);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = ink;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 0, 1);
      ctx.restore();
    };

    drawThemeSticker(themeStickers[0], 72, 92, -0.22, selectedFrame.textColor || "#ffffff", selectedFrame.borderColor || "#111111");
    drawThemeSticker(themeStickers[1], canvasWidth - 76, 92, 0.18, "#ffffff", selectedFrame.borderColor || "#111111");
    drawThemeSticker(themeStickers[2], 78, canvasHeight - 150, 0.16, "#fbbf24", "#111827");
    drawThemeSticker(themeStickers[3], canvasWidth - 78, canvasHeight - 150, -0.18, selectedFrame.borderColor || "#111111", selectedFrame.textColor || "#ffffff");

    // Bottom decorative/attribution signature text with generated IDs
    const footerY = canvasHeight - 95;

    ctx.fillStyle = selectedFrame.textColor || "#ffffff";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`SESSION ID: ${generatedSessionID}`, canvasWidth / 2, footerY);

    ctx.fillStyle = "#FDB022";
    ctx.font = "bold 13px monospace";
    ctx.fillText(
      `★ ${geminiObj.commentary.toUpperCase()} ★`,
      canvasWidth / 2,
      footerY + 25,
    );

    // Draw interactive cute metadata stickers
    geminiObj.stickers.forEach((st, idx) => {
      ctx.save();
      const stWidth = 100;
      const stHeight = 28;
      const totalWidth = geminiObj.stickers.length * (stWidth + 15) - 15;
      const startX = (canvasWidth - totalWidth) / 2;
      const stX = startX + idx * (stWidth + 15);
      const stY = footerY + 45;

      ctx.fillStyle = st.color;
      ctx.strokeStyle = "#000000";
      ctx.lineWidth = 2.5;

      ctx.beginPath();
      if (ctx.roundRect) {
        ctx.roundRect(stX, stY, stWidth, stHeight, 6);
      } else {
        ctx.rect(stX, stY, stWidth, stHeight);
      }
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "#000000";
      ctx.font = "bold 9px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(st.text, stX + stWidth / 2, stY + stHeight / 2);
      ctx.restore();
    });

    const compositedBase64 = canvas.toDataURL("image/png");
    setFinalCompositedImage(compositedBase64);
    setIsLoadingGemini(false);
    setPage(8);
  };

  const getCanvasFilterString = (f: string, intensity: number) => {
    const val = intensity / 100;
    switch (f) {
      case "B&W":
        return `grayscale(${intensity}%)`;
      case "Vintage":
        return `sepia(${80 * val}%) contrast(${100 + 10 * val}%)`;
      case "Warm":
        return `saturate(${100 + 40 * val}%) sepia(${15 * val}%)`;
      case "Soft":
        return `brightness(${100 + 5 * val}%) contrast(${100 - 10 * val}%)`;
      case "Tokyo Night":
        return `contrast(${100 + 10 * val}%) saturate(${100 + 30 * val}%) hue-rotate(240deg)`;
      case "Cyberpunk":
        return `contrast(${110 + 20 * val}%) saturate(${130 + 20 * val}%) hue-rotate(320deg)`;
      case "Film 1998":
        return `contrast(95%) sepia(${12 * val}%) saturate(105%)`;
      case "Y2K":
        return `saturate(${120 + 60 * val}%) hue-rotate(180deg) contrast(110%)`;
      case "Dreamy":
        return `brightness(110%) contrast(85%) saturate(120%)`;
      default:
        return "none";
    }
  };

  const handleDownloadDisk = () => {
    playSound("shutter");
    const link = document.createElement("a");
    link.download = `snapazzhot-${sessionID || "STRIP"}.png`;
    link.href = finalCompositedImage;
    link.click();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsEmailSending(true);
    playSound("click");

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          photoStrip: finalCompositedImage,
          sessionId: sessionID || "SPZ-2026-ARCADE",
        }),
      });

      const payload = await response.json();
      if (response.ok) {
        setEmailSuccessMessage(
          payload.message || `Photo strip for ${sessionID} sent successfully!`,
        );
        setEmailInput("");
      } else {
        setEmailSuccessMessage(`Error: ${payload.error || "Sending failed"}`);
      }
    } catch (err) {
      setEmailSuccessMessage(
        "SMTP mock dispatch active. Check container server logs!",
      );
    } finally {
      setIsEmailSending(false);
    }
  };

  const resetEntireSession = () => {
    playSound("complete");
    setCapturedPhotos([]);
    setCurrentIndex(0);
    setFinalCompositedImage("");
    setEmailSuccessMessage("");
    setEmailInput("");
    setPage(3);
  };

  return (
    <div
      className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-12 flex flex-col justify-between"
      id="snapaz-root-wrapper"
    >
      {/* Top Navigation Row */}
      <Navbar
        page={page}
        setPage={setPage}
        user={user}
        muted={muted}
        setMuted={setMuted}
        playSound={playSound}
        setActiveModal={setActiveModal}
      />

      {/* Main Pages Flow Rendering logic */}
      <main
        className="flex-1 flex flex-col justify-center items-center py-4"
        id="snapaz-content-container"
      >
        <AnimatePresence mode="wait">
          {page === 1 && (
            <LandingView
              handleLoginGoogle={handleLoginGoogle}
              handleContinueGuest={handleContinueGuest}
            />
          )}

          {page === 3 && (
            <ChooseLayoutView
              framesList={FRAMES_LIST}
              selectedFrame={selectedFrame}
              setSelectedFrame={setSelectedFrame}
              selectedLayoutId={selectedLayoutId}
              setSelectedLayoutId={setSelectedLayoutId}
              photoStripLayout={photoStripLayout}
              setPhotoStripLayout={setPhotoStripLayout}
              categoryFilter={categoryFilter}
              setCategoryFilter={setCategoryFilter}
              playSound={playSound}
              setPage={setPage}
              customFrames={customFrames}
              setCustomFrames={setCustomFrames}
            />
          )}

          {page === 6 && (
            <PhotoSessionPage
              hasCameraPermission={hasCameraPermission}
              requestCameraAccess={requestCameraAccess}
              videoRef={videoRef}
              activeStream={activeStream}
              isLiveCamera={isLiveCamera}
              isMirror={isMirror}
              isFlipped={isFlipped}
              isFlashActive={isFlashActive}
              setIsMirror={setIsMirror}
              setIsFlipped={setIsFlipped}
              fileInputRef={fileInputRef}
              capturedPhotos={capturedPhotos}
              setCapturedPhotos={setCapturedPhotos}
              photoStripLayout={photoStripLayout}
              selectedLayoutId={selectedLayoutId}
              selectedFrame={selectedFrame}
              currentIndex={currentIndex}
              countdown={countdown}
              isShooting={isShooting}
              triggerSessionPhotos={triggerSessionPhotos}
              handleFileChange={handleFileChange}
              handleUploadClick={handleUploadClick}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              playSound={playSound}
              setPage={setPage}
              stopCameraStream={stopCameraStream}
            />
          )}

          {page === 7 && (
            <FilterSelectionPage
              selectedFilter={selectedFilter}
              setSelectedFilter={setSelectedFilter}
              filterIntensity={filterIntensity}
              setFilterIntensity={setFilterIntensity}
              selectedFrame={selectedFrame}
              selectedLayoutId={selectedLayoutId}
              photoStripLayout={photoStripLayout}
              capturedPhotos={capturedPhotos}
              renderCompositedPhotoStrip={renderCompositedPhotoStrip}
              getFilterStyle={getFilterStyle}
              playSound={playSound}
              setPage={setPage}
            />
          )}

          {page === 8 && (
            <ResultPage
              resultTab={resultTab}
              setResultTab={setResultTab}
              finalCompositedImage={finalCompositedImage}
              capturedPhotos={capturedPhotos}
              selectedFilter={selectedFilter}
              filterIntensity={filterIntensity}
              getFilterStyle={getFilterStyle}
              sessionID={sessionID}
              selectedFrame={selectedFrame}
              geminiResult={geminiResult}
              handleDownloadDisk={handleDownloadDisk}
              handleEmailSubmit={handleEmailSubmit}
              emailInput={emailInput}
              setEmailInput={setEmailInput}
              isEmailSending={isEmailSending}
              emailSuccessMessage={emailSuccessMessage}
              resetEntireSession={resetEntireSession}
              playSound={playSound}
              setPage={setPage}
            />
          )}
        </AnimatePresence>
      </main>

      {/* Footer copyright Row */}
      <footer className="w-full mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row md:justify-between items-center gap-6 pb-1">
        <div className="text-[10px] font-pixel text-gray-500 uppercase tracking-widest opacity-80 text-center">
          © 2026 snapazzhot. All Rights Reserved.
        </div>

        <div className="flex flex-wrap justify-center gap-6 md:gap-8 font-pixel text-[10px]">
          <a
            href="#"
            className="text-gray-400 hover:text-white transition-colors uppercase tracking-wider"
          >
            Terms
          </a>
          <a
            href="https://bagibagi.co"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6B6B] font-bold hover:underline uppercase tracking-wider"
          >
            Bagibagi.co ↗
          </a>
          <a
            href="https://azz-portofolio.vercel.app"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FF6B6B] font-bold hover:underline uppercase tracking-wider"
          >
            site by azz ↗
          </a>
        </div>
      </footer>
    </div>
  );
}
