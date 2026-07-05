export type MappingConfidence = "high" | "medium" | "low";

export type Region = {
  id: string;
  nameKo: string;
  slug: string;
  province: string;
  mappingConfidence: MappingConfidence;
  mappingNote?: string;
  bbox: { x: number; y: number; width: number; height: number };
  centroid: { x: number; y: number };
  d: string;
};

export type RegionsFile = {
  schemaVersion: string;
  coordinateSystem: {
    width: number;
    height: number;
    scale4x: { width: number; height: number };
  };
  regionCount: number;
  regions: Region[];
};

export type RegionVisitStatus =
  | "unvisited"
  | "visited_unscratched"
  | "scratching"
  | "completed";

export type UserRegionStatus = {
  regionId: string;
  status: RegionVisitStatus;
  scratchProgress: number;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
};

export type TravelRecord = {
  id: string;
  regionId: string;
  title?: string;
  visitedDate: string;
  memo?: string;
  tags: string[];
  coverPhotoId?: string;
  createdAt: string;
  updatedAt: string;
};

export type TravelPhoto = {
  id: string;
  regionId: string;
  travelRecordId?: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
};

export type Point = { x: number; y: number };
