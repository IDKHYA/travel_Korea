"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import type { Region, UserRegionStatus } from "@/types/travel-map";
import { RegionLayer } from "@/components/map/RegionLayer";
import { ScratchLayer } from "@/components/map/ScratchLayer";
import { TooltipLayer } from "@/components/map/TooltipLayer";

export function TravelScratchMap({
  regions,
  getStatus,
  selectedRegionId,
  scratchModeRegionId,
  onSelect,
  onProgress,
  photoCountForRegion,
  recordCountForRegion,
}: {
  regions: Region[];
  getStatus: (regionId: string) => UserRegionStatus;
  selectedRegionId: string | null;
  scratchModeRegionId: string | null;
  onSelect: (regionId: string) => void;
  onProgress: (regionId: string, progress: number) => void;
  photoCountForRegion: (regionId: string) => number;
  recordCountForRegion: (regionId: string) => number;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [hoveredRegionId, setHoveredRegionId] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const handleHover = (regionId: string | null, clientPos: { x: number; y: number } | null) => {
    setHoveredRegionId(regionId);
    if (!clientPos || !containerRef.current) {
      setTooltipPos(null);
      return;
    }
    const rect = containerRef.current.getBoundingClientRect();
    setTooltipPos({ x: clientPos.x - rect.left, y: clientPos.y - rect.top });
  };

  const hoveredRegion = regions.find((r) => r.id === hoveredRegionId) ?? null;
  const hoveredStatus = hoveredRegion ? getStatus(hoveredRegion.id) : null;

  return (
    <div
      ref={containerRef}
      className="relative mx-auto w-full max-w-md select-none"
      style={{
        aspectRatio: "815 / 1100",
        // While scratching, lock the whole map area against page scroll/zoom
        // gestures so a drag stays a scratch instead of scrolling the page.
        touchAction: scratchModeRegionId ? "none" : "manipulation",
        overscrollBehavior: "contain",
      }}
    >
      <Image
        src="/maps/map-color@4x.webp"
        alt="대한민국 컬러 지도"
        fill
        priority
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
      />
      <ScratchLayer
        regions={regions}
        getStatus={getStatus}
        activeRegionId={scratchModeRegionId}
        onProgress={onProgress}
      />
      <RegionLayer
        regions={regions}
        getStatus={getStatus}
        selectedRegionId={selectedRegionId}
        hoveredRegionId={hoveredRegionId}
        onHover={handleHover}
        onSelect={onSelect}
        interactive={!scratchModeRegionId}
      />
      <TooltipLayer
        region={hoveredRegion}
        status={hoveredStatus}
        photoCount={hoveredRegion ? photoCountForRegion(hoveredRegion.id) : 0}
        recordCount={hoveredRegion ? recordCountForRegion(hoveredRegion.id) : 0}
        position={tooltipPos}
      />
    </div>
  );
}
