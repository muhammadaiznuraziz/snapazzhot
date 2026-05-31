import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { 
  Award, Download, Instagram, Mail, RefreshCw, Share2, 
  Twitter, Volume2, Video, Archive,
  CheckCircle2, BellRing, Loader2, PackageCheck
} from 'lucide-react';
import { FrameTemplate, GeminiResult } from '../../types/photobooth';

interface ResultPageProps {
  resultTab: "PHOTO STRIP" | "GIF" | "VIDEO";
  setResultTab: (tab: "PHOTO STRIP" | "GIF" | "VIDEO") => void;
  finalCompositedImage: string;
  capturedPhotos: string[];
  selectedFilter: string;
  filterIntensity: number;
  getFilterStyle: (f: string, i: number) => string;
  sessionID: string;
  selectedFrame: FrameTemplate;
  geminiResult: GeminiResult;
  handleDownloadDisk: () => void;
  handleEmailSubmit: (e: React.FormEvent) => void;
  emailInput: string;
  setEmailInput: (v: string) => void;
  isEmailSending: boolean;
  emailSuccessMessage: string;
  resetEntireSession: () => void;
  playSound: (type: 'click' | 'shutter' | 'countdown' | 'complete') => void;
  setPage: (page: number) => void;
}

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
  geminiResult,
  handleDownloadDisk,
  handleEmailSubmit,
  emailInput,
  setEmailInput,
  isEmailSending,
  emailSuccessMessage,
  resetEntireSession,
  playSound,
  setPage
}: ResultPageProps) {
  
  const [toastNotification, setToastNotification] = useState<string | null>(null);
  const [isPlayingReel, setIsPlayingReel] = useState(false);
  const [activeReelIndex, setActiveReelIndex] = useState(0);
  const [isGeneratingZip, setIsGeneratingZip] = useState(false);
  const [zipProgress, setZipProgress] = useState<string>('');

  const triggerToast = (message: string) => {
    setToastNotification(message);
  };

  useEffect(() => {
    if (toastNotification) {
      const timer = setTimeout(() => setToastNotification(null), 3500);
      return () => clearTimeout(timer);
    }
  }, [toastNotification]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingReel && capturedPhotos.length > 0) {
      interval = setInterval(() => {
        setActiveReelIndex(prev => (prev + 1) % capturedPhotos.length);
      }, 500);
    }
    return () => clearInterval(interval);
  }, [isPlayingReel, capturedPhotos]);

  // ─── Generate WebM video reel from captured photos via Canvas + MediaRecorder ───
  const generateWebMReel = (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!capturedPhotos.length) { resolve(null); return; }

      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      if (!ctx) { resolve(null); return; }

      // Check MediaRecorder support
      const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
        ? 'video/webm;codecs=vp9'
        : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
          ? 'video/webm;codecs=vp8'
          : 'video/webm';

      if (!window.MediaRecorder) { resolve(null); return; }

      const stream = canvas.captureStream(24);
      const recorder = new MediaRecorder(stream, { mimeType, videoBitsPerSecond: 2_500_000 });
      const chunks: Blob[] = [];

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data); };
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        resolve(blob);
      };

      recorder.start(100);

      const filterStyle = getFilterStyle(selectedFilter, filterIntensity);
      let photoIdx = 0;
      const FRAME_DURATION_MS = 900; // 0.9s per photo

      // Draw a "title card" first
      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = selectedFrame.borderColor;
      ctx.font = 'bold 28px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('SNAPAZZHOT', canvas.width / 2, canvas.height / 2 - 20);
      ctx.fillStyle = '#ffffff88';
      ctx.font = '14px monospace';
      ctx.fillText(selectedFrame.headerTheme, canvas.width / 2, canvas.height / 2 + 20);

      const showNextPhoto = () => {
        if (photoIdx >= capturedPhotos.length) {
          // End card
          ctx.fillStyle = '#0a0a0a';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#ffffff44';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`SESSION: ${sessionID || 'SPZ-2026'}`, canvas.width / 2, canvas.height / 2);
          setTimeout(() => recorder.stop(), 600);
          return;
        }

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          ctx.filter = filterStyle;
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          ctx.filter = 'none';

          // Overlay: frame number badge
          ctx.fillStyle = 'rgba(0,0,0,0.5)';
          ctx.fillRect(10, canvas.height - 36, 90, 26);
          ctx.fillStyle = selectedFrame.borderColor;
          ctx.font = 'bold 11px monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`SHOT ${photoIdx + 1}/${capturedPhotos.length}`, 16, canvas.height - 18);

          photoIdx++;
          setTimeout(showNextPhoto, FRAME_DURATION_MS);
        };
        img.onerror = () => { photoIdx++; setTimeout(showNextPhoto, FRAME_DURATION_MS); };
        img.src = capturedPhotos[photoIdx];
      };

      // Start after 600ms title card
      setTimeout(showNextPhoto, 600);
    });
  };

  // ─── Main ZIP generation function ───
  const handleDownloadZip = async () => {
    if (isGeneratingZip) return;
    setIsGeneratingZip(true);
    playSound('click');

    try {
      // Dynamically import jszip to keep initial bundle small
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // ── 1. Photo Strip PNG ──
      setZipProgress('Adding photo strip...');
      if (finalCompositedImage) {
        const stripBase64 = finalCompositedImage.split(',')[1];
        zip.file('photostrip.png', stripBase64, { base64: true });
      }

      // ── 2. Individual captured photos ──
      setZipProgress('Packaging individual photos...');
      const photosFolder = zip.folder('photos');
      capturedPhotos.forEach((photo, i) => {
        const isPng = photo.startsWith('data:image/png');
        const base64Data = photo.split(',')[1];
        const ext = isPng ? 'png' : 'jpg';
        photosFolder?.file(`photo_${String(i + 1).padStart(2, '0')}.${ext}`, base64Data, { base64: true });
      });

      // ── 3. Animated WebM video reel ──
      setZipProgress('Rendering video reel (takes a few seconds)...');
      triggerToast('Recording your reel video...');
      const videoBlob = await generateWebMReel();
      if (videoBlob) {
        const videoBuffer = await videoBlob.arrayBuffer();
        zip.file('reel.webm', videoBuffer);
      }

      // ── 4. README.txt ──
      const readmeTxt = [
        `SNAPAZZHOT PURIKURA PACKAGE`,
        `Session: ${sessionID || 'SPZ-2026'}`,
        `Frame Design: ${selectedFrame.name}`,
        `Filter Applied: ${selectedFilter}`,
        `Photos Captured: ${capturedPhotos.length}`,
        ``,
        `FILES INCLUDED:`,
        `  photostrip.png  — Full composited photo strip (print-ready)`,
        `  reel.webm       — Animated video reel of all your shots`,
        `  photos/         — Individual captured photos`,
        ``,
        `Play reel.webm in any modern browser or VLC.`,
        `© 2026 snapazzhot. Tokyo Purikura meets Arcade.`,
      ].join('\n');
      zip.file('README.txt', readmeTxt);

      // ── 5. Generate & download ──
      setZipProgress('Compressing ZIP...');
      const zipBlob = await zip.generateAsync(
        { type: 'blob', compression: 'DEFLATE', compressionOptions: { level: 6 } },
        (meta) => setZipProgress(`Compressing... ${Math.round(meta.percent)}%`)
      );

      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.download = `snapazzhot-${sessionID || 'STRIP'}.zip`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);

      playSound('complete');
      triggerToast('ZIP downloaded! Check your downloads folder 🎉');

    } catch (err) {
      console.error('ZIP generation error:', err);
      triggerToast('ZIP failed. Try saving individually.');
    } finally {
      setIsGeneratingZip(false);
      setZipProgress('');
    }
  };

  return (
    <motion.div 
      key="page-result"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start relative select-none"
      id="view-results"
    >
      
      {/* Toast Notification */}
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
              <span className="font-pixel text-[8px] text-[#FF9A9A] block uppercase tracking-widest">ARCADE NOTIFICATION</span>
              <span className="text-xs text-white font-mono font-bold">{toastNotification}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* LEFT COLUMN: Preview Tabs */}
      <div className="lg:col-span-6 flex flex-col items-center gap-6">
        
        {/* Sliding Tab Switcher */}
        <LayoutGroup id="result-page-tabs">
          <div className="bg-zinc-950 border border-white/10 p-1.5 rounded-xl flex w-full relative z-10 shadow-inner">
            {(["PHOTO STRIP", "GIF", "VIDEO"] as const).map((tab) => {
              const isActive = resultTab === tab;
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => { 
                    playSound('click'); 
                    setResultTab(tab); 
                    setIsPlayingReel(false); 
                  }}
                  className="flex-1 py-3.5 rounded-lg text-center cursor-pointer font-pixel text-[9px] relative tracking-widest uppercase transition-colors"
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeResultTab"
                      className="absolute inset-0 bg-[#EA2D2D] rounded-lg shadow-[0_0_15px_rgba(234,45,45,0.4)]"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <span className={`relative z-10 transition-colors duration-200 ${isActive ? 'text-white font-black' : 'text-gray-500 hover:text-white'}`}>
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
              className="relative shadow-[0_25px_60px_rgba(0,0,0,0.8)] w-full max-w-[210px] rounded-xl overflow-hidden hover:scale-105 transition-transform duration-500 group cursor-zoom-in"
            >
              {finalCompositedImage ? (
                <>
                  <img 
                    src={finalCompositedImage} 
                    className="w-full object-contain max-h-[460px]" 
                    alt="snapazzhot Purikura Final strip" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-white/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </>
              ) : (
                <div className="h-96 w-full bg-zinc-950 flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="text-[#EA2D2D] animate-spin" size={24} />
                  <span className="text-gray-400 font-pixel text-[8px] animate-pulse">Compiling photo strip...</span>
                </div>
              )}
            </motion.div>
          )}

          {/* GIF (looping slideshow) tab */}
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

          {/* Video Reel tab */}
          {resultTab === "VIDEO" && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-64 h-80 bg-zinc-950 border-2 border-white/10 rounded-2xl overflow-hidden flex flex-col justify-between p-4 relative shadow-2xl"
            >
              <div className="absolute top-3 left-3 font-pixel text-[7px] bg-indigo-500 text-white px-2 py-1 rounded z-10 uppercase tracking-widest shadow-md flex items-center gap-1">
                <Video size={10} className="animate-pulse" />
                <span>MP4 REEL MODE</span>
              </div>
              
              <div className="flex-1 flex flex-col justify-center items-center gap-3 text-center p-2 relative">
                {isPlayingReel && capturedPhotos.length > 0 ? (
                  <div className="absolute inset-0 w-full h-full bg-black">
                    <img 
                      src={capturedPhotos[activeReelIndex]} 
                      style={{ filter: getFilterStyle(selectedFilter, filterIntensity) }}
                      className="w-full h-full object-cover" 
                      alt="Reel frame" 
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-end justify-center gap-1 bg-black/60 py-1.5 px-3 rounded-lg backdrop-blur-sm">
                      <div className="h-4 w-1 bg-[#EA2D2D] animate-[pulse_0.8s_infinite]" />
                      <div className="h-6 w-1 bg-[#EA2D2D] animate-[pulse_0.5s_infinite_0.1s]" />
                      <div className="h-3 w-1 bg-[#EA2D2D] animate-[pulse_0.7s_infinite_0.2s]" />
                      <div className="h-5 w-1 bg-[#EA2D2D] animate-[pulse_0.6s_infinite_0.3s]" />
                      <span className="font-pixel text-[7px] text-white ml-2">SYNTH_WAVE.MP3</span>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <Volume2 size={20} className="animate-pulse" />
                    </div>
                    <div>
                      <span className="font-pixel text-[9px] text-white block uppercase tracking-wider">REEL READY TO EXPORT</span>
                      <p className="text-[9px] text-gray-500 mt-1 max-w-[180px] leading-relaxed mx-auto font-sans">
                        Press PLAY to preview · Download ZIP to get the real WebM video file.
                      </p>
                    </div>
                  </>
                )}
              </div>

              <motion.button 
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={() => { 
                  playSound('click'); 
                  setIsPlayingReel(!isPlayingReel);
                  triggerToast(isPlayingReel ? "Reel paused." : "Playing preview reel!");
                }}
                className={`w-full py-3 ${isPlayingReel ? 'bg-rose-600' : 'bg-indigo-600 hover:bg-indigo-700'} text-white font-pixel text-[8px] tracking-widest uppercase rounded-lg transition-colors cursor-pointer`}
              >
                {isPlayingReel ? "PAUSE REEL" : "PLAY REEL"}
              </motion.button>
            </motion.div>
          )}
        </div>

        <div className="font-pixel text-[9px] text-gray-500 text-center tracking-widest bg-zinc-950 py-2 px-4 rounded-full border border-white/5 shadow-inner">
          SESSION CODES: <span className="text-white font-bold">{sessionID || "SPZ-2026-6281X"}</span>
        </div>
      </div>

      {/* RIGHT COLUMN: CTAs */}
      <div className="lg:col-span-6 flex flex-col gap-4">
        
        {/* ── PRIMARY: Download Everything as ZIP ── */}
        <motion.button
          whileHover={isGeneratingZip ? {} : { scale: 1.02, boxShadow: '0 0 30px rgba(234,45,45,0.5)' }}
          whileTap={isGeneratingZip ? {} : { scale: 0.98 }}
          type="button"
          onClick={handleDownloadZip}
          disabled={isGeneratingZip}
          className={`w-full py-5 rounded-xl text-white font-black uppercase text-xs tracking-widest transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xl font-display border-2 relative overflow-hidden ${
            isGeneratingZip
              ? 'bg-zinc-800 border-white/10 cursor-not-allowed'
              : 'bg-gradient-to-br from-[#EA2D2D] via-red-600 to-rose-700 border-[#EA2D2D]/40'
          }`}
          style={{ borderRadius: "16px" }}
        >
          {/* Shimmer sweep on idle */}
          {!isGeneratingZip && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 pointer-events-none"
              animate={{ x: ['-200%', '200%'] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', repeatDelay: 1 }}
            />
          )}
          {isGeneratingZip ? (
            <>
              <Loader2 size={16} className="animate-spin shrink-0" />
              <span className="truncate max-w-[220px]">{zipProgress || 'GENERATING...'}</span>
            </>
          ) : (
            <>
              <Archive size={16} className="shrink-0" />
              DOWNLOAD ALL AS ZIP
            </>
          )}
        </motion.button>

        {/* ZIP contents legend */}
        <div className="bg-white/3 border border-white/8 rounded-xl px-4 py-3 grid grid-cols-3 gap-3 text-center">
          {[
            { label: 'PHOTO STRIP', sub: '.png', color: 'text-[#FF9A9A]' },
            { label: 'VIDEO REEL', sub: '.webm', color: 'text-indigo-400' },
            { label: 'PHOTOS', sub: `×${capturedPhotos.length} files`, color: 'text-emerald-400' },
          ].map(item => (
            <div key={item.label} className="flex flex-col items-center gap-0.5">
              <PackageCheck size={14} className={item.color} />
              <span className={`font-pixel text-[7px] uppercase tracking-wider ${item.color}`}>{item.label}</span>
              <span className="font-mono text-[8px] text-gray-500">{item.sub}</span>
            </div>
          ))}
        </div>

        {/* ── SECONDARY: Save PNG only ── */}
        <motion.button
          whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.07)' }}
          whileTap={{ scale: 0.99 }}
          type="button"
          onClick={handleDownloadDisk}
          className="w-full py-3 bg-white/5 border border-white/10 text-gray-300 hover:text-white font-pixel text-[9px] uppercase tracking-widest rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
          style={{ borderRadius: "14px" }}
        >
          <Download size={13} />
          SAVE STRIP ONLY (PNG)
        </motion.button>

        {/* Send via email */}
        <form onSubmit={handleEmailSubmit} className="bg-[#111111] border border-white/10 p-5 rounded-2xl flex flex-col gap-4 shadow-inner">
          <div className="flex items-center gap-2 pb-1.5 border-b border-white/5">
            <Mail size={14} className="text-[#FF9A9A]" />
            <span className="text-xs font-pixel text-gray-300 uppercase tracking-widest">SEND TO REGISTERED MAILBOX</span>
          </div>
          
          <div className="flex gap-2.5">
            <input 
              type="email"
              required
              placeholder="e.g. yourname@domain.com"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className="flex-1 bg-zinc-950 border border-white/10 focus:border-[#EA2D2D] rounded-xl px-4 py-3 text-xs outline-none text-white focus:ring-1 focus:ring-[#EA2D2D]/30 font-mono transition-colors"
              style={{ borderRadius: "12px" }}
            />
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.96 }}
              type="submit"
              disabled={isEmailSending}
              className="px-6 py-3 bg-[#EA2D2D] hover:bg-rose-600 text-white text-xs font-black rounded-xl transition-colors cursor-pointer font-display uppercase tracking-wider"
              style={{ borderRadius: "12px" }}
            >
              {isEmailSending ? "SENDING..." : "SEND"}
            </motion.button>
          </div>

          <AnimatePresence>
            {emailSuccessMessage && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 text-[10px] text-[#32D583] bg-[#32D583]/10 p-3 rounded-xl border border-[#32D583]/20 font-mono"
              >
                <CheckCircle2 size={13} />
                <span>{emailSuccessMessage}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </form>

        {/* Viral Share Buttons */}
        <div className="bg-[#111111] border border-white/10 p-4 rounded-2xl flex flex-col gap-3">
          <span className="text-[8px] font-pixel text-gray-500 tracking-widest uppercase">VIRAL SHARING NETWORK PORTAL</span>
          <div className="grid grid-cols-5 gap-2 text-xs text-center font-mono">
            {[
              { icon: <Instagram size={14} className="text-pink-400" />, label: 'INSTA', color: 'hover:bg-pink-500/10 hover:border-pink-500/30', toast: 'Instagram tag string copied!' },
              { icon: <Share2 size={14} className="text-emerald-400" />, label: 'WA', color: 'hover:bg-emerald-500/10 hover:border-emerald-500/30', toast: 'WhatsApp story link active!' },
              { icon: <Award size={14} className="text-cyan-400" />, label: 'TIKTOK', color: 'hover:bg-cyan-500/10 hover:border-cyan-500/30', toast: 'TikTok tag presets active!' },
              { icon: <Twitter size={14} className="text-[#2E90FA]" />, label: 'X', color: 'hover:bg-[#2E90FA]/10 hover:border-[#2E90FA]/30', toast: 'X sharing template generated!' },
              { icon: <RefreshCw size={13} className="text-amber-400" />, label: 'LINK', color: 'hover:bg-amber-500/10 hover:border-amber-500/30', toast: 'Share link copied!' },
            ].map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ y: -3, scale: 1.05 }}
                type="button"
                onClick={() => { playSound('click'); triggerToast(item.toast); }}
                className={`py-3 bg-white/5 border border-white/5 text-gray-400 hover:text-white ${item.color} rounded-xl transition-all cursor-pointer flex flex-col items-center gap-1.5`}
              >
                {item.icon}
                <span className="text-[8px] font-pixel tracking-wider uppercase">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 w-full">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => { playSound('click'); setPage(7); }}
            className="flex-1 py-4 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-pixel text-[8px] tracking-widest uppercase rounded-xl transition-colors cursor-pointer text-center"
            style={{ borderRadius: "14px" }}
          >
            ← BACK TO STYLING
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 0 15px rgba(234,45,45,0.2)' }}
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
    </motion.div>
  );
}

// ─── Animated GIF Preview Player ───
function SimpleGifPlayer({ 
  photos, filter, intensity, filterFunc, frame 
}: { 
  photos: string[]; 
  filter: string; 
  intensity: number; 
  filterFunc: (f: string, i: number) => string;
  frame: FrameTemplate;
}) {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    if (photos.length <= 1) return;
    const interval = setInterval(() => {
      setFrameIndex(prev => (prev + 1) % photos.length);
    }, 450);
    return () => clearInterval(interval);
  }, [photos]);

  const activePhoto = photos[frameIndex] || "https://picsum.photos/seed/purikuragif/500/380";

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
      {/* Frame color tint overlay */}
      <div 
        className="absolute inset-0 pointer-events-none z-10 mix-blend-color opacity-20"
        style={{ backgroundColor: frame.borderColor }}
      />
    </div>
  );
}