import React from "react";
import { ArrowLeft, Volume2, VolumeX } from "lucide-react";
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
  user,
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
    else if (page === 3) setPage(1);
    else setPage(page - 1);
  };

  return (
    <nav
      className="flex items-center justify-between border-b border-white/10 pb-2 mb-4 select-none"
      id="snapaz-top-nav"
    >
      <div className="flex items-center gap-3 h-8">
        <AnimatePresence mode="wait">
          {page > 1 && (
            <motion.button
              key="back-btn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{
                scale: 1.1,
                backgroundColor: "rgba(234, 45, 45, 0.2)",
              }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              type="button"
              onClick={handleBackNavigation}
              className="w-8 h-8 flex items-center justify-center bg-white/5 hover:bg-[#EA2D2D]/20 border border-white/10 hover:border-[#EA2D2D]/50 rounded-lg text-slate-300 hover:text-[#FF9A9A] transition-colors cursor-pointer"
            >
              <ArrowLeft size={14} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
}
