import { Skia } from "@shopify/react-native-skia";
import type { Point } from "../model/types";

// Simple polyline to Path (no smoothing). Can be improved to Catmull-Rom later.
type SkiaPathInstance = ReturnType<typeof Skia.Path.Make>;
export const buildPathFromPoints = (points: Point[]): SkiaPathInstance => {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;

  const [first, ...rest] = points;
  path.moveTo(first.x, first.y);
  for (const p of rest) {
    path.lineTo(p.x, p.y);
  }
  return path;
};
