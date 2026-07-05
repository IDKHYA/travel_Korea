import type { Point } from "@/types/travel-map";

export const MAP_WIDTH = 815;
export const MAP_HEIGHT = 1100;

export function clientToMapPoint(
  clientX: number,
  clientY: number,
  mapRect: DOMRect
): Point {
  return {
    x: ((clientX - mapRect.left) / mapRect.width) * MAP_WIDTH,
    y: ((clientY - mapRect.top) / mapRect.height) * MAP_HEIGHT,
  };
}
