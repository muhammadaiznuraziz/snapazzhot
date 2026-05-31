export interface FrameTemplate {
  id: string;
  name: string;
  category: "Football" | "Retro" | "Aesthetic" | "K-Pop" | "Anime" | "Graduation";
  rarity: "Common" | "Rare" | "Epic" | "Legendary";
  layoutCount: number; // default number of photos
  borderColor: string;
  textColor: string;
  headerTheme: string;
  decoStyle: string; // design pattern
}

export interface LayoutPreset {
  id: string;
  name: string;
  size: "2x6" | "4x6";
  poseCount: number;
  description: string;
}

export const LAYOUT_PRESETS: LayoutPreset[] = [
  { id: "LAYOUT_A", name: "LAYOUT A", size: "2x6", poseCount: 3, description: "Size 2x6, 3 Pose" },
  { id: "LAYOUT_B", name: "LAYOUT B", size: "2x6", poseCount: 4, description: "Size 2x6, 4 Pose" },
  { id: "LAYOUT_C", name: "LAYOUT C", size: "4x6", poseCount: 4, description: "Size 4x6, 4 Pose" },
  { id: "LAYOUT_D", name: "LAYOUT D", size: "4x6", poseCount: 1, description: "Size 4x6, 1 Pose" },
  { id: "LAYOUT_E", name: "LAYOUT E", size: "4x6", poseCount: 2, description: "Size 4x6, 2 Pose" },
  { id: "LAYOUT_F", name: "LAYOUT F", size: "4x6", poseCount: 1, description: "Size 4x6, 1 Pose" },
  { id: "LAYOUT_G", name: "LAYOUT G", size: "4x6", poseCount: 2, description: "Size 4x6, 2 Pose" },
  { id: "LAYOUT_H", name: "LAYOUT H", size: "4x6", poseCount: 4, description: "Size 4x6, 4 Pose" },
  { id: "LAYOUT_I", name: "LAYOUT I", size: "4x6", poseCount: 3, description: "Size 4x6, 3 Pose" },
  { id: "LAYOUT_J", name: "LAYOUT J", size: "4x6", poseCount: 3, description: "Size 4x6, 3 Pose" },
  { id: "LAYOUT_K", name: "LAYOUT K", size: "4x6", poseCount: 2, description: "Size 4x6, 2 Pose" },
];

export interface User {
  name: string;
  isGuest: boolean;
}

export interface Sticker {
  text: string;
  type: string;
  color: string;
}

export interface GeminiResult {
  commentary: string;
  stickers: Sticker[];
  fortune: string;
}

