"use client";

import { useRef, useState } from "react";
import regionsFile from "@/data/regions.generated.mapped.json";
import type { RegionsFile } from "@/types/travel-map";
import { TravelScratchMap } from "@/components/map/TravelScratchMap";
import { RegionDetailPanel } from "@/components/map/RegionDetailPanel";
import { RegionSearch } from "@/components/map/RegionSearch";
import { TravelStats } from "@/components/stats/TravelStats";
import { useRegionStatus } from "@/hooks/useRegionStatus";
import { useTravelRecords } from "@/hooks/useTravelRecords";
import { exportAllData, importAllData } from "@/lib/storage";

const { regions } = regionsFile as RegionsFile;

export default function MapPage() {
  const { statuses, getStatus, registerVisit, cancelVisit, updateScratchProgress } = useRegionStatus();
  const {
    records,
    photos,
    recordsForRegion,
    photosForRegion,
    addRecord,
    deleteRecord,
    addPhoto,
    deletePhoto,
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

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-4 p-4">
      <header className="flex flex-col items-center gap-1 text-center">
        <h1 className="text-xl font-bold">대한민국 여행 스크래치 맵</h1>
        <p className="text-sm text-slate-500">방문한 지역을 긁어 컬러로 만들고 여행 기록을 남겨보세요.</p>
      </header>

      <RegionSearch regions={regions} onSelect={handleSelect} />

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

        {selectedRegion && (
          <RegionDetailPanel
            region={selectedRegion}
            status={getStatus(selectedRegion.id)}
            records={recordsForRegion(selectedRegion.id)}
            photos={photosForRegion(selectedRegion.id)}
            scratchModeActive={scratchModeRegionId === selectedRegion.id}
            onClose={handleClosePanel}
            onRegisterVisit={() => registerVisit(selectedRegion.id)}
            onCancelVisit={() => {
              cancelVisit(selectedRegion.id);
              setScratchModeRegionId(null);
            }}
            onStartScratch={() => setScratchModeRegionId(selectedRegion.id)}
            onFinishScratch={() => setScratchModeRegionId(null)}
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
        <div className="flex gap-2">
          <button type="button" onClick={handleExport} className="rounded border border-slate-300 px-3 py-1 text-xs">
            데이터 내보내기
          </button>
          <button type="button" onClick={handleImportClick} className="rounded border border-slate-300 px-3 py-1 text-xs">
            데이터 가져오기
          </button>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={handleImportFile} />
        </div>
      </footer>
    </main>
  );
}
