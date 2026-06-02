import React from "react";

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
}

type StickerTone = {
  bg: string;
  color: string;
  border: string;
};

const toneFor = (decoStyle: string, borderColor: string, textColor: string): StickerTone => {
  if (decoStyle.includes("football") || decoStyle.includes("stadium") || decoStyle.includes("pitch") || decoStyle.includes("cup") || decoStyle.includes("ultras")) {
    return { bg: "#facc15", color: "#14532d", border: "#ffffff" };
  }
  if (decoStyle.includes("sakura") || decoStyle.includes("soft") || decoStyle.includes("candy") || decoStyle.includes("pink") || decoStyle.includes("festival") || decoStyle.includes("magical")) {
    return { bg: "#ffffff", color: "#be185d", border: "#f9a8d4" };
  }
  if (decoStyle.includes("manga") || decoStyle.includes("mecha") || decoStyle.includes("villain")) {
    return { bg: "#fef08a", color: "#111111", border: "#111111" };
  }
  if (decoStyle.includes("grad") || decoStyle.includes("campus") || decoStyle.includes("diploma") || decoStyle.includes("valedictorian") || decoStyle.includes("confetti")) {
    return { bg: "#fbbf24", color: "#111827", border: "#fef3c7" };
  }
  if (decoStyle.includes("idol") || decoStyle.includes("backstage") || decoStyle.includes("lightstick") || decoStyle.includes("comeback") || decoStyle.includes("practice")) {
    return { bg: "#f0abfc", color: "#4a044e", border: "#ffffff" };
  }
  if (decoStyle.includes("y2k") || decoStyle.includes("chrome")) {
    return { bg: "#ffffff", color: borderColor, border: textColor };
  }
  return { bg: borderColor, color: textColor, border: "#ffffff" };
};

const stickerSetFor = (decoStyle: string, headerTheme: string) => {
  const upperHeader = headerTheme.toUpperCase();

  if (decoStyle.includes("football") || decoStyle.includes("stadium") || decoStyle.includes("pitch") || decoStyle.includes("cup") || decoStyle.includes("ultras")) {
    return ["GOAL", "MATCH", "90+", "WIN"];
  }
  if (decoStyle.includes("sakura") || decoStyle.includes("soft") || decoStyle.includes("candy") || decoStyle.includes("pink")) {
    return ["DREAM", "SOFT", "CUTIE", "LOVE"];
  }
  if (decoStyle.includes("manga")) {
    return ["BANG", "POW", "ACTION", "SPEED"];
  }
  if (decoStyle.includes("mecha")) {
    return ["UNIT", "CORE", "SYNC", "01"];
  }
  if (decoStyle.includes("villain")) {
    return ["DARK", "EDGE", "NOIR", "CUT"];
  }
  if (decoStyle.includes("grad") || decoStyle.includes("campus") || decoStyle.includes("diploma") || decoStyle.includes("valedictorian") || decoStyle.includes("confetti")) {
    return ["CLASS", "2026", "HONOR", "GOLD"];
  }
  if (decoStyle.includes("idol") || decoStyle.includes("backstage") || decoStyle.includes("lightstick") || decoStyle.includes("comeback") || decoStyle.includes("practice") || upperHeader.includes("IDOL") || upperHeader.includes("STAGE") || upperHeader.includes("LIGHTSTICK")) {
    return ["IDOL", "LIVE", "FAN", "STAR"];
  }
  if (decoStyle.includes("vhs") || decoStyle.includes("chrome") || upperHeader.includes("VHS") || upperHeader.includes("DINER") || upperHeader.includes("1998")) {
    return ["VHS", "REC", "PLAY", "RETRO"];
  }
  return ["SNAP", "FLASH", "HOT", "POSE"];
};

const backgroundFor = (decoStyle: string, borderColor: string, textColor: string) => {
  if (decoStyle.includes("football") || decoStyle.includes("stadium") || decoStyle.includes("pitch") || decoStyle.includes("cup") || decoStyle.includes("ultras")) {
    return "repeating-linear-gradient(135deg, rgba(255,255,255,.14) 0 12px, rgba(0,0,0,.1) 12px 24px), radial-gradient(circle at 20% 25%, rgba(250,204,21,.3), transparent 22%)";
  }
  if (decoStyle.includes("sakura") || decoStyle.includes("soft") || decoStyle.includes("candy") || decoStyle.includes("festival") || decoStyle.includes("magical") || decoStyle.includes("pink")) {
    return "radial-gradient(circle at 20% 20%, rgba(255,255,255,.65), transparent 16%), radial-gradient(circle at 80% 18%, rgba(255,255,255,.35), transparent 15%), radial-gradient(circle at 60% 86%, rgba(255,255,255,.3), transparent 18%)";
  }
  if (decoStyle.includes("manga") || decoStyle.includes("mecha") || decoStyle.includes("villain")) {
    return "radial-gradient(#ffffff66 1.5px, transparent 1.5px), linear-gradient(135deg, rgba(255,255,255,.16), transparent 38%)";
  }
  if (decoStyle.includes("grad") || decoStyle.includes("campus") || decoStyle.includes("diploma") || decoStyle.includes("valedictorian") || decoStyle.includes("confetti")) {
    return "radial-gradient(circle, rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(135deg, rgba(251,191,36,.35), transparent 45%)";
  }
  if (decoStyle.includes("idol") || decoStyle.includes("backstage") || decoStyle.includes("lightstick") || decoStyle.includes("comeback") || decoStyle.includes("practice")) {
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
}: LayoutRendererProps) {
  const stickerTone = toneFor(decoStyle, borderColor, textColor);
  const stickers = stickerSetFor(decoStyle, headerTheme);

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
          decoStyle.includes("neon") || decoStyle.includes("idol") || decoStyle.includes("lightstick") || decoStyle.includes("practice")
            ? "18px 18px, 18px 18px, auto"
            : decoStyle.includes("manga") || decoStyle.includes("mecha") || decoStyle.includes("grad") || decoStyle.includes("campus") || decoStyle.includes("diploma") || decoStyle.includes("confetti")
              ? "10px 10px, auto"
              : undefined,
      };

  const renderSlot = (index: number, aspectClass: string = "aspect-[4/3]") => {
    const hasPhoto = photos && photos[index];
    const isActive = isRecordingMode && index === activeSlotIndex;
    const filterStyle =
      hasPhoto && getFilterStyle ? getFilterStyle(selectedFilter, filterIntensity) : "";

    return (
      <div
        key={index}
        className={`relative w-full ${aspectClass} bg-neutral-900 border transition-all overflow-hidden flex flex-col justify-center items-center shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] ${
          isActive
            ? "border-[#EA2D2D] ring-2 ring-[#EA2D2D] scale-[1.02] z-10 animate-pulse"
            : "border-white/15"
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
            <span className="font-pixel text-[8px] text-[#FF9A9A] tracking-tight animate-pulse">
              EMPTY
            </span>
            <span className="font-mono text-[7px] text-gray-500 mt-0.5">
              SLOT #{index + 1}
            </span>
          </div>
        )}

        <div className="absolute top-1 left-1 bg-black/65 px-1 rounded font-mono text-[6px] text-white pointer-events-none select-none">
          #{index + 1}
        </div>
      </div>
    );
  };

  const renderEmptyBlackBlock = (label: string = "SNAPAZZ") => (
    <div className="w-full h-full min-h-[40px] bg-black border border-white/10 flex flex-col justify-center items-center p-2 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#EA2D2D_1px,transparent_1px)] [background-size:8px_8px]" />
      <span className="font-pixel text-[8px] text-gray-500 tracking-wider font-extrabold uppercase">
        {label}
      </span>
    </div>
  );

  const renderDecorations = () => (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-[inherit]">
        <div className="absolute -left-6 top-5 h-5 w-24 rotate-[-28deg] bg-white/20" />
        <div className="absolute -right-7 bottom-7 h-5 w-28 rotate-[-28deg] bg-black/20" />
        <div
          className="absolute left-2 top-2 h-3 w-3 rounded-full border-2"
          style={{ borderColor: stickerTone.border, backgroundColor: stickerTone.bg }}
        />
        <div
          className="absolute right-2 bottom-2 h-3 w-3 rounded-full border-2"
          style={{ borderColor: stickerTone.border, backgroundColor: stickerTone.bg }}
        />
      </div>

      <span
        className="absolute -left-1 top-10 z-20 rotate-[-12deg] rounded px-1.5 py-0.5 font-pixel text-[6px] shadow-md border"
        style={{
          backgroundColor: stickerTone.bg,
          color: stickerTone.color,
          borderColor: stickerTone.border,
        }}
      >
        {stickers[0]}
      </span>
      <span
        className="absolute right-1 top-8 z-20 rotate-[10deg] rounded-full px-1.5 py-0.5 font-pixel text-[6px] shadow-md border"
        style={{
          backgroundColor: stickerTone.bg,
          color: stickerTone.color,
          borderColor: stickerTone.border,
        }}
      >
        {stickers[1]}
      </span>
      <span
        className="absolute left-2 bottom-8 z-20 rotate-[8deg] rounded px-1.5 py-0.5 font-pixel text-[6px] shadow-md border"
        style={{
          backgroundColor: stickerTone.bg,
          color: stickerTone.color,
          borderColor: stickerTone.border,
        }}
      >
        {stickers[2]}
      </span>
      <span
        className="absolute -right-1 bottom-12 z-20 rotate-[-10deg] rounded px-1.5 py-0.5 font-pixel text-[6px] shadow-md border"
        style={{
          backgroundColor: stickerTone.bg,
          color: stickerTone.color,
          borderColor: stickerTone.border,
        }}
      >
        {stickers[3]}
      </span>
    </>
  );

  const FrameSurface = ({
    children,
    className,
  }: {
    children: React.ReactNode;
    className: string;
  }) => (
    <div
      className={`relative overflow-hidden mx-auto ${className}`}
      style={frameBackground}
    >
      {renderDecorations()}
      <div
        className="relative z-10 text-center font-bold uppercase tracking-wider truncate drop-shadow"
        style={{ color: textColor }}
      >
        {headerTheme}
      </div>
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
          <div className="mt-1">{renderEmptyBlackBlock("SNAPAZ")}</div>
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
          <div className="mt-1">{renderEmptyBlackBlock("S-B2XB")}</div>
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
          <div className="h-8">{renderEmptyBlackBlock("CHAMPIONS GRID")}</div>
        </FrameSurface>
      );

    case "LAYOUT_D":
      return (
        <FrameSurface className="w-full max-w-[280px] p-4 flex flex-col gap-3 rounded-xl aspect-[2/3]">
          <div className="flex-grow flex items-center justify-center">
            {renderSlot(0, "aspect-[3/4]")}
          </div>
          <div className="h-8">{renderEmptyBlackBlock("SINGLE SHOT")}</div>
        </FrameSurface>
      );

    case "LAYOUT_E":
      return (
        <FrameSurface className="w-full max-w-[280px] p-4 flex flex-col gap-3 rounded-xl aspect-[2/3]">
          <div className="flex flex-col gap-2 flex-grow">
            {renderSlot(0, "aspect-[5/3]")}
            {renderSlot(1, "aspect-[5/3]")}
          </div>
          <div className="h-8">{renderEmptyBlackBlock("DUAL STACK")}</div>
        </FrameSurface>
      );

    case "LAYOUT_F":
      return (
        <FrameSurface className="w-full max-w-[340px] p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]">
          <div className="flex-grow flex items-center justify-center">
            {renderSlot(0, "aspect-[4/3] max-h-[190px]")}
          </div>
          <div className="h-8">{renderEmptyBlackBlock("LANDSCAPE SOLO")}</div>
        </FrameSurface>
      );

    case "LAYOUT_G":
      return (
        <FrameSurface className="w-full max-w-[340px] p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]">
          <div className="grid grid-cols-2 gap-2 flex-grow items-center">
            {renderSlot(0, "aspect-[4/5]")}
            {renderSlot(1, "aspect-[4/5]")}
          </div>
          <div className="h-8">{renderEmptyBlackBlock("SIDE BY SIDE")}</div>
        </FrameSurface>
      );

    case "LAYOUT_H":
      return (
        <FrameSurface className="w-full max-w-[340px] p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]">
          <div className="flex flex-col gap-2 flex-grow">
            <div className="grid grid-cols-2 gap-2 h-[45%]">
              {renderSlot(0, "h-full")}
              {renderEmptyBlackBlock("SNAPAZZHOT")}
            </div>
            <div className="grid grid-cols-3 gap-2 h-[50%]">
              {renderSlot(1, "h-full")}
              {renderSlot(2, "h-full")}
              {renderSlot(3, "h-full")}
            </div>
          </div>
          <div className="h-6 mt-1 flex items-center justify-center">
            <span className="font-pixel text-[8px] tracking-widest text-white/50 uppercase">
              COMBINED MISCELLANEOUS
            </span>
          </div>
        </FrameSurface>
      );

    case "LAYOUT_I":
      return (
        <FrameSurface className="w-full max-w-[340px] p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]">
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <div className="flex flex-col gap-2">
              {renderSlot(0, "flex-1")}
              {renderSlot(1, "flex-1")}
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex-1">{renderEmptyBlackBlock("ARCHIVE-M")}</div>
              {renderSlot(2, "flex-1")}
            </div>
          </div>
          <div className="h-6">{renderEmptyBlackBlock("STATION THREE")}</div>
        </FrameSurface>
      );

    case "LAYOUT_J":
      return (
        <FrameSurface className="w-full max-w-[340px] p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]">
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <div className="flex flex-col gap-2">
              {renderSlot(0, "flex-1")}
              {renderSlot(1, "flex-1")}
            </div>
            <div className="flex flex-col gap-2">
              {renderSlot(2, "flex-1")}
              <div className="flex-1">{renderEmptyBlackBlock("RETRO-GLOW")}</div>
            </div>
          </div>
          <div className="h-6">{renderEmptyBlackBlock("SPECTRUM J")}</div>
        </FrameSurface>
      );

    case "LAYOUT_K":
      return (
        <FrameSurface className="w-full max-w-[340px] p-4 flex flex-col gap-3 rounded-xl aspect-[3/2]">
          <div className="grid grid-cols-2 gap-2 flex-grow">
            <div className="flex flex-col gap-2">
              {renderSlot(0, "flex-1")}
              {renderSlot(1, "flex-1")}
            </div>
            <div className="h-full">{renderEmptyBlackBlock("VOID STICKERS")}</div>
          </div>
          <div className="h-6">{renderEmptyBlackBlock("K-SERIES")}</div>
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
