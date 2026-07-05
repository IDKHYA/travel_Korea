import type { Point, Region } from "@/types/travel-map";
import { MAP_HEIGHT, MAP_WIDTH } from "@/lib/geometry";

export const COMPLETE_THRESHOLD = 80;
export const BRUSH_SIZE_DESKTOP = 24;
export const BRUSH_SIZE_MOBILE = 32;

export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;
  return "ontouchstart" in window || navigator.maxTouchPoints > 0;
}

export function getBrushRadius(): number {
  return (isTouchDevice() ? BRUSH_SIZE_MOBILE : BRUSH_SIZE_DESKTOP) / 2;
}

/**
 * Erases a circular brush stroke at (mapX, mapY), clipped to the region path.
 * Assumes ctx has already been scaled so its coordinate space matches the
 * 815x1100 map coordinate system (see ScratchLayer).
 */
export function scratchAt(
  ctx: CanvasRenderingContext2D,
  regionPath: Path2D,
  point: Point,
  brushRadius: number
): void {
  ctx.save();
  ctx.clip(regionPath);
  ctx.globalCompositeOperation = "destination-out";
  ctx.beginPath();
  ctx.arc(point.x, point.y, brushRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * Samples the alpha channel within the region's bbox to estimate the
 * percentage of the region that has been scratched away (erased pixels).
 * ctx must be reading from a canvas sized to the 815x1100 map coordinate
 * space (or a scale factor must be supplied).
 */
export function computeScratchProgress(
  ctx: CanvasRenderingContext2D,
  region: Region,
  regionPath: Path2D,
  scaleX: number,
  scaleY: number
): number {
  const bboxX = Math.max(0, Math.floor(region.bbox.x * scaleX));
  const bboxY = Math.max(0, Math.floor(region.bbox.y * scaleY));
  const bboxW = Math.max(1, Math.ceil(region.bbox.width * scaleX));
  const bboxH = Math.max(1, Math.ceil(region.bbox.height * scaleY));

  const canvas = ctx.canvas;
  const clampedW = Math.min(bboxW, canvas.width - bboxX);
  const clampedH = Math.min(bboxH, canvas.height - bboxY);
  if (clampedW <= 0 || clampedH <= 0) return 0;

  // Downsample for performance: cap sampling grid to ~120px on the long edge.
  const maxSample = 120;
  const step = Math.max(1, Math.ceil(Math.max(clampedW, clampedH) / maxSample));

  let insideCount = 0;
  let erasedCount = 0;

  const imageData = ctx.getImageData(bboxX, bboxY, clampedW, clampedH);
  const data = imageData.data;

  for (let y = 0; y < clampedH; y += step) {
    for (let x = 0; x < clampedW; x += step) {
      const mapX = (bboxX + x) / scaleX;
      const mapY = (bboxY + y) / scaleY;
      if (!ctx.isPointInPath(regionPath, mapX, mapY)) continue;
      insideCount += 1;
      const idx = (y * clampedW + x) * 4;
      const alpha = data[idx + 3];
      if (alpha < 10) erasedCount += 1;
    }
  }

  if (insideCount === 0) return 0;
  return Math.min(100, Math.round((erasedCount / insideCount) * 100));
}

export function scaleForCanvas(canvasWidth: number, canvasHeight: number) {
  return {
    scaleX: canvasWidth / MAP_WIDTH,
    scaleY: canvasHeight / MAP_HEIGHT,
  };
}
