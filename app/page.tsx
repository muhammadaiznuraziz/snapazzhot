'use models/gemini-3.5-flash';
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { Info, ShieldCheck } from 'lucide-react';

import { FrameTemplate, User, GeminiResult, LAYOUT_PRESETS } from '../types/photobooth';
import { LandingView } from '../components/views/LandingView';
import { ChooseLayoutView } from '../components/views/ChooseLayoutView';
import { CameraPermissionPage } from '../components/views/CameraPermissionPage';
import { PhotoSessionPage } from '../components/views/PhotoSessionPage';
import { FilterSelectionPage } from '../components/views/FilterSelectionPage';
import { ResultPage } from '../components/views/ResultPage';
import { Navbar } from '../components/Navbar/Navbar';

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
    decoStyle: "grid-neon"
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
    decoStyle: "metallic-bubble"
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
    decoStyle: "turf-stripes"
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
    decoStyle: "cherry-petals"
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
    decoStyle: "manga-screentone"
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
    decoStyle: "gold-glitter"
  }
];

export default function SnapazPhotobooth() {
  // Navigation: pages 1 to 8
  const [page, setPage] = useState<number>(1);
  const [user, setUser] = useState<User | null>(null);
  
  // Theme state
  const [selectedTheme, setSelectedTheme] = useState<string>("Retro");

  // Layout selections
  const [selectedFrame, setSelectedFrame] = useState<FrameTemplate>(FRAMES_LIST[0]);
  const [selectedLayoutId, setSelectedLayoutId] = useState<string>("LAYOUT_A");
  const [photoStripLayout, setPhotoStripLayout] = useState<number>(3); // Matches LAYOUT_A count (3)
  const [categoryFilter, setCategoryFilter] = useState<string>("All");

  // Modern Audio effect toggler
  const [muted, setMuted] = useState<boolean>(false);

  // Camera permissions & settings
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
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
  const [activeModal, setActiveModal] = useState<"about" | "privacy" | null>(null);

  // Final Results
  const [sessionID, setSessionID] = useState<string>("");
  const [emailInput, setEmailInput] = useState<string>("");
  const [isEmailSending, setIsEmailSending] = useState<boolean>(false);
  const [emailSuccessMessage, setEmailSuccessMessage] = useState<string>("");
  const [resultTab, setResultTab] = useState<"PHOTO STRIP" | "GIF" | "VIDEO">("PHOTO STRIP");

  // Canvas combined result binary
  const [finalCompositedImage, setFinalCompositedImage] = useState<string>("");

  // Gemini customization states
  const [isLoadingGemini, setIsLoadingGemini] = useState<boolean>(false);
  const [geminiResult, setGeminiResult] = useState<GeminiResult>({
    commentary: "ARCADE OVERDRIVE! 🔥",
    stickers: [
      { text: "KAWAII!", type: "bubble", color: "#FF9A9A" },
      { text: "SUPER STAR", type: "star", color: "#FDB022" },
      { text: "SNAP!", type: "arcade", color: "#EA2D2D" }
    ],
    fortune: "Your future rating is EPIC! Keep taking retro snapshots."
  });

  // Reference hooks
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeStream, setActiveStream] = useState<MediaStream | null>(null);

  // Audio helper
  const playSound = (type: 'click' | 'shutter' | 'countdown' | 'complete') => {
    if (muted) return;
    try {
      const frequencies: { [key: string]: number[] } = {
        click: [440, 0.08],
        countdown: [587, 0.12],
        shutter: [1000, 0.4],
        complete: [880, 0.2, 1320, 0.3]
      };
      
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (type === 'shutter') {
        const bufferSize = ctx.sampleRate * frequencies[type][1];
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
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
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + data[1]);
          osc.start();
          osc.stop(ctx.currentTime + data[1]);
        } else if (data.length === 4) {
          osc.frequency.setValueAtTime(data[0], ctx.currentTime);
          gain.gain.setValueAtTime(0.1, ctx.currentTime);
          osc.start();
          osc.frequency.setValueAtTime(data[2], ctx.currentTime + data[1]);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + data[1] + data[3]);
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
    const letter = chars[Math.floor(Math.random() * chars.length)] + chars[Math.floor(Math.random() * chars.length)];
    return `SPZ-2026-${r}${letter}`;
  };

  // Handle Google Login simulation
  const handleLoginGoogle = () => {
    playSound('click');
    setUser({ name: "Aiz Purikura", isGuest: false });
    setPage(3);
  };

  // Handle Guest simulation
  const handleContinueGuest = () => {
    playSound('click');
    setUser({ name: "Retro Guest", isGuest: true });
    setPage(3);
  };

  // Switch camera access on/off
  const requestCameraAccess = async (): Promise<boolean> => {
    try {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user"
        },
        audio: false
      });
      streamRef.current = stream;
      setActiveStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setHasCameraPermission(true);
      setIsLiveCamera(true);
      playSound('complete');
      return true;
    } catch (err) {
      console.warn("webcam access failed/blocked. Falling back to Simulation Mode.", err);
      setHasCameraPermission(false);
      setIsLiveCamera(false);
      return false;
    }
  };

  // Stop camera stream helper
  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setActiveStream(null);
  };

  // Trigger permission allow flow
  const handleAllowAccess = async () => {
    playSound('click');
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
      playSound('complete');
      setPage(7); // Go to edit filter
      return;
    }

    setCurrentIndex(index);
    let count = 3;
    setCountdown(count);
    playSound('countdown');

    const interval = setInterval(() => {
      count -= 1;
      if (count > 0) {
        setCountdown(count);
        playSound('countdown');
      } else {
        clearInterval(interval);
        setCountdown(null);
        
        setIsFlashActive(true);
        playSound('shutter');
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
                
                ctx.drawImage(video, sx, sy, sw, sh, 0, 0, canvasSnap.width, canvasSnap.height);
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
    const seeds = ["cyberpunk", "kawaii", "retro", "arcadestar", "chibi", "footballchamp", "idol", "graduate"];
    const activeSeed = seeds[Math.floor(Math.random() * seeds.length)] + "-" + Math.floor(Math.random() * 100);
    return `https://picsum.photos/seed/${activeSeed}/600/450`;
  };

  // Manual fallback file selector
  const handleUploadClick = () => {
    playSound('click');
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
            playSound('click');
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
            playSound('click');
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

  // Stitch final result image using browser canvas
  const renderCompositedPhotoStrip = async () => {
    setIsLoadingGemini(true);
    playSound('click');

    const generatedSessionID = generateNewSessionID();
    setSessionID(generatedSessionID);

    let geminiObj = {
      commentary: `${selectedFrame.headerTheme} POWER! ⭐`,
      stickers: [
        { text: "KAWAII!", type: "bubble", color: "#FF9A9A" },
        { text: "SUPER STAR", type: "star", color: "#FDB022" },
        { text: "SNAP!", type: "arcade", color: "#EA2D2D" }
      ],
      fortune: "Your purikura scale is maximum rare. Best days are coming with neon highscores!"
    };

    try {
      const gRes = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          theme: selectedTheme,
          layout: `${photoStripLayout} Photos`,
          mood: `A happy arcade snap utilizing ${selectedFrame.name}`
        })
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
    } else if (selectedLayoutId === "LAYOUT_C" || selectedLayoutId === "LAYOUT_D" || selectedLayoutId === "LAYOUT_E") {
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
    if (selectedFrame.decoStyle === "grid-neon") {
      ctx.strokeStyle = "rgba(255, 107, 107, 0.15)";
      ctx.lineWidth = 1;
      for (let x = 0; x < canvasWidth; x += 25) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, canvasHeight); ctx.stroke();
      }
      for (let y = 0; y < canvasHeight; y += 25) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(canvasWidth, y); ctx.stroke();
      }
    } else if (selectedFrame.decoStyle === "cherry-petals") {
      ctx.fillStyle = "rgba(255, 182, 193, 0.25)";
      for (let i = 0; i < 25; i++) {
        const p1 = Math.sin(i + 1) * 12345;
        const seed1 = p1 - Math.floor(p1);
        const p2 = Math.cos(i + 2) * 54321;
        const seed2 = p2 - Math.floor(p2);
        const p3 = Math.sin(i + 3) * 67890;
        const seed3 = p3 - Math.floor(p3);

        ctx.beginPath();
        ctx.arc(seed1 * canvasWidth, seed2 * canvasHeight, 10 + seed3 * 15, 0, Math.PI * 2);
        ctx.fill();
      }
    } else if (selectedFrame.decoStyle === "turf-stripes") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.04)";
      for (let y = 0; y < canvasHeight; y += 80) {
        ctx.fillRect(0, y, canvasWidth, 40);
      }
    }

    // Top Header Titles
    ctx.fillStyle = selectedFrame.textColor;
    ctx.font = "bold 24px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(selectedFrame.headerTheme, canvasWidth / 2, 45);

    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "10px monospace";
    ctx.fillText("✧ SNAPAZZHOT ARCADE PURIKURA v1.1 ✧", canvasWidth / 2, 70);

    // Load available images onto canvas helper
    const loadedImagesPromises = capturedPhotos.map(url => {
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
    const drawCanvasPhotoSlot = (img: HTMLImageElement | undefined, x: number, y: number, w: number, h: number, idx: number) => {
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(x, y, w, h);

      if (img && img.width > 0) {
        ctx.save();
        ctx.filter = getCanvasFilterString(selectedFilter, filterIntensity);
        
        // Emulate object-cover aspect ratio calculation
        const imgRatio = img.width / img.height;
        const slotRatio = w / h;
        let sx = 0, sy = 0, sw = img.width, sh = img.height;
        
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

    const drawEmptyBlackBlock = (label: string, x: number, y: number, w: number, h: number) => {
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

    // Bottom decorative/attribution signature text with generated IDs
    const footerY = canvasHeight - 95;
    
    ctx.fillStyle = selectedFrame.textColor || "#ffffff";
    ctx.font = "12px monospace";
    ctx.textAlign = "center";
    ctx.fillText(`SESSION ID: ${generatedSessionID}`, canvasWidth / 2, footerY);

    ctx.fillStyle = "#FDB022";
    ctx.font = "bold 13px monospace";
    ctx.fillText(`★ ${geminiObj.commentary.toUpperCase()} ★`, canvasWidth / 2, footerY + 25);

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
      case "B&W": return `grayscale(${intensity}%)`;
      case "Vintage": return `sepia(${80 * val}%) contrast(${100 + 10 * val}%)`;
      case "Warm": return `saturate(${100 + 40 * val}%) sepia(${15 * val}%)`;
      case "Soft": return `brightness(${100 + 5 * val}%) contrast(${100 - 10 * val}%)`;
      case "Tokyo Night": return `contrast(${100 + 10 * val}%) saturate(${100 + 30 * val}%) hue-rotate(240deg)`;
      case "Cyberpunk": return `contrast(${110 + 20 * val}%) saturate(${130 + 20 * val}%) hue-rotate(320deg)`;
      case "Film 1998": return `contrast(95%) sepia(${12 * val}%) saturate(105%)`;
      case "Y2K": return `saturate(${120 + 60 * val}%) hue-rotate(180deg) contrast(110%)`;
      case "Dreamy": return `brightness(110%) contrast(85%) saturate(120%)`;
      default: return "none";
    }
  };

  const handleDownloadDisk = () => {
    playSound('shutter');
    const link = document.createElement("a");
    link.download = `snapazzhot-${sessionID || "STRIP"}.png`;
    link.href = finalCompositedImage;
    link.click();
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setIsEmailSending(true);
    playSound('click');

    try {
      const response = await fetch("/api/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: emailInput,
          photoStrip: finalCompositedImage,
          sessionId: sessionID || "SPZ-2026-ARCADE"
        })
      });

      const payload = await response.json();
      if (response.ok) {
        setEmailSuccessMessage(payload.message || `Photo strip for ${sessionID} sent successfully!`);
        setEmailInput("");
      } else {
        setEmailSuccessMessage(`Error: ${payload.error || "Sending failed"}`);
      }
    } catch (err) {
      setEmailSuccessMessage("SMTP mock dispatch active. Check container server logs!");
    } finally {
      setIsEmailSending(false);
    }
  };

  const resetEntireSession = () => {
    playSound('complete');
    setCapturedPhotos([]);
    setCurrentIndex(0);
    setFinalCompositedImage("");
    setEmailSuccessMessage("");
    setEmailInput("");
    setPage(3);
  };

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-12 flex flex-col justify-between" id="snapaz-root-wrapper">
      
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
      <main className="flex-1 flex flex-col justify-center items-center py-4" id="snapaz-content-container">
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
            />
          )}

          {page === 4 && (
            <CameraPermissionPage 
              handleAllowAccess={handleAllowAccess}
              playSound={playSound}
              setPage={setPage}
            />
          )}

          {page === 6 && (
            <PhotoSessionPage 
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
      <footer className="border-t border-white/10 pt-6 mt-12 flex flex-col md:flex-row items-center justify-between text-xs text-gray-500 gap-4" id="snapaz-footer">
        <div>
          <span>© 2026 snapazzhot. All Rights Reserved.</span>
        </div>

        <div className="flex gap-4">
          <a href="#" className="hover:text-white transition-colors">Term of Service</a>
          <a href="https://bagibagi.co" target="_blank" rel="noopener noreferrer" className="text-accent-pink font-bold">Bagibagi.co ↗</a>
          <a href="https://azz-portofolio.vercel.app" target="_blank" rel="noopener noreferrer" className="text-accent-pink font-bold">site code by azz↗</a>
        </div>
      </footer>


      

    </div>
  );
}
