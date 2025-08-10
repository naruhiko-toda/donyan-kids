import { Canvas, Image as SkiaImage, Path as SkiaPath, useImage } from "@shopify/react-native-skia";
import type React from "react";
import { useCallback, useMemo, useRef, useState } from "react";
import { StyleSheet } from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import type { Point, Stroke } from "../model/types";
import { buildPathFromPoints } from "../utils/path";

export type SketchCanvasProps = {
  width: number;
  height: number;
  backgroundImageUri?: string | number; // remote URL string or require(asset)
  color: string;
  strokeWidth: number;
  onCommitStroke?: (stroke: Stroke) => void;
};

export const SketchCanvas: React.FC<SketchCanvasProps> = ({
  width,
  height,
  backgroundImageUri,
  color,
  strokeWidth,
  onCommitStroke,
}) => {
  const editingPointsRef = useRef<Point[]>([]);
  const [committedStrokes, setCommittedStrokes] = useState<Stroke[]>([]);
  const [, setRenderVersion] = useState(0);

  const bgImage = useImage(backgroundImageUri ?? null);

  const handleCommit = useCallback(
    (points: Point[]) => {
      if (points.length < 2) return; // filter noise
      const stroke: Stroke = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        color,
        width: strokeWidth,
        points: points.slice(),
      };
      setCommittedStrokes((prev) => [...prev, stroke]);
      onCommitStroke?.(stroke);
    },
    [color, onCommitStroke, strokeWidth],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .onBegin((e) => {
          editingPointsRef.current = [{ x: e.x, y: e.y, t: Date.now() }];
          // trigger re-render immediately so a tap/start shows the first point
          runOnJS(setRenderVersion)((v) => v + 1);
        })
        .onUpdate((e) => {
          editingPointsRef.current.push({ x: e.x, y: e.y, t: Date.now() });
          // trigger re-render for live stroke
          runOnJS(setRenderVersion)((v) => v + 1);
        })
        .onEnd(() => {
          const finished = editingPointsRef.current;
          editingPointsRef.current = [];
          runOnJS(handleCommit)(finished);
        })
        .onFinalize(() => {
          editingPointsRef.current = [];
        }),
    [handleCommit],
  );

  const currentPath = buildPathFromPoints(editingPointsRef.current);

  return (
    <GestureDetector gesture={pan}>
      <Canvas style={[styles.canvas, { width, height }]}>
        {bgImage && (
          <SkiaImage image={bgImage} x={0} y={0} width={width} height={height} fit="cover" />
        )}

        {/* committed strokes */}
        {committedStrokes.map((s) => (
          <SkiaPath
            key={s.id}
            path={buildPathFromPoints(s.points)}
            color={s.color}
            strokeWidth={s.width}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
          />
        ))}

        {/* editing stroke */}
        {editingPointsRef.current.length > 0 && (
          <SkiaPath
            path={currentPath}
            color={color}
            strokeWidth={strokeWidth}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
          />
        )}
      </Canvas>
    </GestureDetector>
  );
};

const styles = StyleSheet.create({
  canvas: {
    flex: 1,
  },
});

export default SketchCanvas;
