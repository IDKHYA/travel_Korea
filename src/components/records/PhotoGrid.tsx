"use client";

import type { TravelPhoto } from "@/types/travel-map";

export function PhotoGrid({
  photos,
  onDelete,
}: {
  photos: TravelPhoto[];
  onDelete: (photoId: string) => void;
}) {
  if (photos.length === 0) {
    return <p className="text-sm text-slate-500">등록된 사진이 없습니다.</p>;
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      {photos.map((photo) => (
        <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-md bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.imageUrl} alt={photo.caption ?? "여행 사진"} className="h-full w-full object-cover" />
          <button
            type="button"
            aria-label="사진 삭제"
            onClick={() => onDelete(photo.id)}
            className="absolute right-1 top-1 hidden rounded-full bg-black/60 px-1.5 text-xs text-white group-hover:block"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
