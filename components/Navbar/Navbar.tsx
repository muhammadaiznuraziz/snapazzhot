import React from "react";
import { ArrowLeft, Volume2, VolumeX, Info, Shield } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { User } from "../../types/photobooth";

interface NavbarProps {
  page: number;
  setPage: (page: number) => void;
  user: User | null;
  muted: boolean;
  setMuted: (muted: boolean) => void;
  playSound: (type: "click" | "shutter" | "countdown" | "complete") => void;
  setActiveModal: React.Dispatch<
    React.SetStateAction<"about" | "privacy" | null>
  >;
}

export function Navbar({
  page,
  setPage,
  muted,
  setMuted,
  playSound,
  setActiveModal,
}: NavbarProps) {
  const handleBackNavigation = () => {
    if (page <= 1) return;

    playSound("click");

    if (page === 8) setPage(7);
    else if ([4, 5, 6].includes(page)) setPage(3);
    else if (page === 3) setPage(2);
    else if (page === 2) setPage(1);
    else setPage(page - 1);
  };

  const buttonClass =
    "w-14 h-14 rounded-2xl backdrop-blur-xl bg-black/40 border border-white/10 text-white flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.45)] hover:border-[#EA2D2D]/50 hover:bg-[#EA2D2D]/15 transition-all duration-300";

  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{
        opacity: 1,
        x: 0,
        y: [0, -6, 0],
      }}
      transition={{
        opacity: { duration: 0.4 },
        x: { duration: 0.4 },
        y: {
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        },
      }}
      className="fixed left-6 top-1/2 -translate-y-1/2 z-50"
    >
      <div className="relative">
        {/* Glow Background */}
        <div className="absolute inset-0 bg-[#EA2D2D]/10 blur-3xl rounded-full pointer-events-none" />

        {/* Menu Container */}
        <div className="relative flex flex-col gap-3">
          <AnimatePresence>
            {page > 1 && (
              <motion.button
                key="back-btn"
                initial={{
                  opacity: 0,
                  scale: 0.8,
                  x: -20,
                }}
                animate={{
                  opacity: 1,
                  scale: 1,
                  x: 0,
                }}
                exit={{
                  opacity: 0,
                  scale: 0.8,
                  x: -20,
                }}
                whileHover={{
                  scale: 1.08,
                  x: 4,
                }}
                whileTap={{
                  scale: 0.92,
                }}
                transition={{
                  type: "spring",
                  stiffness: 350,
                  damping: 20,
                }}
                type="button"
                onClick={handleBackNavigation}
                className={buttonClass}
              >
                <ArrowLeft size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{
              scale: 1.08,
              x: 4,
            }}
            whileTap={{
              scale: 0.92,
            }}
            onClick={() => {
              playSound("click");
              setMuted(!muted);
            }}
            className={buttonClass}
          >
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.08,
              x: 4,
            }}
            whileTap={{
              scale: 0.92,
            }}
            onClick={() => {
              playSound("click");
              setActiveModal("about");
            }}
            className={buttonClass}
          >
            <Info size={18} />
          </motion.button>

          <motion.button
            whileHover={{
              scale: 1.08,
              x: 4,
            }}
            whileTap={{
              scale: 0.92,
            }}
            onClick={() => {
              playSound("click");
              setActiveModal("privacy");
            }}
            className={buttonClass}
          >
            <Shield size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
