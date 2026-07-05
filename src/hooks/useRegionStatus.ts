"use client";

import { useCallback, useEffect, useState } from "react";
import { loadRegionStatuses, saveRegionStatuses } from "@/lib/storage";
import type { RegionVisitStatus, UserRegionStatus } from "@/types/travel-map";

export function useRegionStatus() {
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
      const status: RegionVisitStatus = progress >= 70 ? "completed" : "scratching";
      setStatus(regionId, status, progress);
    },
    [setStatus]
  );

  return { statuses, loaded, getStatus, registerVisit, cancelVisit, updateScratchProgress };
}
