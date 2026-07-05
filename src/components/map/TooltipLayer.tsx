"use client";

import type { Region, UserRegionStatus } from "@/types/travel-map";

const STATUS_LABEL: Record<UserRegionStatus["status"], string> = {
  unvisited: "미방문",
  visited_unscratched: "방문 등록",
  scratching: "긁는 중",
  completed: "완료",
};

export function TooltipLayer({
  region,
  status,
  photoCount,
  recordCount,
  position,
}: {
  region: Region | null;
  status: UserRegionStatus | null;
  photoCount: number;
  recordCount: number;
  position: { x: number; y: number } | null;
}) {
  if (!region || !status || !position) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none absolute z-30 rounded-md bg-slate-900/90 px-3 py-2 text-xs text-white shadow-lg"
      style={{ left: position.x + 12, top: position.y + 12 }}
    >
      <div className="font-semibold">{region.nameKo}</div>
      <div className="text-slate-300">{region.province}</div>
      <div>상태: {STATUS_LABEL[status.status]}</div>
      <div>스크래치: {status.scratchProgress}%</div>
      <div>
        사진 {photoCount}장 · 메모 {recordCount}개
      </div>
    </div>
  );
}
