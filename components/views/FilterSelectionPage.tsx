import React from 'react';
import { motion } from 'motion/react';
import { Check, ArrowLeft } from 'lucide-react';
import { FrameTemplate } from '../../types/photobooth';
import { LayoutRenderer } from '../LayoutRenderer';

interface FilterSelectionPageProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  filterIntensity: number;
  setFilterIntensity: (intensity: number) => void;
  selectedFrame: FrameTemplate;
  selectedLayoutId: string;
  photoStripLayout: number;
  capturedPhotos: string[];
  renderCompositedPhotoStrip: () => void;
  getFilterStyle: (f: string, i: number) => string;
  playSound: (type: 'click' | 'shutter' | 'countdown' | 'complete') => void;
  setPage: (page: number) => void;
}

export function FilterSelectionPage({
  selectedFilter,
  setSelectedFilter,
  filterIntensity,
  setFilterIntensity,
  selectedFrame,
  selectedLayoutId,
  photoStripLayout,
  capturedPhotos,
  renderCompositedPhotoStrip,
  getFilterStyle,
  playSound,
  setPage
}: FilterSelectionPageProps) {
  return (
    <motion.div 
      key="page-filter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col gap-6"
      id="view-filter-selection"
    >
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="font-pixel text-[10px] text-accent-pink">STAGE 04 — SELECT CUSTOM FILTER EFFECTS</span>
          <h2 className="text-3xl font-display font-black text-white uppercase tracking-tight mt-1">PURIKURA STYLING</h2>
        </div>

        {/* Original reset top right button */}
        <button
          type="button"
          onClick={() => { playSound('click'); setSelectedFilter("Original"); setFilterIntensity(100); }}
          className="px-4 py-2 bg-white/5 border border-white/10 hover:bg-white/10 text-xs font-pixel text-white rounded-xl transition-all cursor-pointer"
          style={{ borderRadius: "14px" }}
        >
          RESET FILM EFFECTS
        </button>
      </div>

      {/* Side-by-Side editing structure */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left side: Filter library and intensity slider casing */}
        <div className="lg:col-span-5 flex flex-col gap-6 bg-[#111111] border border-white/15 p-6 rounded-3xl" style={{ borderRadius: "24px" }}>
          
          {/* Category 1: Classic Effects */}
          <div>
            <span className="font-pixel text-[10px] text-[#32D583] uppercase tracking-wide">CLASSIC EFFECT ANALOG RESETS</span>
            <div className="grid grid-cols-2 gap-2 mt-3.5">
              {["Original", "B&W", "Vintage", "Warm", "Soft"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => { playSound('click'); setSelectedFilter(f); }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer hover:border-white/35 transition-all text-sm font-semibold flex items-center justify-between ${
                    selectedFilter === f
                      ? "bg-[#EA2D2D]/10 border-[#EA2D2D] text-white"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}
                >
                  {f}
                  {selectedFilter === f && <Check size={14} className="text-[#EA2D2D]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Category 2: Premium LUTs */}
          <div>
            <span className="font-pixel text-[10px] text-amber-400 uppercase tracking-wide inline-flex items-center gap-1">
              👑 PREMIUM STICKER PACK LUTS
            </span>
            <div className="grid grid-cols-2 gap-2 mt-3.5">
              {["Tokyo Night", "Cyberpunk", "Film 1998", "Y2K", "Dreamy"].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => { playSound('click'); setSelectedFilter(f); }}
                  className={`p-3.5 rounded-xl border text-left cursor-pointer hover:border-white/35 transition-all text-sm font-semibold flex items-center justify-between relative overflow-hidden group ${
                    selectedFilter === f
                      ? "bg-[#EA2D2D]/10 border-[#EA2D2D] text-white"
                      : "bg-white/5 border-white/10 text-gray-300"
                  }`}
                >
                  <span>{f}</span>
                  <span className="font-pixel text-[7px] text-amber-300 bg-amber-400/20 px-1 py-0.5 rounded leading-none scale-90">
                    PRO
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Intensity slider */}
          <div className="border-t border-white/10 pt-4 mt-2">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-gray-300 font-mono">Effect Filter Intensity</span>
              <span className="text-xs font-bold text-[#FF6B6B] font-mono">{filterIntensity}%</span>
            </div>
            <input 
              type="range"
              min="10"
              max="100"
              value={filterIntensity}
              onChange={(e) => setFilterIntensity(Number(e.target.value))}
              className="w-full accent-[#EA2D2D] bg-zinc-800 rounded-lg cursor-pointer h-2"
            />
            <div className="flex justify-between text-[10px] text-gray-500 font-mono mt-1">
              <span>Low</span>
              <span>High Contrast</span>
            </div>
          </div>

          {/* PROCEED MAIN CTA BUTTON */}
          <button
            type="button"
            onClick={renderCompositedPhotoStrip}
            className="w-full py-4 bg-[#EA2D2D] hover:bg-[#C61D1D] text-white font-black text-sm uppercase tracking-wide rounded-xl hover-glow transition-all duration-200 cursor-pointer mt-2 text-center"
            style={{ borderRadius: "14px" }}
          >
            PROCEED TO STICKER ROOM
          </button>

          <button
            type="button"
            onClick={() => { playSound('click'); setPage(6); }}
            className="w-full py-3 bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white font-medium text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 border border-white/5"
            style={{ borderRadius: "14px" }}
          >
            <ArrowLeft size={13} /> BACK TO SHOOTING
          </button>
        </div>

        {/* Right side: Realtime Render Showcase preview */}
        <div className="lg:col-span-7 flex flex-col items-center bg-[#111111] border border-white/15 p-6 rounded-3xl" style={{ borderRadius: "28px" }}>
          <span className="text-xs font-pixel text-slate-400 mb-4 uppercase tracking-wider select-none">REALTIME STYLED RENDER PREVIEW</span>
          
          <div className="w-full max-w-[240px] drop-shadow-2xl">
            <LayoutRenderer
              layoutId={selectedLayoutId}
              borderColor={selectedFrame.borderColor}
              textColor={selectedFrame.textColor}
              headerTheme={selectedFrame.headerTheme}
              photos={capturedPhotos}
              selectedFilter={selectedFilter}
              filterIntensity={filterIntensity}
              getFilterStyle={getFilterStyle}
            />
          </div>
        </div>

      </div>

    </motion.div>
  );
}
