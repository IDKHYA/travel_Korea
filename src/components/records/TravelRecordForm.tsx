"use client";

import { useState } from "react";
import type { TravelRecord } from "@/types/travel-map";

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function TravelRecordForm({
  initial,
  onCancel,
  onSubmit,
}: {
  initial?: Partial<TravelRecord>;
  onCancel: () => void;
  onSubmit: (input: {
    title?: string;
    visitedDate: string;
    memo?: string;
    tags: string[];
    photoDataUrl?: string;
  }) => void;
}) {
  const [visitedDate, setVisitedDate] = useState(initial?.visitedDate ?? "");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [memo, setMemo] = useState(initial?.memo ?? "");
  const [tagsInput, setTagsInput] = useState((initial?.tags ?? []).join(", "));
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("JPG, PNG, WebP 파일만 업로드할 수 있습니다.");
      return;
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setError("사진 용량은 10MB 이하여야 합니다.");
      return;
    }
    setError(null);
    setPhotoPreview(await readFileAsDataUrl(file));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitedDate) {
      setError("방문 날짜는 필수입니다.");
      return;
    }
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    onSubmit({
      title: title || undefined,
      visitedDate,
      memo: memo || undefined,
      tags,
      photoDataUrl: photoPreview,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-md border border-slate-200 p-3">
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="visitedDate">
          방문 날짜*
        </label>
        <input
          id="visitedDate"
          type="date"
          value={visitedDate}
          onChange={(e) => setVisitedDate(e.target.value)}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
          required
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="title">
          제목
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 강릉 1박 2일 여행"
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="memo">
          메모
        </label>
        <textarea
          id="memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="tags">
          태그 (쉼표로 구분)
        </label>
        <input
          id="tags"
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="바다, 카페, 맛집"
          className="mt-1 w-full rounded border border-slate-300 px-2 py-1 text-sm"
        />
      </div>
      <div>
        <label className="block text-xs font-medium text-slate-600" htmlFor="photo">
          사진
        </label>
        <input id="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="mt-1 text-sm" />
        {photoPreview && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photoPreview} alt="미리보기" className="mt-2 h-24 w-24 rounded object-cover" />
        )}
      </div>
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="rounded border border-slate-300 px-3 py-1 text-sm">
          취소
        </button>
        <button type="submit" className="rounded bg-blue-600 px-3 py-1 text-sm text-white">
          저장
        </button>
      </div>
    </form>
  );
}
