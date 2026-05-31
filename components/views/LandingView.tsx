import React from "react";
import { motion } from "motion/react";
import { ChevronRight, ShieldCheck, Zap } from "lucide-react";

interface LandingViewProps {
  handleLoginGoogle: () => void;
  handleContinueGuest: () => void;
}

export function LandingView({
  handleLoginGoogle,
  handleContinueGuest,
}: LandingViewProps) {
  // Custom text splitting function for the multi-colored staggering title
  const renderStaggeredTitle = (text: string) => {
    // Define a spectrum of colors for the letters
    const letterColors = [
      "#EA2D2D", // Snap Red
      "#FF6B6B", // Soft Pink
      "#FDB022", // Sunshine Yellow
      "#32D583", // Mint Green
      "#44D7B6", // Cyan
      "#6366F1", // Indigo
      "#A855F7", // Purple
      "#EC4899", // Magenta
    ];

    return text.split("").map((char, index) => (
      <motion.span
        key={index}
        initial={{ opacity: 0, y: 30, rotateX: 90 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 20,
          delay: 0.1 + index * 0.03, // Staggered delay
        }}
        className="inline-block leading-[0.8] tracking-tighter"
        style={{
          color: letterColors[index % letterColors.length],
          textShadow: `0 0 10px ${letterColors[index % letterColors.length]}40`,
        }}
      >
        {char}
      </motion.span>
    ));
  };

  return (
    <motion.div
      key="page-landing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center"
      id="view-landing"
    >
      {/* Left Column Content */}
      <div className="lg:col-span-6 flex flex-col items-start gap-6">
        <h1 className="text-6xl md:text-8xl font-display font-black leading-none uppercase select-none">
          {renderStaggeredTitle("SNAPAZZHOT")}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-gray-200 text-lg md:text-xl font-normal leading-relaxed max-w-xl font-sans"
        >
          snapazzhot blends retro arcade machine nostalgia, vibrant Japanese
          aesthetic filters, and modern photo-sticker sharing presets. Join
          online now!
        </motion.p>

        {/* Login with Google & Guest Mode Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full sm:flex sm:items-center gap-4 mt-6"
        >
          <motion.button
            whileHover={{
              scale: 1.05,
              y: -2,
              boxShadow: "0 0 25px rgba(234,45,45,0.6)",
            }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleLoginGoogle}
            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-br from-[#EA2D2D] via-[#FF6B6B] to-[#FDB022] hover:from-[#C61D1D] hover:to-[#FF6B6B] text-white font-black rounded-xl transition-all text-center tracking-widest duration-200 shadow-xl cursor-pointer flex items-center justify-center gap-3 font-display uppercase text-sm group"
            style={{ borderRadius: "14px" }}
          >
            start
            <ChevronRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </motion.button>
        </motion.div>
      </div>

      {/* Right Column Layout: Animated Purikura Sticker Strip Mockups */}
      <div className="lg:col-span-6 flex justify-center items-center relative min-h-[450px]">
        {/* Background decorative blurry circles */}
        <div className="absolute top-10 left-10 w-44 h-44 rounded-full bg-[#EA2D2D]/25 blur-3xl -z-10 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full bg-[#44D7B6]/15 blur-3xl -z-10 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-10 right-10 w-48 h-48 rounded-full bg-indigo-500/10 blur-3xl -z-10"></div>

        {/* Animated sticker photo strip falling down */}
        <div className="relative flex gap-6 rotate-6 transform transition-transform duration-500 scale-105">
          {/* Photo Strip 1 - Constant Floating Animation */}
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 md:w-44 bg-[#12081c] p-2.5 rounded-xl border border-[#EC4899]/50 shadow-[0_0_30px_rgba(236,72,153,0.3)] flex flex-col gap-2.5"
          >
            <div className="font-pixel text-[8px] text-[#FF9A9A] text-center mt-1">
              TOKYO Y2K
            </div>
            <div className="h-24 bg-gradient-to-tr from-pink-400 to-indigo-500 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <span className="absolute bottom-1 left-1 text-[8px] font-mono text-white/50">
                #1
              </span>
            </div>
            <div className="h-24 bg-gradient-to-tr from-[#EA2D2D] via-[#FDB022] to-[#FF6B6B] rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <span className="absolute bottom-1 left-1 text-[8px] font-mono text-white/50">
                #2
              </span>
            </div>
            <div className="h-24 bg-gradient-to-tr from-cyan-400 to-blue-600 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-black/10"></div>
              <span className="absolute bottom-1 left-1 text-[8px] font-mono text-white/50">
                #3
              </span>
            </div>
            <motion.div
              animate={{ opacity: [1, 0.6, 1], scale: [1, 1.05, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="text-[9px] font-pixel text-yellow-300 text-center mt-1 scale-90"
            >
              ✨ ULTRA RARE
            </motion.div>
          </motion.div>

          {/* Photo Strip 2 - Constant Floating Animation (Opposite) */}
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5,
            }}
            className="w-32 md:w-44 bg-[#FFEBEB] p-2.5 rounded-xl border border-white shadow-[0_0_20px_rgba(255,255,255,0.4)] flex flex-col gap-2.5 translate-y-12 -rotate-12 border-4 border-[#FF9A9A]"
          >
            <div className="font-pixel text-[8px] text-[#FF6B6B] text-center mt-1">
              さくら SWEET
            </div>
            <div className="h-24 bg-gradient-to-br from-pink-100 to-pink-300 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
            </div>
            <div className="h-24 bg-gradient-to-br from-[#FF9A9A] via-[#A855F7]/30 to-[#44D7B6]/30 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
            </div>
            <div className="h-24 bg-gradient-to-br from-rose-200 via-rose-400 to-indigo-100 rounded relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5"></div>
            </div>
            <div className="text-[10px] font-pixel text-rose-500 text-center mt-1 tracking-widest font-black">
              COMMON
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
