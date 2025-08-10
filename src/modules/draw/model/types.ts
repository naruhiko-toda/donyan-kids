export type Point = {
  x: number;
  y: number;
  t: number;
};

export type Stroke = {
  id: string;
  color: string; // hex (e.g., "#111827")
  width: number; // px
  points: Point[]; // ordered
};
