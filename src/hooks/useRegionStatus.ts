"use client";

import { useCallback, useEffect, useState } from "react";
import { loadRegionStatuses, saveRegionStatuses } from "@/lib/storage";
import type { RegionVisitStatus, UserRegionStatus } from "@/types/travel-map";

export function useRegionStatus(regionIds: string[]) {
  const [statuses, setStatuses] = useState<Record<string, UserRegionStatus>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setStatuses(loadRegionStatuses());
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveRegionStatuses(statuses);
  }, [statuses, loaded]);

  const getStatus = useCallback(
    (regionId: string): UserRegionStatus => {
      return (
        statuses[regionId] ?? {
          regionId,
          status: "unvisited",
          scratchProgress: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      );
    },
    [statuses]
  );

  const setStatus = useCallback(
    (regionId: string, status: RegionVisitStatus, scratchProgress?: number) => {
      setStatuses((prev) => {
        const existing = prev[regionId];
        const now = new Date().toISOString();
        const next: UserRegionStatus = {
          regionId,
          status,
          scratchProgress: scratchProgress ?? existing?.scratchProgress ?? 0,
          completedAt: status === "completed" ? existing?.completedAt ?? now : existing?.completedAt,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
        return { ...prev, [regionId]: next };
      });
    },
    []
  );

  const registerVisit = useCallback(
    (regionId: string) => setStatus(regionId, "visited_unscratched", 0),
    [setStatus]
  );

  const cancelVisit = useCallback(
    (regionId: string) => setStatus(regionId, "unvisited", 0),
    [setStatus]
  );

  const updateScratchProgress = useCallback(
    (regionId: string, progress: number) => {
      // 80% 이상 긁으면 다 긁은 것으로 간주하고 나머지를 자동으로 채운다.
      const isDone = progress >= 80;
      setStatus(regionId, isDone ? "completed" : "scratching", isDone ? 100 : progress);
    },
    [setStatus]
  );

  const fillAllRegions = useCallback(() => {
    const now = new Date().toISOString();
    setStatuses((prev) => {
      const next: Record<string, UserRegionStatus> = { ...prev };
      for (const regionId of regionIds) {
        const existing = prev[regionId];
        next[regionId] = {
          regionId,
          status: "completed",
          scratchProgress: 100,
          completedAt: existing?.completedAt ?? now,
          createdAt: existing?.createdAt ?? now,
          updatedAt: now,
        };
      }
      return next;
    });
  }, [regionIds]);

  const resetAllRegions = useCallback(() => {
    setStatuses({});
  }, []);

  return {
    statuses,
    loaded,
    getStatus,
    registerVisit,
    cancelVisit,
    updateScratchProgress,
    fillAllRegions,
    resetAllRegions,
  };
}
