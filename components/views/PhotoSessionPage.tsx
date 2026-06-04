import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Camera,
  Upload,
  Volume2,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  Zap,
} from "lucide-react";
import { CustomFrame, FrameTemplate } from "../../types/photobooth";
import { LayoutRenderer } from "../LayoutRenderer";

interface PhotoSessionPageProps {
  hasCameraPermission: boolean | null;
  requestCameraAccess: () => Promise<boolean>;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  activeStream: MediaStream | null;
  isLiveCamera: boolean;
  isMirror: boolean;
  isFlipped: boolean;
  isFlashActive: boolean;
  setIsMirror: (mirror: boolean) => void;
  setIsFlipped: (flipped: boolean) => void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
  capturedPhotos: string[];
  setCapturedPhotos: (photos: string[]) => void;
  photoStripLayout: number;
  selectedLayoutId: string;
  selectedFrame: FrameTemplate | CustomFrame;
  currentIndex: number;
  countdown: number | null;
  isShooting: boolean;
  triggerSessionPhotos: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadClick: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  playSound: (type: "click" | "shutter" | "countdown" | "complete") => void;
  setPage: (page: number) => void;
  stopCameraStream: () => void;
}

export function PhotoSessionPage({
  hasCameraPermission,
  requestCameraAccess,
  videoRef,
  activeStream,
  isLiveCamera,
  isMirror,
  isFlipped,
  isFlashActive,
  setIsMirror,
  setIsFlipped,
  fileInputRef,
  capturedPhotos,
  setCapturedPhotos,
  photoStripLayout,
  selectedLayoutId,
  selectedFrame,
  currentIndex,
  countdown,
  isShooting,
  triggerSessionPhotos,
  handleFileChange,
  handleUploadClick,
  handleDragOver,
  handleDrop,
  playSound,
  setPage,
  stopCameraStream,
}: PhotoSessionPageProps) {
  useEffect(() => {
    if (hasCameraPermission === null) {
      requestCameraAccess().catch(() => {
        // Fallback handled by parent state
      });
    }
  }, [hasCameraPermission, requestCameraAccess]);

  useEffect(() => {
    const el = videoRef.current;
    if (el && activeStream && isLiveCamera) {
      el.srcObject = activeStream;
      el.play().catch((err) => {
        console.warn("Autoplay was prevented by browser security.", err);
      });
    }
  }, [videoRef, activeStream, isLiveCamera]);

  return (
    <motion.div
      key="page-session"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col gap-6 px-2 md:px-4 select-none"
      id="view-photo-session"
    >
      {/* Small modal ketika akses kamera ditolak */}
      <AnimatePresence>
        {hasCameraPermission === false && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            className="fixed inset-0 z-[80] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl p-5 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#EA2D2D]/15 border border-[#EA2D2D]/30 flex items-center justify-center">
                    <ShieldCheck className="text-[#FF9A9A]" size={20} />
                  </div>
                  <div>
                    <div className="font-pixel text-[10px] text-[#FF9A9A] tracking-widest uppercase">
                      CAMERA ACCESS
                    </div>
                    <h3 className="text-white font-black uppercase leading-tight text-lg">
                      DENIED
                    </h3>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-sm mt-3 leading-relaxed">
                Izin akses ditolak. Kamu tetap bisa pakai simulator.
              </p>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={async () => {
                    await requestCameraAccess();
                  }}
                  className="flex-1 px-4 py-3 bg-gradient-to-br from-[#EA2D2D] to-[#FF6B6B] text-white font-bold rounded-xl shadow-xl transition-all cursor-pointer active:scale-[0.98]"
                >
                  ALLOW ACCESS & TRY AGAIN
                </button>

                <button
                  type="button"
                  onClick={() => {
                    // simulator is already used when isLiveCamera === false
                  }}
                  className="flex-1 px-4 py-3 bg-white/5 border border-white/10 text-gray-300 font-medium rounded-xl transition-all cursor-pointer hover:text-white active:scale-[0.98]"
                >
                  USE SIMULATOR
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN TWO-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* LEFT COLUMN: VIEWFINDER & CONTROL BUTTONS BELOW IT */}
        <div className="lg:col-span-8 flex flex-col gap-5">
          {/* VIEWFINDER SCREEN */}
          <div
            className="w-full aspect-[4/3] bg-black border-4 border-white rounded-3xl relative overflow-hidden shadow-[0_15px_45px_rgba(0,0,0,0.6)]"
            style={{ borderRadius: "24px" }}
          >
            {/* Viewfinder Corner HUD Accents */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-md z-10 pointer-events-none" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-md z-10 pointer-events-none" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-md z-10 pointer-events-none" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-md z-10 pointer-events-none" />

            {/* LIVE CAMERA OR SIMULATOR VIEW */}
            {isLiveCamera ? (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`absolute inset-0 w-full h-full object-cover transition-all ${
                  isMirror ? "scale-x-[-1]" : ""
                } ${isFlipped ? "scale-y-[-1]" : ""}`}
              />
            ) : (
              <div className="absolute inset-0 w-full h-full bg-gradient-to-br from-zinc-950 via-neutral-900 to-zinc-950 flex flex-col justify-center items-center p-6 text-center select-none">
                <div className="absolute top-16 left-6 font-pixel text-[8px] bg-[#EA2D2D]/20 border border-[#EA2D2D]/40 text-[#FF9A9A] px-2.5 py-1 rounded animate-pulse tracking-wider">
                  SIMULATOR FEED ACTIVE
                </div>
                <Volume2
                  size={24}
                  className="text-[#FF9A9A] animate-bounce mb-3"
                />
                <span className="font-pixel text-[10px] text-[#FF9A9A] tracking-wider uppercase">
                  TAP CAPTURE TO START SNAP SHOTS!
                </span>
              </div>
            )}

            {/* OVERLAY RETICLE TARGET (CROSSHAIR) DI TENGAH */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
              <div className="w-16 h-16 border border-white/40 rounded-full flex items-center justify-center relative">
                <div className="absolute w-6 h-[1px] bg-white/40" />
                <div className="absolute h-6 w-[1px] bg-white/40" />
              </div>
            </div>

            {/* TOP FLOATING CONTROL BAR INSIDE VIEWFINDER */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between pointer-events-none z-20">
              {/* REC Badge */}
              <div className="flex items-center gap-1.5 bg-[#EA2D2D] text-white font-pixel text-[9px] px-2.5 py-1.5 rounded-md border border-black shadow-[2px_2px_0px_rgba(0,0,0,1)] pointer-events-auto">
                <span className="w-2 h-2 rounded-full bg-white animate-ping" />
                <span>REC</span>
              </div>

              {/* Action Pills Bar */}
              <div className="flex items-center gap-2 bg-black/75 backdrop-blur-md px-2 py-1.5 rounded-full border border-white/20 shadow-lg pointer-events-auto">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setIsMirror(!isMirror);
                  }}
                  className={`px-3 py-1 rounded-full text-[8px] font-pixel uppercase tracking-widest transition-colors flex items-center gap-1 ${
                    isMirror
                      ? "bg-[#00f0ff] text-black font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <RefreshCw size={8} />
                  Mirror
                </button>

                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setIsFlipped(!isFlipped);
                  }}
                  className={`px-3 py-1 rounded-full text-[8px] font-pixel uppercase tracking-widest transition-colors ${
                    isFlipped
                      ? "bg-[#00f0ff] text-black font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  Flip
                </button>

                <button
                  type="button"
                  className={`px-3 py-1 rounded-full text-[8px] font-pixel uppercase tracking-widest transition-colors flex items-center gap-0.5 ${
                    isFlashActive
                      ? "bg-grey-400 text-black font-bold"
                      : "text-white/60 hover:text-white"
                  }`}
                >
                  <Zap size={8} />
                  Flash
                </button>

                <div className="px-3 py-1 rounded-full text-[8px] font-pixel bg-green-500/20 text-green-400 border border-green-500/30 uppercase tracking-widest">
                  Live
                </div>
              </div>
            </div>

            {/* BOTTOM HUD SPECIFICATIONS IN VIEWFINDER */}
            <div className="absolute bottom-4 inset-x-4 flex justify-between pointer-events-none z-20">
              <span className="font-mono text-[9px] bg-black/60 text-grey-400 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">
                ISO 800
              </span>
              <span className="font-mono text-[9px] bg-black/60 text-green-400 px-2 py-0.5 rounded border border-white/10 uppercase tracking-widest">
                [ FACE ]
              </span>
            </div>

            {/* Countdown Overlay Text */}
            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-40 select-none"
                >
                  <motion.h1
                    key={countdown}
                    initial={{ scale: 0.2, opacity: 0, rotate: -15 }}
                    animate={{ scale: 1.2, opacity: 1, rotate: 0 }}
                    exit={{ scale: 2.2, opacity: 0, y: -20 }}
                    transition={{ type: "spring", stiffness: 350, damping: 15 }}
                    className="text-9xl font-pixel text-[#EA2D2D] text-sticker drop-shadow-[0_0_35px_rgba(234,45,45,0.6)]"
                  >
                    {countdown}
                  </motion.h1>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LARGE BOTTOM ROW ACTION BUTTONS (UPLOAD & CAPTURE) */}
          <div className="grid grid-cols-5 gap-4">
            {/* Input file sembunyi */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            {/* UPLOAD BUTTON (2/5 dari lebar) */}
            <button
              type="button"
              onClick={handleUploadClick}
              className="col-span-2 py-5 bg-[#EA2D2D] hover:bg-[#ff4444] text-white border-4 border-black rounded-2xl flex items-center justify-center gap-3 font-pixel text-sm uppercase tracking-widest shadow-[5px_5px_0px_#000000] cursor-pointer transition-transform active:scale-95 active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Upload size={18} strokeWidth={2.5} />
              <span>UPLOAD</span>
            </button>

            {/* CAPTURE BUTTON (3/5 dari lebar) */}
            <button
              type="button"
              onClick={triggerSessionPhotos}
              disabled={isShooting}
              className={`col-span-3 py-5 bg-[#b1b1b1] hover:bg-[#ffb9b9] text-black border-4 border-black rounded-2xl flex items-center justify-center gap-3 font-pixel text-sm uppercase tracking-widest shadow-[5px_5px_0px_#000000] cursor-pointer transition-transform ${
                isShooting
                  ? "opacity-60 cursor-not-allowed"
                  : "active:scale-95 active:translate-x-[2px] active:translate-y-[2px]"
              }`}
            >
              <Camera size={20} strokeWidth={2.5} className="text-black" />
              <span>{isShooting ? "RECORDING..." : "CAPTURE"}</span>
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: INVENTORY CARD (Live Strip Preview Blueprints) */}
        <div
          className="lg:col-span-4 flex flex-col gap-4"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
        >
          {/* INDIE BLUE GAME STYLE PANEL CONTAINER */}
          <div className="bg-[#414141] border-4 border-black p-5 rounded-2xl flex flex-col gap-5 shadow-[8px_8px_0px_#000000] h-full justify-between">
            <div>
              {/* Inventory Header */}
              <div className="flex items-center justify-between pb-4 border-b-2 border-black/30">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-[#4d4d4d] rotate-45 border-2 border-black shrink-0" />
                  <span className="font-pixel text-[13px] text-white tracking-widest font-black uppercase">
                    INVENTORY
                  </span>
                </div>
                <span className="font-pixel text-[10px] text-white bg-grey-500 border-2 border-black px-2 py-0.5 rounded-md shadow-[2px_2px_0px_#000000]">
                  {capturedPhotos.length}/{photoStripLayout}
                </span>
              </div>

              {/* Realtime Layout Shape Preview Mockup */}
              <div className="bg-black/40 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group mt-4">
                <span className="font-pixel text-[8px] text-[#ffffff] mb-3.5 uppercase block self-start tracking-wider flex items-center gap-1.5">
                  <Sparkles size={10} className="animate-spin text-[#ffffff]" />
                  LIVE PRINT BLUEPRINT
                </span>

                <div className="w-full max-w-[150px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:rotate-1">
                  <LayoutRenderer
                    layoutId={selectedLayoutId}
                    borderColor={selectedFrame.borderColor}
                    textColor={selectedFrame.textColor}
                    headerTheme={
                      "imageData" in selectedFrame
                        ? selectedFrame.name
                        : (selectedFrame as FrameTemplate).headerTheme
                    }
                    photos={capturedPhotos}
                    isRecordingMode={isShooting}
                    activeSlotIndex={currentIndex}
                    decoStyle={
                      "imageData" in selectedFrame
                        ? "custom-frame"
                        : (selectedFrame as FrameTemplate).decoStyle
                    }
                    customFrameImage={
                      "imageData" in selectedFrame
                        ? selectedFrame.imageData
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>

            {/* PROCEED TRIGGER ACTIONS */}
            <div className="mt-4">
              {capturedPhotos.length > 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    playSound("complete");
                    setPage(7);
                  }}
                  className="w-full py-4 bg-green-500 hover:bg-green-400 text-black font-pixel font-black text-xs border-4 border-black rounded-xl text-center transition-all active:scale-95 shadow-[4px_4px_0px_#000000] uppercase tracking-widest"
                >
                  PROCEED TO FILTERS ({capturedPhotos.length} SHOTS)
                </button>
              ) : (
                <div className="text-center py-4 text-[10px] font-pixel text-white/40 border-2 border-dashed border-white/10 rounded-xl uppercase tracking-wider">
                  Need at least 1 photo to proceed
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
