import React, { useRef, useState, useEffect } from "react";

export interface LayoutSlotConfig {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutEmptyBlock {
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutMetadata {
  canvasWidth: number;
  canvasHeight: number;
  slots: LayoutSlotConfig[];
  emptyBlocks: LayoutEmptyBlock[];
}

export const LAYOUT_METADATA: Record<string, LayoutMetadata> = {
  LAYOUT_A: {
    canvasWidth: 400,
    canvasHeight: 1120,
    slots: [
      { x: 30, y: 100, w: 340, h: 255 },
      { x: 30, y: 380, w: 340, h: 255 },
      { x: 30, y: 660, w: 340, h: 255 },
    ],
    emptyBlocks: [
      { label: "SNAPAZZHOT ORIGINAL TALL", x: 30, y: 940, w: 340, h: 60 },
    ],
  },
  LAYOUT_B: {
    canvasWidth: 400,
    canvasHeight: 1380,
    slots: [
      { x: 30, y: 100, w: 340, h: 255 },
      { x: 30, y: 380, w: 340, h: 255 },
      { x: 30, y: 660, w: 340, h: 255 },
      { x: 30, y: 940, w: 340, h: 255 },
    ],
    emptyBlocks: [
      { label: "SNAPAZZHOT QUADRANT", x: 30, y: 1210, w: 340, h: 60 },
    ],
  },
  LAYOUT_C: {
    canvasWidth: 600,
    canvasHeight: 900,
    slots: [
      { x: 40, y: 130, w: 245, h: 245 },
      { x: 315, y: 130, w: 245, h: 245 },
      { x: 40, y: 410, w: 245, h: 245 },
      { x: 315, y: 410, w: 245, h: 245 },
    ],
    emptyBlocks: [
      { label: "CHAMPIONS GRID", x: 40, y: 685, w: 520, h: 50 },
    ],
  },
  LAYOUT_D: {
    canvasWidth: 600,
    canvasHeight: 900,
    slots: [
      { x: 50, y: 130, w: 500, h: 600 },
    ],
    emptyBlocks: [
      { label: "SINGLE SHOT PORTRAIT", x: 50, y: 755, w: 500, h: 50 },
    ],
  },
  LAYOUT_E: {
    canvasWidth: 600,
    canvasHeight: 900,
    slots: [
      { x: 40, y: 130, w: 520, h: 280 },
      { x: 40, y: 440, w: 520, h: 280 },
    ],
    emptyBlocks: [
      { label: "DUAL STACK PORTRAIT", x: 40, y: 755, w: 520, h: 50 },
    ],
  },
  LAYOUT_F: {
    canvasWidth: 900,
    canvasHeight: 600,
    slots: [
      { x: 120, y: 100, w: 660, h: 380 },
    ],
    emptyBlocks: [
      { label: "LANDSCAPE SOLO", x: 120, y: 500, w: 660, h: 40 },
    ],
  },
  LAYOUT_G: {
    canvasWidth: 900,
    canvasHeight: 600,
    slots: [
      { x: 50, y: 110, w: 380, h: 360 },
      { x: 470, y: 110, w: 380, h: 360 },
    ],
    emptyBlocks: [
      { label: "SIDE BY SIDE LANDSCAPE", x: 50, y: 490, w: 800, h: 40 },
    ],
  },
  LAYOUT_H: {
  canvasWidth: 900,
  canvasHeight: 600,

  slots: [
    // hero
    { x: 50, y: 110, w: 800, h: 220 },

    // bawah kiri
    { x: 50, y: 350, w: 250, h: 180 },

    // bawah tengah
    { x: 325, y: 350, w: 250, h: 180 },

    // bawah kanan
    { x: 600, y: 350, w: 250, h: 180 },
  ],

  emptyBlocks: [
    {
      label: "★ DUAL STRIP ARTWORK ★",
      x: 50,
      y: 550,
      w: 800,
      h: 30,
    },
  ],
},
  LAYOUT_I: {
  canvasWidth: 900,
  canvasHeight: 600,
  slots: [
    // kiri atas
    { x: 50, y: 110, w: 380, h: 180 },

    // kiri bawah
    { x: 50, y: 310, w: 380, h: 180 },

    // kanan besar
    { x: 470, y: 110, w: 380, h: 380 },
  ],

  emptyBlocks: [
    {
      label: "STATION THREE",
      x: 50,
      y: 510,
      w: 800,
      h: 40,
    },
  ],
},
  LAYOUT_J: {
  canvasWidth: 900,
  canvasHeight: 600,

  slots: [
    // kanan atas
    { x: 470, y: 110, w: 380, h: 180 },

    // kanan bawah
    { x: 470, y: 310, w: 380, h: 180 },

    // kiri besar
    { x: 50, y: 110, w: 380, h: 380 },
  ],

  emptyBlocks: [
    {
      label: "SPECTRUM J",
      x: 50,
      y: 510,
      w: 800,
      h: 40,
    },
  ],
},
  LAYOUT_K: {
  canvasWidth: 900,
  canvasHeight: 600,

  slots: [
    // kiri atas
    { x: 80, y: 100, w: 260, h: 260 },

    // kanan bawah
    { x: 560, y: 240, w: 260, h: 260 },
  ],

  emptyBlocks: [
    {
      label: "K-SERIES CO",
      x: 50,
      y: 540,
      w: 800,
      h: 30,
    },
  ],
},
};

interface RenderedSlotProps {
  index: number;
  aspectClass?: string;
  style?: React.CSSProperties;
  photos: string[];
  isRecordingMode?: boolean;
  activeSlotIndex?: number;
  selectedFilter?: string;
  filterIntensity?: number;
  getFilterStyle?: (f: string, intensity: number) => string;
  photoAdjustments?: {
    [key: number]: { x: number; y: number; scale: number };
  };
}

export function RenderedSlot({
  index,
  aspectClass = "aspect-[4/3]",
  style,
  photos,
  isRecordingMode = false,
  activeSlotIndex = 0,
  selectedFilter = "Original",
  filterIntensity = 100,
  getFilterStyle,
  photoAdjustments,
}: RenderedSlotProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 280, h: 210 });

  useEffect(() => {
    if (!containerRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setDims({
          w: entry.contentRect.width,
          h: entry.contentRect.height,
        });
      }
    });
    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const hasPhoto = photos && photos[index];
  const isActive = isRecordingMode && index === activeSlotIndex;
  const filterStyle =
    hasPhoto && getFilterStyle
      ? getFilterStyle(selectedFilter, filterIntensity)
      : "";

  const adj = photoAdjustments && photoAdjustments[index]
    ? photoAdjustments[index]
    : { x: 0, y: 0, scale: 1.0 };

  // Calculate translation relative to the slot container width/height vs the crop workspace container reference dimensions (280x210)
  const scaleX = dims.w / 280;
  const scaleY = dims.h / 210;
  const tx = adj.x * scaleX;
  const ty = adj.y * scaleY;

  return (
    <div
      ref={containerRef}
      style={style}
      className={`relative w-full ${aspectClass} bg-neutral-900 border transition-all overflow-hidden flex flex-col justify-center items-center shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] ${
        isActive
          ? "border-[#EA2D2D] ring-2 ring-[#EA2D2D] scale-[1.02] z-10 animate-pulse"
          : "border-white/15"
      }`}
    >
      {hasPhoto ? (
        <div
          style={{
            width: "120%",
            height: "120%",
            transform: `translate(${tx}px, ${ty}px) scale(${adj.scale})`,
            position: "absolute",
          }}
          className="flex items-center justify-center"
        >
          <img
            src={photos[index]}
            alt={`Pose ${index + 1}`}
            className="w-full h-full object-cover pointer-events-none select-none"
            style={{ filter: filterStyle }}
          />
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-1 text-center">
          <span className="font-mono text-[20px] text-gray-500 mt-0.5">
            {index + 1}
          </span>
        </div>
      )}

      <div className="absolute top-1 left-1 bg-black/65 px-1 rounded font-mono text-[6px] text-white pointer-events-none select-none">
        #{index + 1}
      </div>
    </div>
  );
}

interface LayoutRendererProps {
  layoutId: string;
  borderColor: string;
  textColor: string;
  headerTheme: string;
  photos: string[];
  selectedFilter?: string;
  filterIntensity?: number;
  getFilterStyle?: (f: string, intensity: number) => string;
  isRecordingMode?: boolean;
  activeSlotIndex?: number;
  customFrameImage?: string;
  decoStyle?: string;
  photoAdjustments?: {
    [key: number]: { x: number; y: number; scale: number };
  };
}

const backgroundFor = (
  decoStyle: string,
  borderColor: string,
  textColor: string,
) => {
  if (
    decoStyle.includes("football") ||
    decoStyle.includes("stadium") ||
    decoStyle.includes("pitch") ||
    decoStyle.includes("cup") ||
    decoStyle.includes("ultras")
  ) {
    return "repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 12px, rgba(0,0,0,.1) 12px 24px), radial-gradient(circle at 20% 25%, rgba(250,204,21,.3), transparent 22%)";
  }
  if (
    decoStyle.includes("sakura") ||
    decoStyle.includes("soft") ||
    decoStyle.includes("candy") ||
    decoStyle.includes("festival") ||
    decoStyle.includes("magical") ||
    decoStyle.includes("pink")
  ) {
    return "radial-gradient(circle at 20% 20%, rgba(255,255,255,.65), transparent 16%), radial-gradient(circle at 80% 18%, rgba(255,255,255,.35), transparent 15%), radial-gradient(circle at 60% 86%, rgba(255,255,255,.3), transparent 18%)";
  }
  if (
    decoStyle.includes("manga") ||
    decoStyle.includes("mecha") ||
    decoStyle.includes("villain")
  ) {
    return "radial-gradient(#ffffff66 1.5px, transparent 1.5px), linear-gradient(135deg, rgba(255,255,255,.16), transparent 38%)";
  }
  if (
    decoStyle.includes("grad") ||
    decoStyle.includes("campus") ||
    decoStyle.includes("diploma") ||
    decoStyle.includes("valedictorian") ||
    decoStyle.includes("confetti")
  ) {
    return "radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(135deg, rgba(251,191,36,.35), transparent 45%)";
  }
  if (
    decoStyle.includes("idol") ||
    decoStyle.includes("backstage") ||
    decoStyle.includes("lightstick") ||
    decoStyle.includes("comeback") ||
    decoStyle.includes("practice")
  ) {
    return "radial-gradient(circle at 18% 20%, rgba(244,114,182,.55), transparent 18%), radial-gradient(circle at 82% 20%, rgba(103,232,249,.45), transparent 16%), linear-gradient(90deg, rgba(255,255,255,.14) 1px, transparent 1px)";
  }
  if (decoStyle.includes("y2k") || decoStyle.includes("chrome")) {
    return "radial-gradient(circle at 18% 18%, rgba(255,255,255,.75), transparent 18%), radial-gradient(circle at 82% 24%, rgba(255,255,255,.4), transparent 16%), linear-gradient(135deg, rgba(255,255,255,.24), transparent 42%)";
  }
  if (decoStyle.includes("rain")) {
    return "repeating-linear-gradient(100deg, rgba(255,255,255,.2) 0 1px, transparent 1px 12px), radial-gradient(circle at 20% 15%, rgba(147,197,253,.45), transparent 28%)";
  }
  return `linear-gradient(90deg, rgba(255,255,255,.09) 1px, transparent 1px), linear-gradient(rgba(255,255,255,.09) 1px, transparent 1px), radial-gradient(circle at 20% 15%, ${textColor}55, transparent 28%)`;
};

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
  customFrameImage,
  decoStyle = "grid-neon",
  photoAdjustments,
}: LayoutRendererProps) {
  const frameBackground = customFrameImage
    ? {
        backgroundColor: "transparent",
        backgroundImage: `url(${customFrameImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : {
        backgroundColor: borderColor,
        backgroundImage: backgroundFor(decoStyle, borderColor, textColor),
        backgroundSize:
          decoStyle.includes("neon") ||
          decoStyle.includes("idol") ||
          decoStyle.includes("lightstick") ||
          decoStyle.includes("practice")
            ? "18px 18px, 18px 18px, auto"
            : decoStyle.includes("manga") ||
                decoStyle.includes("mecha") ||
                decoStyle.includes("grad") ||
                decoStyle.includes("campus") ||
                decoStyle.includes("diploma") ||
                decoStyle.includes("confetti")
              ? "10px 10px, auto"
              : undefined,
      };

  const renderSlot = (index: number, aspectClass: string = "aspect-[4/3]", style?: React.CSSProperties) => {
    return (
      <RenderedSlot
        index={index}
        aspectClass={aspectClass}
        style={style}
        photos={photos}
        isRecordingMode={isRecordingMode}
        activeSlotIndex={activeSlotIndex}
        selectedFilter={selectedFilter}
        filterIntensity={filterIntensity}
        getFilterStyle={getFilterStyle}
        photoAdjustments={photoAdjustments}
      />
    );
  };

  const FrameSurface = ({
    children,
    className,
    style,
  }: {
    children: React.ReactNode;
    className: string;
    style?: React.CSSProperties;
  }) => (
    <div
      className={`relative overflow-hidden mx-auto ${className}`}
      style={{ ...frameBackground, ...style }}
    >
      {children}
    </div>
  );

  switch (layoutId) {
    case "LAYOUT_A":
      return (
        <FrameSurface className="w-full max-w-[140px] p-2.5 flex flex-col gap-2 rounded-lg">
          <div className="flex flex-col gap-2 flex-grow">
            {renderSlot(0)}
            {renderSlot(1)}
            {renderSlot(2)}
          </div>
        </FrameSurface>
      );

    case "LAYOUT_B":
      return (
        <FrameSurface className="w-full max-w-[140px] p-2.5 flex flex-col gap-2 rounded-lg">
          <div className="flex flex-col gap-2 flex-grow">
            {renderSlot(0)}
            {renderSlot(1)}
            {renderSlot(2)}
            {renderSlot(3)}
          </div>
        </FrameSurface>
      );

    case "LAYOUT_C":
      return (
        <FrameSurface className="w-full max-w-[280px] p-4 flex flex-col gap-3 rounded-xl aspect-[2/3]">
          <div className="grid grid-cols-2 gap-2 flex-grow">
            {renderSlot(0, "aspect-square")}
            {renderSlot(1, "aspect-square")}
            {renderSlot(2, "aspect-square")}
            {renderSlot(3, "aspect-square")}
          </div>
        </FrameSurface>
      );

    case "LAYOUT_D":
      return (
        <FrameSurface className="w-full max-w-[280px] p-4 rounded-xl aspect-[2/3]">
          <div className="w-full h-full items-center justify-center">
            {renderSlot(0, "aspect-square")}
          </div>
        </FrameSurface>
      );

    case "LAYOUT_E":
      return (
        <FrameSurface className="w-full max-w-[280px] p-4 flex flex-col gap-3 rounded-xl aspect-[2/3]">
          <div className="flex flex-col gap-2 flex-grow">
            {renderSlot(0, "aspect-[5/3]")}
            {renderSlot(1, "aspect-[5/3]")}
          </div>
        </FrameSurface>
      );

    case "LAYOUT_F":
      return (
        <FrameSurface className="w-full max-w-[280px] pt-3 px-3 pb-16 rounded-xl aspect-[2/3]">
          <div className="h-full flex items-center justify-center">
            {renderSlot(0, "aspect-[3/4] w-full")}
          </div>
        </FrameSurface>
      );

    case "LAYOUT_G":
      return (
        <FrameSurface className="w-full max-w-[340px] p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]">
          <div className="grid grid-cols-2 gap-2 flex-grow items-center">
            {renderSlot(0, "aspect-[4/5]")}
            {renderSlot(1, "aspect-[4/5]")}
          </div>
        </FrameSurface>
      );

    case "LAYOUT_H":
  return (
    <FrameSurface className="w-full max-w-[340px] p-4 rounded-xl aspect-[3/2]">
      <div className="flex flex-col gap-2 h-full">

        {/* Hero Photo */}
        <div>
          {renderSlot(0, "", {
            aspectRatio: "16/5",
          })}
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-3 gap-2 flex-1">
          {renderSlot(1, "", { aspectRatio: "1/1" })}
          {renderSlot(2, "", { aspectRatio: "1/1" })}
          {renderSlot(3, "", { aspectRatio: "1/1" })}
        </div>

      </div>
    </FrameSurface>
  );

    case "LAYOUT_I":
  return (
    <FrameSurface className="w-full max-w-[340px] p-4 rounded-xl aspect-[3/2]">
      <div className="grid grid-cols-[1fr_1fr] gap-2 h-full">
        
        {/* kiri */}
        <div className="flex flex-col gap-2 h-full">
          {renderSlot(0, "", {
            aspectRatio: "19/9",
            className: "flex-1",
          })}

          {renderSlot(1, "", {
            aspectRatio: "19/9",
            className: "flex-1",
          })}
        </div>

        {/* kanan */}
        <div className="h-full">
          {renderSlot(2, "", {
            aspectRatio: "1/1",
            className: "h-full",
          })}
        </div>

      </div>
    </FrameSurface>
  );

    case "LAYOUT_J":
  return (
    <FrameSurface className="w-full max-w-[340px] p-4 rounded-xl aspect-[3/2]">
      <div className="grid grid-cols-[1fr_1fr] gap-2 h-full">

        {/* kiri besar */}
        <div className="h-full">
          {renderSlot(2, "", {
            aspectRatio: "1/1",
          })}
        </div>

        {/* kanan */}
        <div className="flex flex-col gap-2 h-full">
          <div className="flex-1">
            {renderSlot(0, "", {
              aspectRatio: "19/9",
            })}
          </div>

          <div className="flex-1">
            {renderSlot(1, "", {
              aspectRatio: "19/9",
            })}
          </div>
        </div>

      </div>
    </FrameSurface>
  );

case "LAYOUT_K":
  return (
    <FrameSurface className="w-full max-w-[340px] p-4 rounded-xl aspect-[3/3]">
      <div className="grid grid-cols-2 grid-rows-2 gap-2 h-full">

        {/* kiri atas */}
        <div className="aspect-square">
          {renderSlot(0, "", { aspectRatio: "1/1" })}
        </div>

        {/* kanan atas kosong */}
        <div />

        {/* kiri bawah kosong */}
        <div />

        {/* kanan bawah */}
        <div className="aspect-square">
          {renderSlot(1, "", { aspectRatio: "1/1" })}
        </div>

      </div>
    </FrameSurface>
  );

    default:
      return (
        <div className="p-4 text-center text-xs text-red-500">
          Unknown Layout Selected ({layoutId})
        </div>
      );
  }
}
