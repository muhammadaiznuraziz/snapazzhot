import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Check,
  ArrowLeft,
  RotateCcw,
  Sliders,
  Maximize2,
  RefreshCw,
  Move,
} from "lucide-react";
import { CustomFrame, FrameTemplate } from "../../types/photobooth";
import { LayoutRenderer } from "../LayoutRenderer";

interface FilterSelectionPageProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  filterIntensity: number;
  setFilterIntensity: (intensity: number) => void;
  selectedFrame: FrameTemplate | CustomFrame;
  selectedLayoutId: string;
  photoStripLayout: number;
  capturedPhotos: string[];
  setCapturedPhotos?: (photos: string[]) => void; // Opsional: Untuk menghapus foto saat Retake
  renderCompositedPhotoStrip: () => void;
  getFilterStyle: (f: string, i: number) => string;
  playSound: (type: "click" | "shutter" | "countdown" | "complete") => void;
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
  setCapturedPhotos,
  renderCompositedPhotoStrip,
  getFilterStyle,
  playSound,
  setPage,
}: FilterSelectionPageProps) {
  // Menyimpan data zoom (scale) dan posisi (x, y) untuk masing-masing index foto
  const [activeAdjustIndex, setActiveAdjustIndex] = useState<number>(0);
  const [photoAdjustments, setPhotoAdjustments] = useState<{
    [key: number]: { x: number; y: number; scale: number };
  }>(() => {
    const initial: { [key: number]: { x: number; y: number; scale: number } } =
      {};
    capturedPhotos.forEach((_, idx) => {
      initial[idx] = { x: 0, y: 0, scale: 1.0 };
    });
    return initial;
  });

  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);

  // Helper untuk mendapatkan adjustment per foto secara aman
  const getAdjustment = (idx: number) => {
    return photoAdjustments[idx] || { x: 0, y: 0, scale: 1.0 };
  };

  // Update spesifik properti adjustment
  const updateAdjustment = (
    idx: number,
    updates: Partial<{ x: number; y: number; scale: number }>,
  ) => {
    setPhotoAdjustments((prev) => ({
      ...prev,
      [idx]: {
        ...getAdjustment(idx),
        ...updates,
      },
    }));
  };

  // Reset penyesuaian foto ke bawaan semula
  const handleResetAdjustment = (idx: number) => {
    playSound("click");
    updateAdjustment(idx, { x: 0, y: 0, scale: 1.0 });
  };

  // Aksi Retake seluruh foto
  const handleRetakeAll = () => {
    playSound("shutter");
    if (setCapturedPhotos) {
      setCapturedPhotos([]);
    }
    setPage(6); // Kembali ke halaman pemotretan
  };

  return (
    <motion.div
      key="page-filter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col gap-6 select-none"
      id="view-filter-selection"
    >
      {}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="font-pixel text-[10px] text-[#ffbe3b] tracking-wider block uppercase">
            STAGE 04 — STYLE & ALIGNMENT TUNER
          </span>
          <h2 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-tight mt-1">
            FILTERS & POSITIONING
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            playSound("click");
            setSelectedFilter("Original");
            setFilterIntensity(100);
            // Reset semua offset foto juga
            const resetObj: {
              [key: number]: { x: number; y: number; scale: number };
            } = {};
            capturedPhotos.forEach((_, idx) => {
              resetObj[idx] = { x: 0, y: 0, scale: 1.0 };
            });
            setPhotoAdjustments(resetObj);
          }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[9px] font-pixel text-white rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1.5"
          style={{ borderRadius: "12px" }}
        >
          <RotateCcw size={11} />
          RESET ALL EFFECTS
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* LEFT COLUMN: Controls (Filter & Alignment tools) - 50% width */}
        <div
          className="lg:col-span-6 flex flex-col gap-6 bg-[#111111] border border-white/10 p-6 rounded-3xl justify-between shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
          style={{ borderRadius: "24px" }}
        >
          <div className="flex flex-col gap-6">
            {/* 1. FILTER EFFECTS SECTION */}
            <div>
              <span className="font-pixel text-[9px] text-[#ffbe3b] uppercase tracking-wider block mb-3">
                01. ANALOG FILTER PRESETS
              </span>
              <div className="grid grid-cols-5 gap-1.5">
                {["Original", "B&W", "Vintage", "Warm", "Soft"].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setSelectedFilter(f);
                    }}
                    className={`py-3 px-1 rounded-xl border text-center cursor-pointer hover:border-white/30 transition-all text-[8px] font-bold flex flex-col items-center justify-center gap-1 leading-tight ${
                      selectedFilter === f
                        ? "bg-[#EA2D2D]/15 border-[#EA2D2D] text-white shadow-[0_0_10px_rgba(234,45,45,0.2)]"
                        : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                    }`}
                  >
                    <span>{f}</span>
                    {selectedFilter === f && (
                      <div className="w-1.5 h-1.5 bg-[#EA2D2D] rounded-full" />
                    )}
                  </button>
                ))}
              </div>

              {/* Premium LUTs */}
              <div className="grid grid-cols-5 gap-1.5 mt-2">
                {["Tokyo Night", "Cyberpunk", "Film 1998", "Y2K", "Dreamy"].map(
                  (f) => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => {
                        playSound("click");
                        setSelectedFilter(f);
                      }}
                      className={`py-3 px-1 rounded-xl border text-center cursor-pointer hover:border-white/30 transition-all text-[7px] font-bold flex flex-col items-center justify-center gap-1 leading-tight relative overflow-hidden group ${
                        selectedFilter === f
                          ? "bg-[#EA2D2D]/15 border-[#EA2D2D] text-white shadow-[0_0_10px_rgba(234,45,45,0.2)]"
                          : "bg-white/5 border-white/5 text-gray-400 hover:text-white"
                      }`}
                    >
                      <span className="truncate w-full block px-1">{f}</span>
                    </button>
                  ),
                )}
              </div>

              {/* Filter Intensity Slider */}
              <div className="bg-black/30 p-3 rounded-xl border border-white/5 mt-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-gray-400 font-mono">
                    Filter Strength
                  </span>
                  <span className="text-[10px] font-bold text-[#EA2D2D] font-mono">
                    {filterIntensity}%
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={filterIntensity}
                  onChange={(e) => setFilterIntensity(Number(e.target.value))}
                  className="w-full accent-[#EA2D2D] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
                />
              </div>
            </div>

            {}
            {/* 2. PHOTO INTERACTIVE ALIGNMENT SECTION */}
            <div className="border-t border-white/5 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-pixel text-[9px] text-green-400 uppercase tracking-wider inline-flex items-center gap-1">
                  <Move size={11} className="text-green-400" />
                  02. PHOTO CROP & DRAG WORKSPACE
                </span>
                <span className="text-[9px] font-mono text-gray-500">
                  Select shot to align
                </span>
              </div>

              {/* Shot selector mini thumbnails */}
              <div className="flex items-center gap-2 mb-4">
                {capturedPhotos.map((photo, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setActiveAdjustIndex(idx);
                    }}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      activeAdjustIndex === idx
                        ? "border-[#EA2D2D] scale-105 shadow-[0_0_8px_rgba(234,45,45,0.4)]"
                        : "border-white/10 hover:border-white/30 hover:scale-102"
                    }`}
                  >
                    <img
                      src={photo}
                      style={{
                        filter: getFilterStyle(selectedFilter, filterIntensity),
                      }}
                      className="w-full h-full object-cover"
                      alt={`Shot Thumbnail ${idx + 1}`}
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-[10px] font-pixel text-white font-bold">
                      {idx + 1}
                    </div>
                  </button>
                ))}
              </div>

              {/* Interactive Drag Casing */}
              <div className="bg-black border-2 border-dashed border-white/10 rounded-2xl p-3 flex flex-col gap-3">
                <span className="text-[9px] font-pixel text-[#ffbe3b] tracking-wide block uppercase text-center">
                  Drag the photo inside viewport below to position
                </span>

                {/* Viewport Mask */}
                <div className="w-full aspect-[4/3] bg-zinc-950 rounded-xl overflow-hidden relative border border-white/5 flex items-center justify-center group">
                  <motion.div
                    className="absolute cursor-move"
                    style={{
                      width: "120%",
                      height: "120%",
                      x: getAdjustment(activeAdjustIndex).x,
                      y: getAdjustment(activeAdjustIndex).y,
                      scale: getAdjustment(activeAdjustIndex).scale,
                    }}
                    drag
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDrag={(e, info) => {
                      updateAdjustment(activeAdjustIndex, {
                        x: getAdjustment(activeAdjustIndex).x + info.delta.x,
                        y: getAdjustment(activeAdjustIndex).y + info.delta.y,
                      });
                    }}
                  >
                    <img
                      src={capturedPhotos[activeAdjustIndex]}
                      style={{
                        filter: getFilterStyle(selectedFilter, filterIntensity),
                      }}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      alt="Crop adjust viewport"
                    />
                  </motion.div>

                  {/* Subtle alignment guide lines */}
                  <div className="absolute inset-0 pointer-events-none border border-white/5 flex items-center justify-center">
                    <div className="w-1/3 h-full border-l border-r border-white/5" />
                    <div className="h-1/3 w-full border-t border-b border-white/5 absolute" />
                  </div>
                </div>

                {/* Precise Precision Sliders */}
                <div className="grid grid-cols-1 gap-2 text-[11px] font-mono text-gray-300">
                  {/* Zoom (Scale) slider */}
                  <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="w-16 shrink-0 text-gray-400">
                      Zoom Size:
                    </span>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.05"
                      value={getAdjustment(activeAdjustIndex).scale}
                      onChange={(e) =>
                        updateAdjustment(activeAdjustIndex, {
                          scale: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-[#EA2D2D] bg-zinc-800 rounded-lg cursor-pointer h-1"
                    />
                    <span className="w-10 text-right font-bold text-green-400">
                      {Math.round(getAdjustment(activeAdjustIndex).scale * 100)}
                      %
                    </span>
                  </div>

                  {/* Offset X / horizontal slider */}
                  <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="w-16 shrink-0 text-gray-400">Move X:</span>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      step="1"
                      value={getAdjustment(activeAdjustIndex).x}
                      onChange={(e) =>
                        updateAdjustment(activeAdjustIndex, {
                          x: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-[#EA2D2D] bg-zinc-800 rounded-lg cursor-pointer h-1"
                    />
                    <span className="w-10 text-right text-gray-400">
                      {Math.round(getAdjustment(activeAdjustIndex).x)}px
                    </span>
                  </div>

                  {/* Offset Y / vertical slider */}
                  <div className="flex items-center gap-3 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                    <span className="w-16 shrink-0 text-gray-400">Move Y:</span>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      step="1"
                      value={getAdjustment(activeAdjustIndex).y}
                      onChange={(e) =>
                        updateAdjustment(activeAdjustIndex, {
                          y: Number(e.target.value),
                        })
                      }
                      className="flex-1 accent-[#EA2D2D] bg-zinc-800 rounded-lg cursor-pointer h-1"
                    />
                    <span className="w-10 text-right text-gray-400">
                      {Math.round(getAdjustment(activeAdjustIndex).y)}px
                    </span>
                  </div>
                </div>

                {/* Reset button for the active thumbnail alignment */}
                <button
                  type="button"
                  onClick={() => handleResetAdjustment(activeAdjustIndex)}
                  className="w-full py-2 border border-white/10 hover:border-white/20 text-[10px] font-mono text-gray-400 hover:text-white rounded-lg transition-colors cursor-pointer text-center uppercase"
                >
                  Reset Alignment for Shot {activeAdjustIndex + 1}
                </button>
              </div>
            </div>
          </div>

          {}
          {/* ACTION BUTTONS GROUP */}
          <div className="flex flex-col gap-2 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={renderCompositedPhotoStrip}
              className="w-full py-4 bg-[#EA2D2D] hover:bg-[#C61D1D] text-white font-black text-xs uppercase tracking-wider rounded-xl hover-glow shadow-[0_0_20px_rgba(234,45,45,0.3)] transition-all duration-200 cursor-pointer text-center"
              style={{ borderRadius: "14px" }}
            >
              PROCEED TO STICKER ROOM
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setShowRetakeConfirm(true);
                }}
                className="py-3 bg-[#ffbe3b]/10 border border-[#ffbe3b]/30 hover:bg-[#ffbe3b]/20 text-[#ffbe3b] font-pixel text-[8px] tracking-widest uppercase rounded-xl transition-all cursor-pointer text-center"
                style={{ borderRadius: "12px" }}
              >
                RETAKE ALL
              </button>

              <button
                type="button"
                onClick={() => {
                  playSound("click");
                  setPage(6);
                }}
                className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-pixel text-[8px] tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                style={{ borderRadius: "12px" }}
              >
                <ArrowLeft size={10} /> BACK
              </button>
            </div>
          </div>
        </div>

        {}
        {/* RIGHT COLUMN: Symmetrical Render Preview - 50% width */}
        <div
          className="lg:col-span-6 flex flex-col items-center bg-[#111111] border border-white/10 p-6 rounded-3xl justify-between shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
          style={{ borderRadius: "24px" }}
        >
          <div className="w-full flex flex-col items-center">
            <span className="text-[9px] font-pixel text-[#ffbe3b] mb-4 uppercase tracking-wider block select-none">
              REALTIME STYLED RENDER PREVIEW
            </span>

            {/* Displaying Live layout strip with applied scale and pan offset variables */}
            <div className="w-full max-w-[320px] drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500">
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
                selectedFilter={selectedFilter}
                filterIntensity={filterIntensity}
                getFilterStyle={getFilterStyle}
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

          <div className="w-full text-center mt-6 p-3 bg-black/40 border border-white/5 rounded-2xl">
            <span className="text-[8px] font-pixel text-gray-500 uppercase tracking-widest block mb-1">
              PRO TIP — PERFECT FIT
            </span>
            <p className="text-[10px] text-gray-400 font-sans leading-relaxed">
              Use the tuner on the left column to align, slide, or zoom your
              snaps until they match perfectly with your {selectedFrame.name}{" "}
              frame design.
            </p>
          </div>
        </div>
      </div>

      {}
      {/* Retake All Confirmation Modal Overlay */}
      <AnimatePresence>
        {showRetakeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111111] border-2 border-[#EA2D2D] p-6 rounded-2xl max-w-sm w-full shadow-[0_0_50px_rgba(234,45,45,0.5)] flex flex-col gap-4 text-center"
            >
              <span className="font-pixel text-[10px] text-[#ffbe3b] uppercase tracking-wider">
                ALERT WARNING
              </span>
              <h3 className="text-xl font-display font-black text-white uppercase">
                RETAKE ALL SHOTS?
              </h3>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                This will clear all currently captured {capturedPhotos.length}{" "}
                photos and return you to the live arcade camera session. This
                action cannot be undone!
              </p>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setShowRetakeConfirm(false);
                  }}
                  className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-pixel text-[8px] tracking-wider rounded-xl cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRetakeConfirm(false);
                    handleRetakeAll();
                  }}
                  className="py-3 bg-[#EA2D2D] hover:bg-rose-600 text-white font-pixel text-[8px] tracking-wider rounded-xl cursor-pointer"
                >
                  YES, RESET
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
