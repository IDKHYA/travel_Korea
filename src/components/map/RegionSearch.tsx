"use client";

import { useMemo, useState } from "react";
import type { Region } from "@/types/travel-map";

export function RegionSearch({
  regions,
  onSelect,
}: {
  regions: Region[];
  onSelect: (regionId: string) => void;
}) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return regions
      .filter(
        (r) =>
          r.nameKo.toLowerCase().includes(q) ||
          r.province.toLowerCase().includes(q) ||
          r.slug.toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [regions, query]);

  return (
    <div className="relative mx-auto w-full max-w-md">
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="지역 검색: 강릉, 부산, 제주..."
        aria-label="지역 검색"
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
      />
      {results.length > 0 && (
        <ul className="absolute z-50 mt-1 w-full rounded-md border border-slate-200 bg-white shadow-lg">
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                className="block w-full px-3 py-2 text-left text-sm hover:bg-slate-50"
                onClick={() => {
                  onSelect(r.id);
                  setQuery("");
                }}
              >
                <span className="font-medium">{r.nameKo}</span>{" "}
                <span className="text-slate-400">{r.province}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
