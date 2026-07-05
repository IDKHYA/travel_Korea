"use client";

import type { Region, TravelPhoto, TravelRecord, UserRegionStatus } from "@/types/travel-map";

export function TravelStats({
  regions,
  statuses,
  photos,
  records,
}: {
  regions: Region[];
  statuses: Record<string, UserRegionStatus>;
  photos: TravelPhoto[];
  records: TravelRecord[];
}) {
  const total = regions.length;
  const values = Object.values(statuses);
  const visited = values.filter((s) => s.status !== "unvisited").length;
  const completed = values.filter((s) => s.status === "completed").length;
  const rate = total === 0 ? 0 : Math.round((completed / total) * 1000) / 10;

  return (
    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-sm text-slate-600">
      <span>
        완료 {completed} / {total}
      </span>
      <span>방문 등록 {visited}</span>
      <span>달성률 {rate}%</span>
      <span>사진 {photos.length}장</span>
      <span>여행 기록 {records.length}개</span>
    </div>
  );
}
