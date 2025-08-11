import {
  Canvas,
  Skia,
  Image as SkiaImage,
  Path as SkiaPath,
  useImage,
} from "@shopify/react-native-skia";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  clearSignal?: number; // increments to clear canvas from parent
};

export const SketchCanvas: React.FC<SketchCanvasProps> = ({
  width,
  height,
  backgroundImageUri,
  color,
  strokeWidth,
  onCommitStroke,
  clearSignal,
}) => {
  const editingPointsRef = useRef<Point[]>([]);
  const livePathRef = useRef(Skia.Path.Make());
  const [, setRenderVersion] = useState(0);
  type CommittedPath = {
    id: string;
    color: string;
    width: number;
    path: ReturnType<typeof Skia.Path.Make>;
  };
  const [committedPaths, setCommittedPaths] = useState<CommittedPath[]>([]);

  const bgImage = useImage(backgroundImageUri ?? null);

  // External clear trigger from parent
  useEffect(() => {
    // run only when clearSignal changes
    if (clearSignal === undefined) return;
    editingPointsRef.current = [];
    livePathRef.current.reset();
    setCommittedPaths([]);
    setRenderVersion((v) => v + 1);
  }, [clearSignal]);

  const handleCommit = useCallback(
    (points: Point[]) => {
      if (points.length < 2) return; // filter noise
      const stroke: Stroke = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
        color,
        width: strokeWidth,
        points: points.slice(),
      };
      const strokePath = buildPathFromPoints(points);
      setCommittedPaths((prev) => [
        ...prev,
        { id: stroke.id, color: stroke.color, width: stroke.width, path: strokePath },
      ]);
      onCommitStroke?.(stroke);
    },
    [color, onCommitStroke, strokeWidth],
  );

  const pan = useMemo(
    () =>
      Gesture.Pan()
        .maxPointers(1)
        .onBegin((e) => {
          // reset live path and start from current point
          livePathRef.current.reset();
          livePathRef.current.moveTo(e.x, e.y);
          editingPointsRef.current = [{ x: e.x, y: e.y, t: Date.now() }];
          runOnJS(setRenderVersion)((v) => v + 1); // show first dot immediately
        })
        .onUpdate((e) => {
          // append to live path incrementally to avoid rebuilding path each frame
          livePathRef.current.lineTo(e.x, e.y);
          editingPointsRef.current.push({ x: e.x, y: e.y, t: Date.now() });
          runOnJS(setRenderVersion)((v) => v + 1);
        })
        .onEnd(() => {
          const finished = editingPointsRef.current;
          editingPointsRef.current = [];
          runOnJS(handleCommit)(finished);
          // clear live path after committing
          livePathRef.current.reset();
          runOnJS(setRenderVersion)((v) => v + 1);
        })
        .onFinalize(() => {
          editingPointsRef.current = [];
          livePathRef.current.reset();
        }),
    [handleCommit],
  );

  return (
    <GestureDetector gesture={pan}>
      <Canvas style={[styles.canvas, { width, height }]}>
        {bgImage && (
          <SkiaImage image={bgImage} x={0} y={0} width={width} height={height} fit="contain" />
        )}

        {/* committed strokes (pre-built paths) */}
        {committedPaths.map((s) => (
          <SkiaPath
            key={s.id}
            path={s.path}
            color={s.color}
            strokeWidth={s.width}
            style="stroke"
            strokeCap="round"
            strokeJoin="round"
          />
        ))}

        {/* editing stroke (mutated SkPath) */}
        <SkiaPath
          path={livePathRef.current}
          color={color}
          strokeWidth={strokeWidth}
          style="stroke"
          strokeCap="round"
          strokeJoin="round"
        />
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
