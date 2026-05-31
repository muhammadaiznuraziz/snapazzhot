import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Camera, Trash2, Upload, Volume2, Sparkles } from 'lucide-react';
import { FrameTemplate } from '../../types/photobooth';
import { LayoutRenderer } from '../LayoutRenderer';

interface PhotoSessionPageProps {
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
  selectedFrame: FrameTemplate;
  currentIndex: number;
  countdown: number | null;
  isShooting: boolean;
  triggerSessionPhotos: () => void;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleUploadClick: () => void;
  handleDragOver: (e: React.DragEvent) => void;
  handleDrop: (e: React.DragEvent) => void;
  playSound: (type: 'click' | 'shutter' | 'countdown' | 'complete') => void;
  setPage: (page: number) => void;
  stopCameraStream: () => void;
}

export function PhotoSessionPage({
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
  stopCameraStream
}: PhotoSessionPageProps) {

  useEffect(() => {
    const el = videoRef.current;
    if (el && activeStream && isLiveCamera) {
      el.srcObject = activeStream;
      el.play().catch(err => {
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
      className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      id="view-photo-session"
    >
      {/* Left Column Viewfinder casing */}
      <div className="lg:col-span-7 flex flex-col gap-4">
        
        {/* Viewfinder block box */}
        <div className="w-full aspect-[4/3] bg-black border-2 border-white/10 rounded-3xl relative overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.4)]" style={{ borderRadius: "24px" }}>
          
          {/* Viewfinder Corner HUD Accents */}
          <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/30 rounded-tl-md z-10 pointer-events-none" />
          <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/30 rounded-tr-md z-10 pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/30 rounded-bl-md z-10 pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/30 rounded-br-md z-10 pointer-events-none" />

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
              <div className="absolute top-6 left-6 font-pixel text-[8px] bg-[#EA2D2D]/20 border border-[#EA2D2D]/40 text-[#FF9A9A] px-2.5 py-1 rounded animate-pulse tracking-wider">
                SIMULATOR FEED ACTIVE
              </div>
              <Volume2 size={24} className="text-[#FF9A9A] animate-bounce mb-3" />
              <span className="font-pixel text-[10px] text-[#FF9A9A] tracking-wider uppercase">TAP THE BUTTONS TO SNAP!</span>
            </div>
          )}

          
          {/* Countdown Big Overlay Text indicator */}
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
                  transition={{ type: 'spring', stiffness: 350, damping: 15 }}
                  className="text-9xl font-pixel text-[#EA2D2D] text-sticker drop-shadow-[0_0_35px_rgba(234,45,45,0.6)]"
                >
                  {countdown}
                </motion.h1>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-[#111111] border border-white/10 p-4 rounded-2xl shadow-inner">
          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => { playSound('click'); setIsMirror(!isMirror); }}
              className={`px-4 py-2.5 rounded-xl border font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 select-none ${
                isMirror 
                  ? "bg-[#EA2D2D]/15 border-[#EA2D2D] text-white shadow-[0_0_12px_rgba(234,45,45,0.25)] font-bold" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Mirror {isMirror ? "ON" : "OFF"}
            </button>
            <button
              type="button"
              onClick={() => { playSound('click'); setIsFlipped(!isFlipped); }}
              className={`px-4 py-2.5 rounded-xl border font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 select-none ${
                isFlipped 
                  ? "bg-[#EA2D2D]/15 border-[#EA2D2D] text-white shadow-[0_0_12px_rgba(234,45,45,0.25)] font-bold" 
                  : "bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              Flip {isFlipped ? "ON" : "OFF"}
            </button>

            <button
              type="button"
              onClick={triggerSessionPhotos}
              disabled={isShooting}
              className={`px-6 py-2.5 bg-gradient-to-r from-[#EA2D2D] to-rose-600 hover:from-rose-600 hover:to-[#EA2D2D] text-white font-black uppercase text-[10px] tracking-widest rounded-xl hover-glow transition-all duration-200 cursor-pointer text-center flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(234,45,45,0.3)] ${
                isShooting ? "opacity-50 cursor-not-allowed" : "active:scale-95 hover:scale-[1.02]"
              }`}
              style={{ borderRadius: "12px" }}
            >
              <Camera size={14} className="shrink-0 text-white" />
              <span className="leading-none">{isShooting ? "RECORDING..." : "CAPTURE"}</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            <input 
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
            <button
              type="button"
              onClick={handleUploadClick}
              className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-xl flex items-center gap-2 font-mono text-[10px] uppercase tracking-wider transition-all duration-200 cursor-pointer active:scale-95 select-none"
            >
              <Upload size={13} className="text-[#FF9A9A]" />
              Upload Image
            </button>
          </div>
        </div>
      </div>

      {}
      <div className="lg:col-span-5 flex flex-col gap-6" onDragOver={handleDragOver} onDrop={handleDrop}>

        <div className="bg-[#111111] border border-white/10 p-5 rounded-2xl flex flex-col gap-5 shadow-[0_15px_35px_rgba(0,0,0,0.3)]">
          
          {/* Inventory Tracker Title */}
          <div className="flex items-center justify-between pb-3 border-b border-white/5">
            <span className="font-pixel text-[10px] text-gray-400 tracking-wider uppercase">INVENTORY TRACKER</span>
            <span className="font-pixel text-[9px] text-[#EA2D2D] bg-[#EA2D2D]/12 border border-[#EA2D2D]/20 px-2.5 py-0.5 rounded-full">
              {capturedPhotos.length} / {photoStripLayout} SHOTS
            </span>
          </div>

          {/* Realtime Layout Shape Preview Mockup */}
          <div className="bg-zinc-950 p-4 rounded-xl border border-white/5 flex flex-col items-center justify-center relative overflow-hidden group">
            <span className="font-pixel text-[8px] text-[#FF9A9A] mb-3.5 uppercase block self-start tracking-wider flex items-center gap-1">
              <Sparkles size={10} className="animate-spin" />
              LIVE PRINT BLUEPRINT
            </span>
            <div className="w-full max-w-[125px] shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-transform duration-500 group-hover:rotate-1">
              <LayoutRenderer
                layoutId={selectedLayoutId}
                borderColor={selectedFrame.borderColor}
                textColor={selectedFrame.textColor}
                headerTheme={selectedFrame.headerTheme}
                photos={capturedPhotos}
                isRecordingMode={isShooting}
                activeSlotIndex={currentIndex}
              />
            </div>
          </div>

          {/* LARGE IN-SCREEN ACTION TRIGGER BUTTONS */}
          <div className="mt-1 flex flex-col gap-3">
            {capturedPhotos.length > 0 && (
              <button
                type="button"
                onClick={() => { playSound('complete'); setPage(7); }}
                className="w-full py-4 bg-white/5 border border-white/10 hover:border-[#EA2D2D]/35 hover:text-[#FF9A9A] text-white rounded-xl text-center text-xs font-bold hover:bg-white/10 transition-all duration-200 active:scale-[0.98] uppercase tracking-widest shadow-md"
                style={{ borderRadius: "14px" }}
              >
                Proceed to filters ({capturedPhotos.length} shot)
              </button>
            )}
          </div>
        </div>

      </div>
      
      {/* Reset to previous page */}
      <div className="lg:col-span-12 mt-4 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => { stopCameraStream(); playSound('click'); setPage(5); }}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1.5 font-mono transition-all duration-200 cursor-pointer group hover:translate-x-0.5"
        >
          <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> 
          BACK TO CAMERA SYNC
        </button>
      </div>
    </motion.div>
  );
}