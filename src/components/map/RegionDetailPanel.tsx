"use client";

import { useState } from "react";
import type { Region, TravelPhoto, TravelRecord, UserRegionStatus } from "@/types/travel-map";
import { TravelRecordForm } from "@/components/records/TravelRecordForm";
import { PhotoGrid } from "@/components/records/PhotoGrid";

const STATUS_LABEL: Record<UserRegionStatus["status"], string> = {
  unvisited: "미방문",
  visited_unscratched: "방문 등록됨",
  scratching: "긁는 중",
  completed: "완료",
};

export function RegionDetailPanel({
  region,
  status,
  records,
  photos,
  scratchModeActive,
  onClose,
  onRegisterVisit,
  onCancelVisit,
  onStartScratch,
  onFinishScratch,
  onAddRecord,
  onDeleteRecord,
  onDeletePhoto,
}: {
  region: Region;
  status: UserRegionStatus;
  records: TravelRecord[];
  photos: TravelPhoto[];
  scratchModeActive: boolean;
  onClose: () => void;
  onRegisterVisit: () => void;
  onCancelVisit: () => void;
  onStartScratch: () => void;
  onFinishScratch: () => void;
  onAddRecord: (input: {
    title?: string;
    visitedDate: string;
    memo?: string;
    tags: string[];
    photoDataUrl?: string;
  }) => void;
  onDeleteRecord: (id: string) => void;
  onDeletePhoto: (id: string) => void;
}) {
  const [showForm, setShowForm] = useState(false);

  const isVisited = status.status !== "unvisited";
  const isCompleted = status.status === "completed";

  return (
    <aside
      className="fixed inset-x-0 bottom-0 z-40 max-h-[80vh] overflow-y-auto rounded-t-2xl bg-white p-4 shadow-2xl md:static md:inset-auto md:max-h-none md:w-80 md:rounded-xl md:border md:border-slate-200 md:shadow-sm"
      role="dialog"
      aria-label={`${region.nameKo} 상세 정보`}
      onKeyDown={(e) => {
        if (e.key === "Escape") onClose();
      }}
    >
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-lg font-bold">{region.nameKo}</h2>
          <p className="text-sm text-slate-500">{region.province}</p>
        </div>
        <button type="button" onClick={onClose} aria-label="패널 닫기" className="text-slate-400 hover:text-slate-600">
          ✕
        </button>
      </div>

      <dl className="mt-3 space-y-1 text-sm">
        <div className="flex justify-between">
          <dt className="text-slate-500">상태</dt>
          <dd>{STATUS_LABEL[status.status]}</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">스크래치 진행률</dt>
          <dd>{status.scratchProgress}%</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">여행 기록</dt>
          <dd>{records.length}개</dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-slate-500">사진</dt>
          <dd>{photos.length}장</dd>
        </div>
      </dl>

      {scratchModeActive ? (
        <div className="mt-4 space-y-2 rounded-md bg-blue-50 p-3 text-sm">
          <p>방문한 지역을 긁어 컬러로 만들어보세요.</p>
          <p>현재 진행률: {status.scratchProgress}%</p>
          <button
            type="button"
            onClick={onFinishScratch}
            className="w-full rounded bg-blue-600 px-3 py-1.5 text-white"
          >
            스크래치 모드 종료
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {status.status === "unvisited" && (
            <button type="button" onClick={onRegisterVisit} className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
              방문 지역으로 등록
            </button>
          )}
          {status.status === "visited_unscratched" && (
            <button type="button" onClick={onStartScratch} className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
              스크래치 시작
            </button>
          )}
          {status.status === "scratching" && (
            <button type="button" onClick={onStartScratch} className="rounded bg-blue-600 px-3 py-1.5 text-sm text-white">
              스크래치 계속하기
            </button>
          )}
          {isCompleted && (
            <button
              type="button"
              onClick={() => setShowForm((v) => !v)}
              className="rounded bg-emerald-600 px-3 py-1.5 text-sm text-white"
            >
              사진/기록 추가
            </button>
          )}
          {isVisited && (
            <button type="button" onClick={onCancelVisit} className="rounded border border-slate-300 px-3 py-1.5 text-sm text-slate-600">
              방문 취소
            </button>
          )}
        </div>
      )}

      {showForm && (
        <div className="mt-3">
          <TravelRecordForm
            onCancel={() => setShowForm(false)}
            onSubmit={(input) => {
              onAddRecord(input);
              setShowForm(false);
            }}
          />
        </div>
      )}

      {records.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-700">최근 기록</h3>
          <ul className="mt-2 space-y-2">
            {records.map((record) => (
              <li key={record.id} className="rounded-md border border-slate-200 p-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="font-medium">{record.visitedDate}</span>
                  <button type="button" onClick={() => onDeleteRecord(record.id)} className="text-xs text-red-500">
                    삭제
                  </button>
                </div>
                {record.title && <p>{record.title}</p>}
                {record.memo && <p className="text-slate-500">{record.memo}</p>}
                {record.tags.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {record.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        #{tag}
                      </span>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {photos.length > 0 && (
        <div className="mt-4">
          <h3 className="text-sm font-semibold text-slate-700">사진</h3>
          <div className="mt-2">
            <PhotoGrid photos={photos} onDelete={onDeletePhoto} />
          </div>
        </div>
      )}
    </aside>
  );
}
