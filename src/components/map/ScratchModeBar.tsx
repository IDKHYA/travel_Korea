"use client";

/**
 * Compact top bar shown while actively scratching a region. Deliberately
 * NOT a bottom sheet: on mobile a bottom-anchored panel covers the lower
 * part of the map (where the southern regions/Jeju render), making them
 * impossible to scratch. Pinning this to the top instead leaves the whole
 * map untouched and scratchable.
 */
export function ScratchModeBar({
  regionName,
  progress,
  onFinish,
}: {
  regionName: string;
  progress: number;
  onFinish: () => void;
}) {
  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-3 rounded-lg bg-blue-600 px-4 py-2.5 text-white shadow-md">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{regionName} 긁는 중 · {progress}%</p>
        <p className="truncate text-xs text-blue-100">방문한 지역을 손가락으로 긁어보세요.</p>
      </div>
      <button
        type="button"
        onClick={onFinish}
        className="shrink-0 rounded bg-white/15 px-3 py-2 text-xs font-medium hover:bg-white/25"
      >
        완료/종료
      </button>
    </div>
  );
}
