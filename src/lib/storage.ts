import type { TravelPhoto, TravelRecord, UserRegionStatus } from "@/types/travel-map";

const KEYS = {
  statuses: "travel-map.region-statuses",
  records: "travel-map.records",
  photos: "travel-map.photos",
} as const;

function readJson<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJson<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function loadRegionStatuses(): Record<string, UserRegionStatus> {
  return readJson(KEYS.statuses, {});
}

export function saveRegionStatuses(statuses: Record<string, UserRegionStatus>): void {
  writeJson(KEYS.statuses, statuses);
}

export function loadRecords(): TravelRecord[] {
  return readJson(KEYS.records, []);
}

export function saveRecords(records: TravelRecord[]): void {
  writeJson(KEYS.records, records);
}

export function loadPhotos(): TravelPhoto[] {
  return readJson(KEYS.photos, []);
}

export function savePhotos(photos: TravelPhoto[]): void {
  writeJson(KEYS.photos, photos);
}

export function exportAllData(): string {
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      regionStatuses: loadRegionStatuses(),
      records: loadRecords(),
      photos: loadPhotos(),
    },
    null,
    2
  );
}

export function importAllData(json: string): void {
  const parsed = JSON.parse(json);
  if (parsed.regionStatuses) saveRegionStatuses(parsed.regionStatuses);
  if (parsed.records) saveRecords(parsed.records);
  if (parsed.photos) savePhotos(parsed.photos);
}
