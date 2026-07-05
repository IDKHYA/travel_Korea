"use client";

import { useCallback, useEffect, useState } from "react";
import { loadPhotos, loadRecords, savePhotos, saveRecords } from "@/lib/storage";
import type { TravelPhoto, TravelRecord } from "@/types/travel-map";

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function useTravelRecords() {
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [photos, setPhotos] = useState<TravelPhoto[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setRecords(loadRecords());
    setPhotos(loadPhotos());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveRecords(records);
  }, [records, loaded]);

  useEffect(() => {
    if (loaded) savePhotos(photos);
  }, [photos, loaded]);

  const recordsForRegion = useCallback(
    (regionId: string) =>
      records
        .filter((r) => r.regionId === regionId)
        .sort((a, b) => b.visitedDate.localeCompare(a.visitedDate)),
    [records]
  );

  const photosForRegion = useCallback(
    (regionId: string) => photos.filter((p) => p.regionId === regionId),
    [photos]
  );

  const addRecord = useCallback(
    (input: Omit<TravelRecord, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const record: TravelRecord = { ...input, id: createId("record"), createdAt: now, updatedAt: now };
      setRecords((prev) => [...prev, record]);
      return record;
    },
    []
  );

  const updateRecord = useCallback((id: string, patch: Partial<TravelRecord>) => {
    setRecords((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch, updatedAt: new Date().toISOString() } : r))
    );
  }, []);

  const deleteRecord = useCallback((id: string) => {
    setRecords((prev) => prev.filter((r) => r.id !== id));
    setPhotos((prev) => prev.filter((p) => p.travelRecordId !== id));
  }, []);

  const addPhoto = useCallback(
    (input: Omit<TravelPhoto, "id" | "createdAt">) => {
      const photo: TravelPhoto = { ...input, id: createId("photo"), createdAt: new Date().toISOString() };
      setPhotos((prev) => [...prev, photo]);
      return photo;
    },
    []
  );

  const deletePhoto = useCallback((id: string) => {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    records,
    photos,
    recordsForRegion,
    photosForRegion,
    addRecord,
    updateRecord,
    deleteRecord,
    addPhoto,
    deletePhoto,
  };
}
