"use client";

import { useCallback } from "react";
import type { Region, UserRegionStatus } from "@/types/travel-map";
import { MAP_HEIGHT, MAP_WIDTH } from "@/lib/geometry";

export function RegionLayer({
  regions,
  getStatus,
  selectedRegionId,
  hoveredRegionId,
  onHover,
  onSelect,
  interactive = true,
}: {
  regions: Region[];
  getStatus: (regionId: string) => UserRegionStatus;
  selectedRegionId: string | null;
  hoveredRegionId: string | null;
  onHover: (regionId: string | null, clientPos: { x: number; y: number } | null) => void;
  onSelect: (regionId: string) => void;
  interactive?: boolean;
}) {
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<SVGPathElement>, regionId: string) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onSelect(regionId);
      }
    },
    [onSelect]
  );

  return (
    <svg
      viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}
      className="absolute inset-0 h-full w-full"
      style={{ touchAction: "none", pointerEvents: interactive ? "auto" : "none" }}
    >
      {regions.map((region) => {
        const status = getStatus(region.id);
        const isSelected = region.id === selectedRegionId;
        const isHovered = region.id === hoveredRegionId;
        return (
          <path
            key={region.id}
            d={region.d}
            role="button"
            tabIndex={0}
            aria-label={`${region.nameKo}, ${region.province}, ${status.status}`}
            className="cursor-pointer outline-none"
            fill={isHovered ? "rgba(59,130,246,0.15)" : "transparent"}
            stroke={isSelected ? "#2563eb" : isHovered ? "#60a5fa" : "transparent"}
            strokeWidth={isSelected ? 2 : 1}
            onMouseEnter={(e) => onHover(region.id, { x: e.clientX, y: e.clientY })}
            onMouseMove={(e) => onHover(region.id, { x: e.clientX, y: e.clientY })}
            onMouseLeave={() => onHover(null, null)}
            onClick={() => onSelect(region.id)}
            onFocus={() => onHover(region.id, null)}
            onKeyDown={(e) => handleKeyDown(e, region.id)}
          />
        );
      })}
    </svg>
  );
}
