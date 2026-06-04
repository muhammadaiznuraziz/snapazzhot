import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, ArrowLeft, Move } from "lucide-react";
import { LayoutRenderer } from "../LayoutRenderer";

export interface FrameTemplate {
  headerTheme: string;
  decoStyle: string;
  borderColor: string;
  textColor: string;
  name?: string;
}

export interface CustomFrame {
  name: string;
  imageData: string;
  borderColor: string;
  textColor: string;
}

interface FilterSelectionPageProps {
  selectedFilter: string;
  setSelectedFilter: (filter: string) => void;
  filterIntensity: number;
  setFilterIntensity: (intensity: number) => void;
  selectedFrame: FrameTemplate | CustomFrame;
  selectedLayoutId: string;
  photoStripLayout: number;
  capturedPhotos: string[];
  setCapturedPhotos?: (photos: string[]) => void;
  renderCompositedPhotoStrip: () => void;
  getFilterStyle: (f: string, i: number) => string;
  playSound: (type: "click" | "shutter" | "countdown" | "complete") => void;
  setPage: (page: number) => void;
  photoAdjustments: { [key: number]: { x: number; y: number; scale: number } };
  setPhotoAdjustments: React.Dispatch<
    React.SetStateAction<{ [key: number]: { x: number; y: number; scale: number } }>
  >;
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
  photoAdjustments,
  setPhotoAdjustments,
}: FilterSelectionPageProps) {
  // Initialize adjustments in lifted state if not present
  React.useEffect(() => {
    const needsInit = capturedPhotos.some((_, idx) => !photoAdjustments[idx]);
    if (needsInit) {
      setPhotoAdjustments((prev) => {
        const next = { ...prev };
        capturedPhotos.forEach((_, idx) => {
          if (!next[idx]) {
            next[idx] = { x: 0, y: 0, scale: 1.0 };
          }
        });
        return next;
      });
    }
  }, [capturedPhotos, photoAdjustments, setPhotoAdjustments]);

  const [showRetakeConfirm, setShowRetakeConfirm] = useState(false);

  const getAdjustment = (idx: number) => {
    return photoAdjustments[idx] || { x: 0, y: 0, scale: 1.0 };
  };

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

  const handleResetAdjustment = (idx: number) => {
    playSound("click");
    updateAdjustment(idx, { x: 0, y: 0, scale: 1.0 });
  };

  const handleRetakeAll = () => {
    playSound("shutter");
    if (setCapturedPhotos) {
      setCapturedPhotos([]);
    }
    setPage(6);
  };

  return (
    <motion.div
      key="page-filter"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col gap-6 px-2 md:px-4 select-none pb-24 font-sans"
      id="view-filter-selection"
    >
      {/* HUD Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <span className="font-mono text-[10px] text-[#ffbe3b] tracking-wider block uppercase font-bold">
            STAGE 04 — STYLE & ALIGNMENT TUNER
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight mt-1">
            FILTERS & POSITIONING
          </h2>
        </div>

        <button
          type="button"
          onClick={() => {
            playSound("click");
            setSelectedFilter("Original");
            setFilterIntensity(100);
            const resetObj: {
              [key: number]: { x: number; y: number; scale: number };
            } = {};
            (capturedPhotos || []).forEach((_, idx) => {
              resetObj[idx] = { x: 0, y: 0, scale: 1.0 };
            });
            setPhotoAdjustments(resetObj);
          }}
          className="px-4 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-[9px] font-mono text-white rounded-xl transition-all cursor-pointer shadow-md uppercase tracking-wider flex items-center gap-1.5"
          style={{ borderRadius: "12px" }}
        >
          <RotateCcw size={11} />
          RESET ALL EFFECTS
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 xl:gap-4 items-start">
        {/* LEFT COLUMN: Filter Controls Panel */}
        <div
          className="lg:col-span-6 flex flex-col gap-3 bg-[#111111] border border-white/10 p-6 shadow-2xl"
          style={{ borderRadius: "20px" }}
        >
          <div className="flex flex-col gap-6">
            <div>
              <span className="font-mono text-[9px] font-bold text-[#ffbe3b] uppercase tracking-wider block mb-3">
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

            <button
              type="button"
              onClick={renderCompositedPhotoStrip}
              className="w-full py-4 bg-[#EA2D2D] hover:bg-[#C61D1D] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-[0_0_20px_rgba(234,45,45,0.3)] transition-all duration-200 cursor-pointer text-center"
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
                className="py-3 bg-[#ffbe3b]/10 border border-[#ffbe3b]/30 hover:bg-[#ffbe3b]/20 text-[#ffbe3b] font-mono font-bold text-[9px] tracking-widest uppercase rounded-xl transition-all cursor-pointer text-center"
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
                className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-mono font-bold text-[9px] tracking-widest uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                style={{ borderRadius: "12px" }}
              >
                <ArrowLeft size={10} /> BACK
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Premium Live Render Preview Box */}
        <div
          className="lg:col-span-6 flex flex-col items-center bg-[#111111] border border-white/10 p-6 shadow-2xl"
          style={{ borderRadius: "24px" }}
        >
          <div className="w-full flex flex-col items-center">
            <span className="text-[9px] font-mono font-bold text-[#ffbe3b] mb-4 uppercase tracking-wider block select-none">
              REALTIME STYLED RENDER PREVIEW
            </span>
            <div className="w-full max-w-[200px] sm:max-w-[240px] drop-shadow-2xl hover:scale-[1.02] transition-transform duration-500">
              {/* LayoutRenderer diimpor secara global dari LayoutRenderer.tsx */}
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
                photoAdjustments={photoAdjustments}
              />
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: 3-Column Independent Scroll Workspace */}
      <div className="mt-4 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-5">
          <span className="font-mono font-bold text-[11px] text-green-400 uppercase tracking-wider inline-flex items-center gap-2">
            <Move size={14} className="text-green-400" />
            02. MULTI-TRACK PHOTO CROP WORKSPACE
          </span>
          <span className="text-[10px] font-mono text-gray-400">
            Scroll each panel independently
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {(capturedPhotos || []).map((photo, idx) => (
            <div
              key={idx}
              className="bg-[#111111] border border-white/10 rounded-2xl p-4 flex flex-col gap-3 h-[450px] shadow-lg"
            >
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <span className="text-[10px] font-mono font-bold text-[#ffbe3b] uppercase">
                  Shot {idx + 1}
                </span>
                <button
                  onClick={() => handleResetAdjustment(idx)}
                  className="text-[9px] font-mono text-gray-400 hover:text-white bg-white/5 px-2 py-1 rounded-md transition-colors"
                >
                  Reset
                </button>
              </div>

              {/* Individual Scroll Viewport Area */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-white/20 [&::-webkit-scrollbar-track]:bg-transparent transition-all">
                <div className="w-full aspect-[4/3] bg-zinc-950 rounded-xl overflow-hidden relative border border-white/10 flex items-center justify-center group shrink-0">
                  <motion.div
                    className="absolute cursor-move"
                    style={{
                      width: "120%",
                      height: "120%",
                      x: getAdjustment(idx).x,
                      y: getAdjustment(idx).y,
                      scale: getAdjustment(idx).scale,
                    }}
                    drag
                    dragElastic={0.1}
                    dragMomentum={false}
                    onDrag={(e, info) =>
                      updateAdjustment(idx, {
                        x: getAdjustment(idx).x + info.delta.x,
                        y: getAdjustment(idx).y + info.delta.y,
                      })
                    }
                  >
                    <img
                      src={photo}
                      style={{
                        filter: getFilterStyle(selectedFilter, filterIntensity),
                      }}
                      className="w-full h-full object-cover pointer-events-none select-none"
                      alt={`Adjust viewport ${idx}`}
                    />
                  </motion.div>
                  <div className="absolute inset-0 pointer-events-none border border-white/5 flex items-center justify-center">
                    <div className="w-1/3 h-full border-l border-r border-white/10" />
                    <div className="h-1/3 w-full border-t border-b border-white/10 absolute" />
                  </div>
                </div>

                {/* Adjustment Sliders */}
                <div className="flex flex-col gap-3 text-[10px] font-mono text-gray-300 pb-2">
                  <div className="flex flex-col gap-1.5 bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Zoom Size</span>
                      <span className="text-green-400 font-bold">
                        {Math.round(getAdjustment(idx).scale * 100)}%
                      </span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="3.0"
                      step="0.05"
                      value={getAdjustment(idx).scale}
                      onChange={(e) =>
                        updateAdjustment(idx, { scale: Number(e.target.value) })
                      }
                      className="w-full accent-[#EA2D2D] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Move X</span>
                      <span className="text-gray-300">
                        {Math.round(getAdjustment(idx).x)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      step="1"
                      value={getAdjustment(idx).x}
                      onChange={(e) =>
                        updateAdjustment(idx, { x: Number(e.target.value) })
                      }
                      className="w-full accent-[#EA2D2D] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 bg-black/40 p-3 rounded-lg border border-white/5">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Move Y</span>
                      <span className="text-gray-300">
                        {Math.round(getAdjustment(idx).y)}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-150"
                      max="150"
                      step="1"
                      value={getAdjustment(idx).y}
                      onChange={(e) =>
                        updateAdjustment(idx, { y: Number(e.target.value) })
                      }
                      className="w-full accent-[#EA2D2D] bg-zinc-800 rounded-lg cursor-pointer h-1.5"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Retake Warning Dialog */}
      <AnimatePresence>
        {showRetakeConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-[#111111] border-2 border-[#EA2D2D] p-6 rounded-2xl max-w-sm w-full shadow-[0_0_50px_rgba(234,45,45,0.5)] flex flex-col gap-4 text-center"
            >
              <span className="font-mono font-bold text-[10px] text-[#ffbe3b] uppercase tracking-wider">
                ALERT WARNING
              </span>
              <h3 className="text-xl font-black text-white uppercase">
                RETAKE ALL SHOTS?
              </h3>
              <p className="text-xs text-gray-400 font-mono leading-relaxed">
                This will clear all currently captured {capturedPhotos.length}{" "}
                photos. This action cannot be undone!
              </p>
              <div className="grid grid-cols-2 gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setShowRetakeConfirm(false);
                  }}
                  className="py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-mono font-bold text-[10px] tracking-wider rounded-xl cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowRetakeConfirm(false);
                    handleRetakeAll();
                  }}
                  className="py-3 bg-[#EA2D2D] hover:bg-rose-600 text-white font-mono font-bold text-[10px] tracking-wider rounded-xl cursor-pointer"
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

// ============================================================================
// WRAPPER APLIKASI (Untuk keperluan rendering fallback / Canvas Preview)
// ============================================================================
export default function App() {
  const [filter, setFilter] = useState("Original");
  const [intensity, setIntensity] = useState(100);
  const [photoAdjustments, setPhotoAdjustments] = useState<{
    [key: number]: { x: number; y: number; scale: number };
  }>({});

  const dummyPhotos = [
    "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80",
    "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&q=80",
  ];

  const getFilterStyle = (f: string, i: number) => {
    if (f === "B&W") return `grayscale(${i}%)`;
    if (f === "Vintage") return `sepia(${i}%) contrast(1.2)`;
    if (f === "Warm") return `sepia(${i / 2}%) saturate(1.5)`;
    if (f === "Soft") return `blur(${i / 100}px) contrast(0.9)`;
    if (f === "Cyberpunk") return `hue-rotate(90deg) saturate(${i * 1.5}%)`;
    if (f === "Film 1998")
      return `contrast(1.1) brightness(0.9) sepia(${i / 3}%)`;
    return "none";
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 overflow-x-hidden">
      <FilterSelectionPage
        selectedFilter={filter}
        setSelectedFilter={setFilter}
        filterIntensity={intensity}
        setFilterIntensity={setIntensity}
        selectedFrame={{
          borderColor: "#22d3ee",
          textColor: "#ffffff",
          headerTheme: "MOCK MODE",
          decoStyle: "PREVIEW ONLY",
          name: "MOCK NAME",
        }}
        selectedLayoutId="strip-3"
        photoStripLayout={3}
        capturedPhotos={dummyPhotos}
        renderCompositedPhotoStrip={() =>
          console.log("Proceeding to next page...")
        }
        getFilterStyle={getFilterStyle}
        playSound={() => {}}
        setPage={() => {}}
        photoAdjustments={photoAdjustments}
        setPhotoAdjustments={setPhotoAdjustments}
      />
    </div>
  );
}
