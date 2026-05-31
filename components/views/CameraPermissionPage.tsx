import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Info, ShieldCheck, Aperture } from 'lucide-react';

interface CameraPermissionPageProps {
handleAllowAccess: () => void;
playSound: (type: 'click' | 'shutter' | 'countdown' | 'complete') => void;
setPage: (page: number) => void;
}

export function CameraPermissionPage({
handleAllowAccess,
playSound,
setPage
}: CameraPermissionPageProps) {

// Animasi untuk elemen muncul satu per satu
const containerVariants = {
hidden: { opacity: 0, scale: 0.9 },
visible: {
opacity: 1,
scale: 1,
transition: {
delayChildren: 0.1,
staggerChildren: 0.1,
type: 'spring',
stiffness: 300,
damping: 25
}
}
};

const itemVariants = {
hidden: { y: 20, opacity: 0 },
visible: { y: 0, opacity: 1 }
};

return (
<motion.div
variants={containerVariants}
initial="hidden"
animate="visible"
exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
className="w-full max-w-md bg-[#111111] border-2 border-white/10 p-8 rounded-[2rem] text-center relative overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]"
id="view-camera-permission"
>
{/* Ornamen HUD Kamera di Sudut (Viewfinder Corners) */}





  {/* Bagian Ikon dengan Animasi Scan */}
  <motion.div variants={itemVariants} className="relative w-24 h-24 mx-auto mb-8">
    <div className="absolute inset-0 bg-[#EA2D2D]/10 rounded-full animate-pulse" />
    <div className="w-full h-full border-2 border-dashed border-[#EA2D2D]/50 rounded-full flex items-center justify-center relative overflow-hidden">
      <Camera className="text-[#EA2D2D] z-10" size={36} />
      
      {/* Animasi Garis Laser Scan */}
      <motion.div 
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[2px] bg-[#EA2D2D] shadow-[0_0_15px_#EA2D2D] opacity-50 z-20"
      />
    </div>
    
    {/* Floating Aperture Ornaments */}
    <motion.div 
      animate={{ rotate: 360 }}
      transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
      className="absolute -top-2 -right-2 text-[#FF9A9A]/30"
    >
      <Aperture size={20} />
    </motion.div>
  </motion.div>

  {/* Judul & Teks Jepang */}
  <motion.div variants={itemVariants}>
    <span className="font-pixel text-[10px] text-[#FF9A9A] tracking-widest block mb-1">
      カメラへのアクセス許可
    </span>
    <h2 className="text-2xl font-display font-black text-white uppercase leading-none tracking-tight">
      CAMERA ACCESS <span className="text-[#EA2D2D]">REQUESTED</span>
    </h2>
  </motion.div>

  {/* Deskripsi */}
  <motion.p variants={itemVariants} className="text-gray-400 text-sm mt-4 leading-relaxed mb-10 px-4">
    In order to take high quality purikura photos, please grant webcam access. 
    <span className="text-white/60 block mt-1">We only process streams locally in your browser.</span>
  </motion.p>

  {/* Tombol-tombol Tindakan */}
  <div className="flex flex-col gap-4 relative z-10">
    <motion.button
      variants={itemVariants}
      whileHover={{ scale: 1.03, boxShadow: "0 0 25px rgba(234, 45, 45, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={handleAllowAccess}
      className="w-full py-4 bg-gradient-to-br from-[#EA2D2D] to-[#FF6B6B] text-white font-bold rounded-2xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-3 group"
    >
      <ShieldCheck size={20} className="group-hover:rotate-12 transition-transform" />
      ALLOW ACCESS & CONTINUE
    </motion.button>

    <motion.button
      variants={itemVariants}
      whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.1)" }}
      type="button"
      onClick={() => { playSound('click'); setPage(3); }}
      className="w-full py-3.5 bg-white/5 border border-white/10 text-gray-400 font-medium rounded-2xl transition-all cursor-pointer hover:text-white"
    >
      CANCEL
    </motion.button>
  </div>

  {/* Background Glow tipis untuk kedalaman visual */}
  <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#EA2D2D]/5 blur-[80px] -z-10" />
</motion.div>


);
}