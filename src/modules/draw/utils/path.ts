import { Skia, Path } from '@shopify/react-native-skia';
import type { Point } from '../model/types';

// Simple polyline to Path (no smoothing). Can be improved to Catmull-Rom later.
export const buildPathFromPoints = (points: Point[]): Path => {
  const path = Skia.Path.Make();
  if (points.length === 0) return path;

  const [first, ...rest] = points;
  path.moveTo(first.x, first.y);
  for (const p of rest) {
    path.lineTo(p.x, p.y);
  }
  return path;
};


