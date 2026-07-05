"use client";

import { useRef, useState } from "react";
import regionsFile from "@/data/regions.generated.mapped.json";
import type { RegionsFile } from "@/types/travel-map";
import { TravelScratchMap } from "@/components/map/TravelScratchMap";
import { RegionDetailPanel } from "@/components/map/RegionDetailPanel";
import { ScratchModeBar } from "@/components/map/ScratchModeBar";
import { RegionSearch } from "@/components/map/RegionSearch";
import { TravelStats } from "@/components/stats/TravelStats";
import { useRegionStatus } from "@/hooks/useRegionStatus";
import { useTravelRecords } from "@/hooks/useTravelRecords";
import { exportAllData, importAllData } from "@/lib/storage";

const { regions } = regionsFile as RegionsFile;

const regionIds = regions.map((r) => r.id);

export default function MapPage() {
  const {
    statuses,
    getStatus,
    registerVisit,
    cancelVisit,
    updateScratchProgress,
    fillAllRegions,
    resetAllRegions,
  } = useRegionStatus(regionIds);
  const {
    records,
    photos,
    recordsForRegion,
    photosForRegion,
    addRecord,
    deleteRecord,
    addPhoto,
    deletePhoto,
    resetAllRecords,
  } = useTravelRecords();

  const [selectedRegionId, setSelectedRegionId] = useState<string | null>(null);
  const [scratchModeRegionId, setScratchModeRegionId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectedRegion = regions.find((r) => r.id === selectedRegionId) ?? null;

  const handleSelect = (regionId: string) => {
    setSelectedRegionId(regionId);
    if (scratchModeRegionId && scratchModeRegionId !== regionId) {
      setScratchModeRegionId(null);
    }
  };

  const handleClosePanel = () => {
    setSelectedRegionId(null);
    setScratchModeRegionId(null);
  };

  const handleExport = () => {
    const blob = new Blob([exportAllData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "travel-scratch-map-backup.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    importAllData(text);
    window.location.reload();
  };

  const handleFillMap = () => {
    if (!window.confirm("전국 150개 지역을 모두 방문 완료 상태로 채울까요?")) return;
    fillAllRegions();
  };

  const handleResetMap = () => {
    if (!window.confirm("모든 방문 상태, 여행 기록, 사진을 초기화할까요? 이 작업은 되돌릴 수 없습니다.")) return;
    resetAllRegions();
    resetAllRecords();
    setSelectedRegionId(null);
    setScratchModeRegionId(null);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-3 pb-6 sm:p-4">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-lg font-bold sm:text-xl">대한민국 여행 스크래치 맵</h1>
        <p className="text-xs text-slate-500 sm:text-sm">방문한 지역을 긁어 컬러로 만들고 여행 기록을 남겨보세요.</p>
      </header>

      <RegionSearch regions={regions} onSelect={handleSelect} />

      {selectedRegion && scratchModeRegionId === selectedRegion.id && (
        <ScratchModeBar
          regionName={selectedRegion.nameKo}
          progress={getStatus(selectedRegion.id).scratchProgress}
          onFinish={() => setScratchModeRegionId(null)}
        />
      )}

      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-center">
        <TravelScratchMap
          regions={regions}
          getStatus={getStatus}
          selectedRegionId={selectedRegionId}
          scratchModeRegionId={scratchModeRegionId}
          onSelect={handleSelect}
          onProgress={updateScratchProgress}
          photoCountForRegion={(id) => photosForRegion(id).length}
          recordCountForRegion={(id) => recordsForRegion(id).length}
        />

        {selectedRegion && scratchModeRegionId !== selectedRegion.id && (
          <RegionDetailPanel
            region={selectedRegion}
            status={getStatus(selectedRegion.id)}
            records={recordsForRegion(selectedRegion.id)}
            photos={photosForRegion(selectedRegion.id)}
            onClose={handleClosePanel}
            onRegisterVisit={() => registerVisit(selectedRegion.id)}
            onCancelVisit={() => {
              cancelVisit(selectedRegion.id);
              setScratchModeRegionId(null);
            }}
            onStartScratch={() => setScratchModeRegionId(selectedRegion.id)}
            onAddRecord={(input) => {
              const record = addRecord({
                regionId: selectedRegion.id,
                title: input.title,
                visitedDate: input.visitedDate,
                memo: input.memo,
                tags: input.tags,
              });
              if (input.photoDataUrl) {
                addPhoto({ regionId: selectedRegion.id, travelRecordId: record.id, imageUrl: input.photoDataUrl });
              }
            }}
            onDeleteRecord={deleteRecord}
            onDeletePhoto={deletePhoto}
          />
        )}
      </div>

      <footer className="mt-auto flex flex-col items-center gap-2 border-t border-slate-200 pt-3">
        <TravelStats regions={regions} statuses={statuses} photos={photos} records={records} />
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={handleFillMap}
            className="rounded border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs text-emerald-700 sm:py-1"
          >
            지도 전체 채우기
          </button>
          <button
            type="button"
            onClick={handleResetMap}
            className="rounded border border-red-300 bg-red-50 px-3 py-1.5 text-xs text-red-600 sm:py-1"
          >
            전체 초기화
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="rounded border border-slate-300 px-3 py-1.5 text-xs sm:py-1"
          >
            데이터 내보내기
          </button>
          <button
            type="button"
            onClick={handleImportClick}
            className="rounded border border-slate-300 px-3 py-1.5 text-xs sm:py-1"
          >
            데이터 가져오기
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>
      </footer>
    </main>
  );
}
