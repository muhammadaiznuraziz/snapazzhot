import React, { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";
import {
  ArrowLeft,
  Check,
  Grid,
  Sparkles,
  Layers,
  CheckCircle2,
  Plus,
  X,
  Upload,
  Image,
  Trash2,
} from "lucide-react";
import {
  CustomFrame,
  FrameTemplate,
  LAYOUT_PRESETS,
  LayoutPreset,
} from "../../types/photobooth";
import { LayoutRenderer } from "../LayoutRenderer";

interface ChooseLayoutViewProps {
  framesList: FrameTemplate[];
  selectedFrame: FrameTemplate | CustomFrame;
  setSelectedFrame: (frame: FrameTemplate | CustomFrame) => void;
  selectedLayoutId: string;
  setSelectedLayoutId: (id: string) => void;
  photoStripLayout: number;
  setPhotoStripLayout: (count: number) => void;
  categoryFilter: string;
  setCategoryFilter: (cat: string) => void;
  playSound: (type: "click" | "shutter" | "countdown" | "complete") => void;
  setPage: (page: number) => void;
  customFrames?: CustomFrame[];
  setCustomFrames?: (frames: CustomFrame[]) => void;
}

export function ChooseLayoutView({
  framesList,
  selectedFrame,
  setSelectedFrame,
  selectedLayoutId,
  setSelectedLayoutId,
  photoStripLayout,
  setPhotoStripLayout,
  categoryFilter,
  setCategoryFilter,
  playSound,
  setPage,
  customFrames = [],
  setCustomFrames,
}: ChooseLayoutViewProps) {
  const [poseGroupFilter, setPoseGroupFilter] = useState("All");

  // Upload state
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [previewFrame, setPreviewFrame] = useState<string | null>(null);
  const [frameName, setFrameName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeLayout =
    LAYOUT_PRESETS.find((l) => l.id === selectedLayoutId) || LAYOUT_PRESETS[0];

  const layoutGroups = [
    {
      title: "1 POSE ARCHIVES",
      layouts: LAYOUT_PRESETS.filter((l) => l.poseCount === 1),
    },
    {
      title: "2 POSES DUET",
      layouts: LAYOUT_PRESETS.filter((l) => l.poseCount === 2),
    },
    {
      title: "3 POSES TRIO",
      layouts: LAYOUT_PRESETS.filter((l) => l.poseCount === 3),
    },
    {
      title: "4 POSES QUAD",
      layouts: LAYOUT_PRESETS.filter((l) => l.poseCount === 4),
    },
  ];
  const frameCategories = [
    "All",
    ...Array.from(new Set(framesList.map((frame) => frame.category))),
  ];

  const handleSelectLayout = (layout: LayoutPreset) => {
    playSound("click");
    setSelectedLayoutId(layout.id);
    setPhotoStripLayout(layout.poseCount);
  };

  // Helper untuk mewarnai badge kelangkaan secara dinamis
  const getRarityStyles = (rarity: string) => {
    const r = rarity.toLowerCase();
    if (r.includes("ultra") || r.includes("legend")) {
      return "text-amber-400 border border-amber-500/30 bg-amber-500/10 animate-pulse";
    } else if (r.includes("rare") || r.includes("epic")) {
      return "text-purple-400 border border-purple-500/30 bg-purple-500/10";
    }
    return "text-gray-500 border border-white/5 bg-white/5";
  };

  // Motion variants untuk stagger children
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  } as const;

  const itemVariants = {
    hidden: { opacity: 0, y: 15, scale: 0.95 },
    show: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 22 },
    },
  } as const;

  // Upload handlers
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewFrame(event.target.result as string);
        setFrameName(file.name.replace(/\.[^/.]+$/, ""));
        playSound("complete");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleSaveFrame = () => {
    if (!previewFrame || !frameName.trim() || !setCustomFrames) return;
    playSound("complete");

    const colors = [
      "#EA2D2D",
      "#FF6B6B",
      "#FDB022",
      "#32D583",
      "#44D7B6",
      "#6366F1",
      "#A855F7",
      "#EC4899",
    ];
    const newFrame: CustomFrame = {
      id: `custom-${Date.now()}`,
      name: frameName.trim(),
      imageData: previewFrame,
      borderColor: colors[Math.floor(Math.random() * colors.length)],
      textColor: "#ffffff",
    };

    setCustomFrames([...customFrames, newFrame]);
    setPreviewFrame(null);
    setFrameName("");
    setShowUploadModal(false);
  };

  const handleDeleteCustomFrame = (frameId: string) => {
    if (!setCustomFrames) return;
    playSound("click");
    setCustomFrames(customFrames.filter((f) => f.id !== frameId));
    if (selectedFrame && "imageData" in selectedFrame && selectedFrame.id === frameId) {
      setSelectedFrame(framesList[0]);
    }
  };

  // Helper to safely get frame properties (handles both FrameTemplate and CustomFrame)
  const getFrameProp = (prop: "headerTheme" | "decoStyle", fallback: string) => {
    if ("imageData" in selectedFrame) {
      return prop === "headerTheme" ? selectedFrame.name : "custom-frame";
    }
    return (selectedFrame as FrameTemplate)[prop] || fallback;
  };

  return (
    <motion.div
      key="page-layout-custom"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="w-full flex flex-col gap-6 px-2 md:px-4 select-none"
      id="view-choose-layout"
    >
      {/* Header section dengan instruksi */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="font-display font-black text-2xl md:text-3xl text-white uppercase tracking-tight">
            FRAME &amp; LAYOUT BUILDER
          </h2>
        </div>

        {/* Categories of Frame Design Deco */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400 mr-2">
            <Layers size={13} className="text-[#EA2D2D] animate-bounce" />
            <span className="tracking-widest">DECO STYLE:</span>
          </div>
          <LayoutGroup id="deco-filters">
            <div className="flex flex-wrap gap-1.5">
              {frameCategories.map((cat) => {
                const isActive = categoryFilter === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => {
                      playSound("click");
                      setCategoryFilter(cat);
                    }}
                    className="px-3 py-1.5 text-xs font-mono transition-colors relative cursor-pointer"
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeDecoBackground"
                        className="absolute inset-0 bg-[#EA2D2D] rounded-md shadow-[0_0_12px_rgba(234,45,45,0.4)]"
                        transition={{
                          type: "spring",
                          stiffness: 380,
                          damping: 30,
                        }}
                      />
                    )}
                    <span
                      className={`relative z-10 transition-colors duration-200 ${isActive ? "text-white font-bold" : "text-gray-400 hover:text-white"}`}
                    >
                      {cat}
                    </span>
                  </button>
                );
              })}
            </div>
          </LayoutGroup>
        </div>
      </div>

      {/* Main Row layout view */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left column */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {/* Section 1: Selecting Frame Border Design */}
          <div>
            <h3 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <Sparkles size={14} className="text-[#FF9A9A]" />
              <span>1. SELECT STICKER BORDER DESIGN</span>
            </h3>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="show"
              className="grid grid-cols-2 md:grid-cols-3 gap-3"
            >
              <AnimatePresence mode="popLayout">
                {framesList
                  .filter(
                    (frame) =>
                      categoryFilter === "All" ||
                      frame.category === categoryFilter,
                  )
                  .map((frame) => {
                    const isSelected = selectedFrame.id === frame.id;

                    return (
                      <motion.button
                        layout
                        variants={itemVariants}
                        whileHover={{ scale: 1.04, y: -4 }}
                        whileTap={{ scale: 0.96 }}
                        key={frame.id}
                        type="button"
                        onClick={() => {
                          playSound("click");
                          setSelectedFrame(frame);
                        }}
                        className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden h-28 group ${
                          isSelected
                            ? "bg-[#EA2D2D]/10"
                            : "bg-[#111111]/70 hover:bg-[#151515] hover:border-white/20"
                        }`}
                        style={{
                          borderColor: isSelected
                            ? frame.borderColor
                            : "rgba(255,255,255,0.05)",
                          boxShadow: isSelected
                            ? `0 0 22px ${frame.borderColor}55`
                            : "none",
                        }}
                      >
                        <div
                          className="absolute -right-8 -top-8 w-20 h-20 rounded-full blur-2xl opacity-35 pointer-events-none"
                          style={{ backgroundColor: frame.borderColor }}
                        />

                        <div className="flex items-center justify-between w-full relative z-10">
                          <div
                            className="w-5 h-5 rounded-md border-2 border-white/30 shadow-inner"
                            style={{ backgroundColor: frame.borderColor }}
                          />
                          <span
                            className={`font-pixel text-[6px] px-1.5 py-0.5 rounded uppercase tracking-wider ${getRarityStyles(frame.rarity)}`}
                          >
                            {frame.rarity}
                          </span>
                        </div>

                        <div className="mt-auto relative z-10 w-full">
                          <span className="font-display font-black text-xs text-white block truncate group-hover:text-[#FF9A9A] transition-colors duration-200">
                            {frame.name}
                          </span>
                          <span className="text-[9px] text-gray-500 font-mono italic block tracking-wide mt-0.5">
                            {frame.category} / {frame.layoutCount} pose
                          </span>
                        </div>
                      </motion.button>
                    );
                  })}

                {customFrames.map((frame) => {
                  const isSelected = selectedFrame.id === frame.id;

                  return (
                    <motion.button
                      layout
                      variants={itemVariants}
                      whileHover={{ scale: 1.04, y: -4 }}
                      whileTap={{ scale: 0.96 }}
                      key={frame.id}
                      type="button"
                      onClick={() => {
                        playSound("click");
                        setSelectedFrame(frame);
                      }}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex flex-col justify-between relative overflow-hidden h-28 group ${
                        isSelected
                          ? "bg-[#EA2D2D]/10"
                          : "bg-[#111111]/70 hover:bg-[#151515] hover:border-white/20"
                      }`}
                      style={{
                        borderColor: isSelected
                          ? frame.borderColor
                          : "rgba(255,255,255,0.05)",
                      }}
                    >
                      <img
                        src={frame.imageData}
                        alt={frame.name}
                        className="absolute inset-0 w-full h-full object-cover opacity-40"
                      />

                      <div className="flex items-center justify-between w-full relative z-10">
                        <div
                          className="w-5 h-5 rounded-md border-2 border-white/30 shadow-inner"
                          style={{ backgroundColor: frame.borderColor }}
                        />
                        <span className="font-pixel text-[6px] px-1.5 py-0.5 rounded uppercase tracking-wider text-cyan-400 border border-cyan-400/30 bg-cyan-400/10">
                          CUSTOM
                        </span>
                      </div>

                      <div className="mt-auto relative z-10 w-full">
                        <span className="font-display font-black text-xs text-white block truncate group-hover:text-[#FF9A9A] transition-colors duration-200">
                          {frame.name}
                        </span>
                        <span className="text-[9px] text-gray-500 font-mono italic block tracking-wide mt-0.5">
                          My Frame
                        </span>
                      </div>

                      <span
                        role="button"
                        tabIndex={0}
                        onClick={(event) => {
                          event.stopPropagation();
                          handleDeleteCustomFrame(frame.id);
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.stopPropagation();
                            handleDeleteCustomFrame(frame.id);
                          }
                        }}
                        className="absolute top-2 right-2 z-20 w-7 h-7 rounded-lg bg-black/60 border border-white/10 text-gray-300 hover:text-white hover:bg-[#EA2D2D] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                        aria-label={`Delete ${frame.name}`}
                      >
                        <Trash2 size={13} />
                      </span>
                    </motion.button>
                  );
                })}

                <motion.button
                  layout
                  variants={itemVariants}
                  whileHover={{ scale: 1.04, y: -4 }}
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => {
                    playSound("click");
                    setShowUploadModal(true);
                  }}
                  className="p-3.5 rounded-xl border-2 border-dashed border-white/20 hover:border-[#EA2D2D]/50 bg-[#111111]/30 hover:bg-[#EA2D2D]/5 flex flex-col justify-center items-center gap-2 relative overflow-hidden h-28 cursor-pointer transition-all group"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#EA2D2D]/20 group-hover:bg-[#EA2D2D]/30 flex items-center justify-center transition-all">
                    <Plus size={20} className="text-[#EA2D2D]" />
                  </div>
                  <span className="text-[10px] font-pixel text-gray-400 group-hover:text-white transition-colors">
                    UPLOAD FRAME
                  </span>
                </motion.button>
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Section 2: Selecting PHOTO LAYOUT PLACEMENT */}
          <div className="border-t-2 border-white/10 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-5">
              <h3 className="font-display font-bold text-xs text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <Grid size={14} className="text-[#FF9A9A]" />
                <span>2. SELECT PHOTO SLOT LAYOUT (A-K)</span>
              </h3>

              {/* Pose Filtering grouping tabs */}
              <LayoutGroup id="pose-filters">
                <div className="flex bg-zinc-950 p-1.5 rounded-lg border border-white/5 gap-1.5 self-start md:self-auto shadow-inner">
                  {["All", "1 Pose", "2 Pose", "3 Pose", "4 Pose"].map(
                    (group) => {
                      const isActive = poseGroupFilter === group;
                      return (
                        <button
                          key={group}
                          type="button"
                          onClick={() => {
                            playSound("click");
                            setPoseGroupFilter(group);
                          }}
                          className="px-2.5 py-1 text-[9px] font-pixel transition-colors relative cursor-pointer"
                        >
                          {isActive && (
                            <motion.span
                              layoutId="activePoseBackground"
                              className="absolute inset-0 bg-white/5 rounded border border-white/10 shadow-sm"
                              transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 25,
                              }}
                            />
                          )}
                          <span
                            className={`relative z-10 ${isActive ? "text-[#FF9A9A]" : "text-gray-500 hover:text-white"}`}
                          >
                            {group}
                          </span>
                        </button>
                      );
                    },
                  )}
                </div>
              </LayoutGroup>
            </div>

            {/* List Layout presets grouped - no visual scrollbars */}
            <div className="flex flex-col gap-6 max-h-[480px] overflow-y-auto pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {layoutGroups
                .filter((group) => {
                  if (poseGroupFilter === "All") return true;
                  const filterVal = parseInt(poseGroupFilter);
                  return (
                    group.layouts.length > 0 &&
                    group.layouts[0].poseCount === filterVal
                  );
                })
                .map((group) => (
                  <motion.div
                    layout="position"
                    key={group.title}
                    className="flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-pixel text-[#FF9A9A] bg-[#EA2D2D]/15 px-2.5 py-0.5 rounded border border-[#EA2D2D]/30 tracking-wider">
                        {group.title}
                      </span>
                      <div className="flex-1 h-[1px] bg-gradient-to-r from-white/10 to-transparent" />
                    </div>

                    <motion.div
                      variants={containerVariants}
                      initial="hidden"
                      animate="show"
                      className="grid grid-cols-2 sm:grid-cols-3 gap-3"
                    >
                      {group.layouts.map((layout) => {
                        const isSelected = selectedLayoutId === layout.id;
                        return (
                          <motion.div
                            layout="position"
                            variants={itemVariants}
                            whileHover={{
                              scale: 1.04,
                              rotateX: 4,
                              rotateY: -4,
                            }}
                            whileTap={{ scale: 0.96 }}
                            key={layout.id}
                            onClick={() => handleSelectLayout(layout)}
                            className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between items-center group relative ${
                              isSelected
                                ? "bg-[#EA2D2D]/5 shadow-[0_0_20px_rgba(234,45,45,0.12)]"
                                : "bg-neutral-950/60 border-white/5 hover:border-white/15"
                            }`}
                            style={{
                              perspective: 1000,
                              borderColor: isSelected
                                ? selectedFrame.borderColor
                                : "rgba(255,255,255,0.05)",
                            }}
                          >
                            {/* Neon Selection Ring Glow */}
                            {isSelected && (
                              <div
                                className="absolute inset-0 opacity-10 pointer-events-none transition-opacity blur-sm border-2 rounded-xl"
                                style={{
                                  borderColor: selectedFrame.borderColor,
                                }}
                              />
                            )}

                            {/* Frame mini representation container */}
                            <div className="w-full h-36 flex items-center justify-center p-2 bg-zinc-900 border border-white/5 group-hover:border-white/10 rounded-lg overflow-hidden transition-all relative">
                              <div
                                className={`transform origin-center transition-transform duration-300 w-full flex items-center justify-center ${
                                  layout.size === "2x6"
                                    ? "scale-[0.32] group-hover:scale-[0.36]"
                                    : "scale-[0.42] group-hover:scale-[0.46]"
                                }`}
                              >
                                <LayoutRenderer
                                  layoutId={layout.id}
                                  borderColor={selectedFrame.borderColor}
                                  textColor={selectedFrame.textColor}
                                  headerTheme={getFrameProp("headerTheme", "")}
                                  photos={[]}
                                  decoStyle={getFrameProp("decoStyle", "")}
                                  customFrameImage={"imageData" in selectedFrame ? selectedFrame.imageData : undefined}
                                />
                              </div>
                            </div>

                            <div className="w-full text-center mt-3 relative z-10">
                              <div className="flex items-center justify-center gap-1.5">
                                <span className="font-display font-black text-xs text-white uppercase tracking-tight">
                                  {layout.name}
                                </span>
                                {isSelected && (
                                  <motion.span
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                  >
                                    <Check
                                      size={11}
                                      style={{
                                        color: selectedFrame.borderColor,
                                      }}
                                    />
                                  </motion.span>
                                )}
                              </div>
                              <span className="text-[9px] font-mono text-gray-400 block mt-0.5 tracking-wider">
                                {layout.size} ({layout.poseCount} Pose)
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>

        {/* Right column: Active live preview layout (Sticky & Sized Down - No movement) */}
        <div className="lg:col-span-4 lg:sticky lg:top-6 lg:self-start flex flex-col gap-4 bg-[#111111] border-2 border-white/10 p-4 md:p-5 rounded-2xl relative overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
          {/* Glowing neon background aura matches active border */}
          <div
            className="absolute -right-20 -top-20 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: selectedFrame.borderColor }}
          />

          <div className="absolute top-3 right-3 font-pixel text-[8px] bg-white/5 border border-white/10 px-2 py-0.5 rounded text-gray-400">
            SIZE: {activeLayout.size}
          </div>

          <span className="text-xs font-pixel text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            LIVE PREVIEW
          </span>

          {/* Layout renderer preview stage with CRT Scanline theme */}
          <div className="bg-zinc-950 py-5 px-4 rounded-xl flex items-center justify-center min-h-[340px] border border-white/5 relative group overflow-hidden">
            {/* Holographic Subtle CRT Scanline overlay */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,6px_100%] pointer-events-none z-20 opacity-40" />

            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none rounded-xl" />

            <motion.div
              key={activeLayout.id + selectedFrame.id}
              initial={{ opacity: 0, scale: 0.95, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`w-full shadow-[0_10px_25px_rgba(0,0,0,0.7)] ${
                activeLayout.size === "2x6" ? "max-w-[82px]" : "max-w-[190px]"
              }`}
            >
              <LayoutRenderer
                layoutId={activeLayout.id}
                borderColor={selectedFrame.borderColor}
                textColor={selectedFrame.textColor}
                headerTheme={getFrameProp("headerTheme", "")}
                photos={[]}
                decoStyle={getFrameProp("decoStyle", "")}
                customFrameImage={"imageData" in selectedFrame ? selectedFrame.imageData : undefined}
              />
            </motion.div>
          </div>

          {/* Detail specs */}
          <div className="bg-white/5 border border-white/10 p-3 rounded-xl flex flex-col gap-1.5 text-[10px] font-mono shadow-inner relative z-10">
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-gray-400">Layout Select:</span>
              <span className="text-[#FF9A9A] font-bold uppercase">
                {activeLayout.name}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-white/5 pb-1">
              <span className="text-gray-400">Aspect Sheet:</span>
              <span className="text-white">
                {activeLayout.size === "2x6"
                  ? "Stripe (2x6)"
                  : "Postcard (4x6)"}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400">Pose Needed:</span>
              <span className="text-white font-bold">
                {activeLayout.poseCount} snapshots
              </span>
            </div>
          </div>

          {/* Confirm Button with Hover Pulse Effect */}
          <motion.button
            whileHover={{
              scale: 1.03,
              boxShadow: `0 0 20px ${selectedFrame.borderColor}80`,
            }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => {
              playSound("complete");
              setPage(6);
            }}
            className="w-full py-3 text-white font-black text-xs uppercase rounded-xl tracking-widest transition-all cursor-pointer mt-1 flex items-center justify-center gap-2 shadow-lg font-display relative z-10"
            style={{
              background: `linear-gradient(135deg, ${selectedFrame.borderColor}, #EA2D2D)`,
            }}
          >
            <CheckCircle2 size={14} />
            CONFIRM OPTIONS
          </motion.button>
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="mt-4 pt-4 border-t border-white/5">
        <button
          type="button"
          onClick={() => {
            playSound("click");
            setPage(1);
          }}
          className="text-xs text-gray-400 hover:text-white flex items-center gap-1 font-mono transition-colors cursor-pointer group"
        >
          <ArrowLeft
            size={12}
            className="group-hover:-translate-x-1 transition-transform"
          />
          BACK TO HOMEPAGE
        </button>
      </div>

      {/* Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowUploadModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#111111] border-2 border-white/10 p-6 rounded-2xl max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)] flex flex-col gap-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-pixel text-[10px] text-[#ffbe3b] uppercase tracking-wider">
                  UPLOAD CUSTOM FRAME
                </span>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drop Zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed transition-all duration-300 cursor-pointer min-h-[180px] ${
                  isDragging
                    ? "border-[#EA2D2D] bg-[#EA2D2D]/10"
                    : "border-white/10 hover:border-white/20 bg-black/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                <div className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDragging ? "bg-[#EA2D2D]/20 text-[#EA2D2D]" : "bg-white/5 text-gray-400"}`}>
                    <Upload size={20} />
                  </div>
                  <div className="text-center">
                    <span className="font-display font-black text-sm text-white block">
                      {isDragging ? "DROP HERE!" : "Drop your frame image"}
                    </span>
                    <span className="text-gray-500 text-xs font-mono mt-1 block">
                      or click to browse
                    </span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {previewFrame && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-gray-400">
                    <Image size={12} className="text-[#FF9A9A]" />
                    FRAME PREVIEW
                  </div>
                  <div className="flex items-center justify-center bg-zinc-950 rounded-xl p-4 min-h-[120px] border border-white/5">
                    <img
                      src={previewFrame}
                      alt="Preview"
                      className="max-w-full max-h-[120px] object-contain rounded-lg"
                    />
                  </div>

                  <input
                    type="text"
                    value={frameName}
                    onChange={(e) => setFrameName(e.target.value)}
                    placeholder="Frame name..."
                    className="w-full px-4 py-2.5 bg-black/40 border border-white/10 rounded-xl text-white text-sm font-mono placeholder:text-gray-600 focus:border-[#EA2D2D]/50 focus:outline-none transition-colors"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 py-2.5 bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-pixel text-[9px] tracking-wider uppercase rounded-xl transition-all cursor-pointer"
                >
                  CANCEL
                </button>
                <button
                  onClick={handleSaveFrame}
                  disabled={!previewFrame || !frameName.trim()}
                  className={`flex-1 py-2.5 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    previewFrame && frameName.trim()
                      ? "bg-[#EA2D2D] hover:bg-[#C61D1D] text-white"
                      : "bg-white/5 text-gray-600 cursor-not-allowed"
                  }`}
                >
                  <Check size={14} />
                  SAVE
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
