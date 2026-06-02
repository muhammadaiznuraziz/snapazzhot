// Utility for detecting photo slots in custom frame images
// Uses canvas pixel analysis to find transparent "hole" regions

export interface DetectedSlot {
  index: number;
  x: number;      // normalized 0-1 position
  y: number;      // normalized 0-1 position
  width: number;   // normalized 0-1 size
  height: number;  // normalized 0-1 size
  aspectRatio: number;
}

// Threshold for detecting transparent pixels (alpha < this = transparent)
const TRANSPARENT_THRESHOLD = 50;

interface Region {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Analyzes a custom frame image to detect transparent "hole" regions
 * where photos should be placed
 */
export async function detectFrameSlots(
  imageData: string,
  expectedSlotCount: number = 4
): Promise<DetectedSlot[]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        if (!ctx) {
          resolve([]);
          return;
        }

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const pixelData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        const regions = findTransparentRegions(pixelData, canvas.width, canvas.height);

        // Convert regions to slots
        const slots = regions.map((region, index) => {
          const width = region.maxX - region.minX;
          const height = region.maxY - region.minY;

          return {
            index,
            x: region.minX / canvas.width,
            y: region.minY / canvas.height,
            width: width / canvas.width,
            height: height / canvas.height,
            aspectRatio: width / height,
          };
        });

        // Sort by position (top-to-bottom, left-to-right)
        slots.sort((a, b) => {
          const rowA = Math.floor(a.y * 3);
          const rowB = Math.floor(b.y * 3);
          if (rowA !== rowB) return rowA - rowB;
          return a.x - b.x;
        });

        // Re-index after sorting
        slots.forEach((slot, i) => {
          slot.index = i;
        });

        resolve(slots);
      } catch (error) {
        console.error("Error detecting slots:", error);
        resolve([]);
      }
    };

    img.onerror = () => {
      console.error("Failed to load image for slot detection");
      resolve([]);
    };

    img.src = imageData;
  });
}

/**
 * Find transparent regions in pixel data
 */
function findTransparentRegions(
  pixelData: Uint8ClampedArray,
  width: number,
  height: number
): Region[] {
  const visited = new Set<string>();
  const regions: Region[] = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const key = `${x},${y}`;
      if (visited.has(key)) continue;

      const alpha = pixelData[(y * width + x) * 4 + 3];

      // If this is a transparent pixel, flood fill to find the region
      if (alpha < TRANSPARENT_THRESHOLD) {
        const region = floodFillRegion(pixelData, width, height, x, y, visited);
        if (region) {
          // Only add region if it's reasonably sized (not noise)
          const regionWidth = region.maxX - region.minX;
          const regionHeight = region.maxY - region.minY;
          const area = regionWidth * regionHeight;
          const minArea = (width * height) * 0.001; // At least 0.1% of image

          if (area >= minArea) {
            regions.push(region);
          }
        }
      }
    }
  }

  return regions;
}

/**
 * Flood fill to find all connected transparent pixels
 */
function floodFillRegion(
  pixelData: Uint8ClampedArray,
  width: number,
  height: number,
  startX: number,
  startY: number,
  visited: Set<string>
): Region | null {
  const stack: [number, number][] = [[startX, startY]];
  const regionPixels: [number, number][] = [];

  while (stack.length > 0) {
    const [x, y] = stack.pop()!;
    const key = `${x},${y}`;

    if (visited.has(key)) continue;
    if (x < 0 || x >= width || y < 0 || y >= height) continue;

    const alpha = pixelData[(y * width + x) * 4 + 3];
    if (alpha >= TRANSPARENT_THRESHOLD) continue;

    visited.add(key);
    regionPixels.push([x, y]);

    // Add neighbors
    stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
  }

  if (regionPixels.length === 0) return null;

  let minX = width, minY = height, maxX = 0, maxY = 0;

  for (const [px, py] of regionPixels) {
    minX = Math.min(minX, px);
    minY = Math.min(minY, py);
    maxX = Math.max(maxX, px);
    maxY = Math.max(maxY, py);
  }

  // Add 2px padding to ensure full visibility
  return {
    minX: Math.max(0, minX - 2),
    minY: Math.max(0, minY - 2),
    maxX: Math.min(width, maxX + 2),
    maxY: Math.min(height, maxY + 2),
  };
}

/**
 * Calculate photo adjustments based on detected slots
 * Returns scale and offset for each photo to fit in its slot
 */
export function calculateSlotAdjustments(
  slots: DetectedSlot[],
  photoWidth: number,
  photoHeight: number
): { scale: number; offsetX: number; offsetY: number }[] {
  return slots.map((slot) => {
    // Calculate the scale needed to fill the slot
    const scaleX = (slot.width * photoWidth) / photoWidth;
    const scaleY = (slot.height * photoHeight) / photoHeight;
    const scale = Math.max(scaleX, scaleY); // Use larger scale to fill slot

    // Calculate offset to center the photo in the slot
    const scaledWidth = photoWidth * scale;
    const scaledHeight = photoHeight * scale;
    const offsetX = -((scaledWidth - slot.width * photoWidth) / 2) - (slot.x * photoWidth);
    const offsetY = -((scaledHeight - slot.height * photoHeight) / 2) - (slot.y * photoHeight);

    return {
      scale,
      offsetX,
      offsetY,
    };
  });
}
