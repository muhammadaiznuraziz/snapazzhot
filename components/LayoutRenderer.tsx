import React from 'react';
import { LayoutPreset } from '../types/photobooth';

interface LayoutRendererProps {
  layoutId: string;
  borderColor: string;
  textColor: string;
  headerTheme: string;
  photos: string[]; // can be empty or full
  selectedFilter?: string;
  filterIntensity?: number;
  getFilterStyle?: (f: string, intensity: number) => string;
  isRecordingMode?: boolean; // if true, highlight active slot
  activeSlotIndex?: number;
}

export function LayoutRenderer({
  layoutId,
  borderColor,
  textColor,
  headerTheme,
  photos,
  selectedFilter = "Original",
  filterIntensity = 100,
  getFilterStyle,
  isRecordingMode = false,
  activeSlotIndex = 0,
}: LayoutRendererProps) {
  
  // Render a single photo slot
  const renderSlot = (index: number, aspectClass: string = "aspect-[4/3]") => {
    const hasPhoto = photos && photos[index];
    const isActive = isRecordingMode && index === activeSlotIndex;
    
    // Custom filter CSS styling injection
    const filterStyle = hasPhoto && getFilterStyle 
      ? getFilterStyle(selectedFilter, filterIntensity) 
      : "";

    return (
      <div 
        key={index}
        className={`relative w-full ${aspectClass} bg-neutral-900 border transition-all overflow-hidden flex flex-col justify-center items-center ${
          isActive 
            ? "border-[#EA2D2D] ring-2 ring-[#EA2D2D] scale-[1.02] z-10 animate-pulse" 
            : "border-white/10"
        }`}
      >
        {hasPhoto ? (
          <img 
            src={photos[index]} 
            alt={`Pose ${index + 1}`}
            className="w-full h-full object-cover"
            style={{ filter: filterStyle }}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-1 text-center">
            <span className="font-pixel text-[8px] text-sticker-pink tracking-tight animate-pulse">EMPTY</span>
            <span className="font-mono text-[7px] text-gray-500 mt-0.5">SLOT #{index + 1}</span>
          </div>
        )}
        
        {/* Slot marker corner */}
        <div className="absolute top-1 left-1 bg-black/60 px-1 rounded font-mono text-[6px] text-white pointer-events-none select-none">
          #{index + 1}
        </div>
      </div>
    );
  };

  // Render non-photo empty slot styled identically to the photograph strip layout
  const renderEmptyBlackBlock = (label: string = "SNAPAZZ") => {
    return (
      <div className="w-full h-full min-h-[40px] bg-black border border-white/5 flex flex-col justify-center items-center p-2 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#EA2D2D_1px,transparent_1px)] [background-size:8px_8px]"></div>
        <span className="font-pixel text-[8px] text-gray-600 tracking-wider font-extrabold uppercase">{label}</span>
      </div>
    );
  };

  // Switch based on layout ID to generate precise layout visual structures mimicking the image:
  switch (layoutId) {
    case "LAYOUT_A": {
      // Size 2x6, 3 Pose vertical strip
      return (
        <div 
          className="w-full max-w-[140px] mx-auto p-2.5 flex flex-col gap-2 rounded-lg"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[8px] py-1 tracking-wider uppercase truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="flex flex-col gap-2 flex-grow">
            {renderSlot(0, "aspect-[4/3]")}
            {renderSlot(1, "aspect-[4/3]")}
            {renderSlot(2, "aspect-[4/3]")}
          </div>
          {/* Logo bottom space as shown */}
          <div className="mt-1">
            {renderEmptyBlackBlock("SNAPAZ")}
          </div>
        </div>
      );
    }

    case "LAYOUT_B": {
      // Size 2x6, 4 Pose vertical strip
      return (
        <div 
          className="w-full max-w-[140px] mx-auto p-2.5 flex flex-col gap-2 rounded-lg"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[8px] py-1 tracking-wider uppercase truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="flex flex-col gap-2 flex-grow">
            {renderSlot(0, "aspect-[4/3]")}
            {renderSlot(1, "aspect-[4/3]")}
            {renderSlot(2, "aspect-[4/3]")}
            {renderSlot(3, "aspect-[4/3]")}
          </div>
          <div className="mt-1">
            {renderEmptyBlackBlock("S-B2XB")}
          </div>
        </div>
      );
    }

    case "LAYOUT_C": {
      // Size 4x6, 4 Pose, 2x2 grid
      return (
        <div 
          className="w-full max-w-[280px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[2/3]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {renderSlot(0, "aspect-square")}
            {renderSlot(1, "aspect-square")}
            {renderSlot(2, "aspect-square")}
            {renderSlot(3, "aspect-square")}
          </div>
          <div className="h-8">
            {renderEmptyBlackBlock("CHAMPIONS GRID")}
          </div>
        </div>
      );
    }

    case "LAYOUT_D": {
      // Size 4x6, 1 Pose vertical/portrait
      return (
        <div 
          className="w-full max-w-[280px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[2/3]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="flex-grow flex items-center justify-center">
            {renderSlot(0, "aspect-[3/4]")}
          </div>
          <div className="h-8">
            {renderEmptyBlackBlock("SINGLE SHOT")}
          </div>
        </div>
      );
    }

    case "LAYOUT_E": {
      // Size 4x6, 2 Pose vertical stack
      return (
        <div 
          className="w-full max-w-[280px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[2/3]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="flex flex-col gap-2 flex-grow">
            {renderSlot(0, "aspect-[5/3]")}
            {renderSlot(1, "aspect-[5/3]")}
          </div>
          <div className="h-8">
            {renderEmptyBlackBlock("DUAL STACK")}
          </div>
        </div>
      );
    }

    case "LAYOUT_F": {
      // Size 4x6, 1 Pose landscape card
      return (
        <div 
          className="w-full max-w-[340px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="flex-grow flex items-center justify-center">
            {renderSlot(0, "aspect-[4/3] max-h-[190px]")}
          </div>
          <div className="h-8">
            {renderEmptyBlackBlock("LANDSCAPE SOLO")}
          </div>
        </div>
      );
    }

    case "LAYOUT_G": {
      // Size 4x6, 2 Pose landscape card (side-by-side)
      return (
        <div 
          className="w-full max-w-[340px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="grid grid-cols-2 gap-2 flex-grow items-center">
            {renderSlot(0, "aspect-[4/5]")}
            {renderSlot(1, "aspect-[4/5]")}
          </div>
          <div className="h-8">
            {renderEmptyBlackBlock("SIDE BY SIDE")}
          </div>
        </div>
      );
    }

    case "LAYOUT_H": {
      // Size 4x6, 4 Pose landscape grid: Top left is large photo, Top right is empty black, bottom row has 3 photos
      return (
        <div 
          className="w-full max-w-[340px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="flex flex-col gap-2 flex-grow">
            {/* Top row: columns */}
            <div className="grid grid-cols-2 gap-2 h-[45%]">
              {renderSlot(0, "h-full")}
              {renderEmptyBlackBlock("SNAPAZZHOT")}
            </div>
            {/* Bottom row: 3 columns */}
            <div className="grid grid-cols-3 gap-2 h-[50%]">
              {renderSlot(1, "h-full")}
              {renderSlot(2, "h-full")}
              {renderSlot(3, "h-full")}
            </div>
          </div>
          <div className="h-6 mt-1 flex items-center justify-center">
            <span className="font-pixel text-[8px] tracking-widest text-[#000000]/60 dark:text-white/40 uppercase">★ COMBINED MISCELLANEOUS ★</span>
          </div>
        </div>
      );
    }

    case "LAYOUT_I": {
      // Size 4x6, 3 Pose landscape. Left col: 2 photos. Right col: Top empty, Bottom is Photo #3
      return (
        <div 
          className="w-full max-w-[340px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {/* Left Column: 2 stacked */}
            <div className="flex flex-col gap-2">
              {renderSlot(0, "flex-1")}
              {renderSlot(1, "flex-1")}
            </div>
            {/* Right Column: Top empty, Bottom is Photo #3 */}
            <div className="flex flex-col gap-2">
              <div className="flex-1">
                {renderEmptyBlackBlock("ARCHIVE-M")}
              </div>
              {renderSlot(2, "flex-1")}
            </div>
          </div>
          <div className="h-6">
            {renderEmptyBlackBlock("STATION THREE")}
          </div>
        </div>
      );
    }

    case "LAYOUT_J": {
      // Size 4x6, 3 Pose landscape. Left col: 2 photos. Right col: Top is Photo #3, Bottom empty
      return (
        <div 
          className="w-full max-w-[340px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {/* Left Column: 2 stacked */}
            <div className="flex flex-col gap-2">
              {renderSlot(0, "flex-1")}
              {renderSlot(1, "flex-1")}
            </div>
            {/* Right Column: Top is Photo #3, Bottom empty */}
            <div className="flex flex-col gap-2">
              {renderSlot(2, "flex-1")}
              <div className="flex-1">
                {renderEmptyBlackBlock("RETRO-GLOW")}
              </div>
            </div>
          </div>
          <div className="h-6">
            {renderEmptyBlackBlock("SPECTRUM J")}
          </div>
        </div>
      );
    }

    case "LAYOUT_K": {
      // Size 4x6, 2 Pose landscape. Left col: 2 photos. Right col is entirely empty
      return (
        <div 
          className="w-full max-w-[340px] mx-auto p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]"
          style={{ backgroundColor: borderColor }}
        >
          <div className="text-center font-bold text-[9px] uppercase tracking-wider truncate" style={{ color: textColor }}>
            {headerTheme}
          </div>
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {/* Left Column: 2 stacked */}
            <div className="flex flex-col gap-2">
              {renderSlot(0, "flex-1")}
              {renderSlot(1, "flex-1")}
            </div>
            {/* Right Column: Entirely empty black */}
            <div className="h-full">
              {renderEmptyBlackBlock("VOID STICKERS")}
            </div>
          </div>
          <div className="h-6">
            {renderEmptyBlackBlock("K-SERIES")}
          </div>
        </div>
      );
    }

    default: {
      // Fallback
      return (
        <div className="p-4 text-center text-xs text-red-500">
          Unknown Layout Selected ({layoutId})
        </div>
      );
    }
  }
}
