"use client";

import { useEffect, useRef } from "react";
import type { Region, UserRegionStatus } from "@/types/travel-map";
import { clientToMapPoint } from "@/lib/geometry";
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

  // Keep live copies of props in refs so the redraw logic (which is also
  // driven by window "resize" — bound once) always reads the CURRENT status,
  // never the stale closure captured at mount. On mobile the address bar
  // toggling fires resize constantly; a stale closure there would repaint
  // gray over already-completed regions.
  const regionsRef = useRef(regions);
  const getStatusRef = useRef(getStatus);
  const activeRegionIdRef = useRef(activeRegionId);
  useEffect(() => {
    regionsRef.current = regions;
    getStatusRef.current = getStatus;
    activeRegionIdRef.current = activeRegionId;
  });

  const getPath = (region: Region): Path2D => {
    let path = pathCacheRef.current.get(region.id);
    if (!path) {
      path = new Path2D(region.d);
      pathCacheRef.current.set(region.id, path);
    }
    return path;
  };

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
    for (const region of regionsRef.current) {
      if (getStatusRef.current(region.id).status !== "completed") continue;
      ctx.fill(getPath(region));
    }
    ctx.restore();
  };

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const rect = container.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const nextW = Math.round(rect.width * dpr);
    const nextH = Math.round(rect.height * dpr);
    // Skip if nothing actually changed. Mobile browsers fire "resize" when the
    // URL bar shows/hides even though the map (width-locked by aspect ratio)
    // did not change size — repainting there would wipe in-progress scratches.
    if (canvas.width === nextW && canvas.height === nextH) return;
    canvas.width = nextW;
    canvas.height = nextH;
    redrawBase();
  };

  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      imageRef.current = img;
      // Force initial paint even though dimensions may match.
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = 0;
        resizeCanvas();
      }
    };
    img.src = "/maps/map-gray@4x.webp";
    imageRef.current = img;

    const handleResize = () => resizeCanvas();
    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Only redraw the base when the SET OF COMPLETED regions changes (i.e. a
  // region just crossed the completion threshold). Redrawing on every status
  // string change would wipe an in-progress ("scratching") region back to gray
  // the moment it transitions from visited_unscratched to scratching.
  const completedSignature = regions
    .filter((r) => getStatus(r.id).status === "completed")
    .map((r) => r.id)
    .join(",");
  useEffect(() => {
    redrawBase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completedSignature]);

  // Prevent the page from scrolling while a scratch stroke is in progress.
  // touch-action:none alone is unreliable on mobile Safari, so we also cancel
  // touchmove with a non-passive native listener during an active stroke.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const preventScroll = (e: TouchEvent) => {
      if (drawingRef.current) e.preventDefault();
    };
    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    return () => canvas.removeEventListener("touchmove", preventScroll);
  }, []);

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
        style={{
          touchAction: "none",
          overscrollBehavior: "contain",
          pointerEvents: activeRegionId ? "auto" : "none",
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={finishStroke}
        onPointerLeave={finishStroke}
        onPointerCancel={finishStroke}
      />
    </div>
  );
}
