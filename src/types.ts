export interface WarningFlag {
  text: string;
  severity: "amber" | "red";
}

export interface RecommendedAlternative {
  name: string;
  reason: string;
}

export interface FoodScanResult {
  isFoodAsset: boolean;
  foodName: string;
  healthGrade: string;
  sustainabilityScore: number;
  dietaryContext: string;
  warningFlags: WarningFlag[];
  recommendedAlternatives: RecommendedAlternative[];
  summary: string;
}

export interface ScanHistoryItem {
  id: string;
  timestamp: string;
  image: string;
  mimeType: string;
  result: FoodScanResult;
}
