"use client";

import { useEffect, useRef } from "react";
import type { Region, UserRegionStatus } from "@/types/travel-map";
import { clientToMapPoint, MAP_HEIGHT, MAP_WIDTH } from "@/lib/geometry";
import {
  computeScratchProgress,
  getBrushRadius,
  scaleForCanvas,
  scratchAt,
} from "@/lib/scratch";

/**
 * Draws the gray map onto a canvas and lets the user erase (scratch) the
 * currently-selected region only, revealing the color map layer beneath.
 * Completed regions are pre-erased on load so the gray layer never
 * reappears for them (FR-005 #9).
 */
export function ScratchLayer({
  regions,
  getStatus,
  activeRegionId,
  onProgress,
}: {
  regions: Region[];
  getStatus: (regionId: string) => UserRegionStatus;
  activeRegionId: string | null;
  onProgress: (regionId: string, progress: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const drawingRef = useRef(false);
  const pathCacheRef = useRef<Map<string, Path2D>>(new Map());

  const redrawBase = () => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img || !img.complete) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "source-over";
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    // Permanently erase completed regions so gray never re-covers them.
    const { scaleX, scaleY } = scaleForCanvas(canvas.width, canvas.height);
    ctx.save();
    ctx.scale(scaleX, scaleY);
    ctx.globalCompositeOperation = "destination-out";
    for (const region of regions) {
      const status = getStatus(region.id);
      if (status.status !== "completed") continue;
      const path = getPath(region);
      ctx.fill(path);
    }
    ctx.restore();
  };

  const getPath = (region: Region): Path2D => {
    let path = pathCacheRef.current.get(region.id);
    if (!path) {
      path = new Path2D(region.d);
      pathCacheRef.current.set(region.id, path);
    }
    return path;
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    redrawBase();
  };

  useEffect(() => {
    const img = new window.Image();
    img.src = "/maps/map-gray@4x.webp";
    img.onload = () => {
      imageRef.current = img;
      resizeCanvas();
    };
    imageRef.current = img;

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Redraw whenever completion states change (e.g. a region just completed).
  useEffect(() => {
    redrawBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [regions, JSON.stringify(regions.map((r) => getStatus(r.id).status))]);

  const canScratch = (regionId: string) => {
    const s = getStatus(regionId).status;
    return s === "visited_unscratched" || s === "scratching";
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current || !activeRegionId || !canScratch(activeRegionId)) return;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const region = regions.find((r) => r.id === activeRegionId);
    if (!region) return;

    const rect = container.getBoundingClientRect();
    const mapPoint = clientToMapPoint(e.clientX, e.clientY, rect);
    const { scaleX, scaleY } = scaleForCanvas(canvas.width, canvas.height);

    ctx.save();
    ctx.scale(scaleX, scaleY);
    scratchAt(ctx, getPath(region), mapPoint, getBrushRadius());
    ctx.restore();
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!activeRegionId || !canScratch(activeRegionId)) return;
    drawingRef.current = true;
    (e.target as Element).setPointerCapture(e.pointerId);
    handlePointerMove(e);
  };

  const finishStroke = () => {
    if (!drawingRef.current || !activeRegionId) return;
    drawingRef.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const region = regions.find((r) => r.id === activeRegionId);
    if (!region) return;
    const { scaleX, scaleY } = scaleForCanvas(canvas.width, canvas.height);
    const progress = computeScratchProgress(ctx, region, getPath(region), scaleX, scaleY);
    onProgress(activeRegionId, progress);
  };

  return (
    <div ref={containerRef} className="absolute inset-0 h-full w-full">
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        style={{ touchAction: "none", pointerEvents: activeRegionId ? "auto" : "none" }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        onPointerCancel={finishStroke}
      />
    </div>
  );
}
