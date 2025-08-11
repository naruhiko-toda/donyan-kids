import { useCallback, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import images from "./src/masterdata/images.json";
import { resolveImageById } from "./src/masterdata/resolveImage";
import SketchCanvas from "./src/modules/draw/canvas/SketchCanvas";

type MasterImage = { id: string; order: number };
const masterImages: MasterImage[] = (images as MasterImage[])
  .slice()
  .sort((a, b) => a.order - b.order);

export default function App() {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [color, _setColor] = useState("#111827");
  const [strokeWidth, _setStrokeWidth] = useState(8);
  const [clearVersion, setClearVersion] = useState(0);

  const currentImage = useMemo(() => resolveImageById(masterImages[index]?.id ?? ""), [index]);

  const nextImage = useCallback(() => {
    setIndex((prev) => (prev + 1) % masterImages.length);
    // 画像切り替え時は描画をリセット
    setClearVersion((v) => v + 1);
  }, []);

  const prevImage = useCallback(() => {
    setIndex((prev) => (prev - 1 + masterImages.length) % masterImages.length);
    setClearVersion((v) => v + 1);
  }, []);

  const resetCanvas = useCallback(() => {
    setClearVersion((v) => v + 1);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <View style={styles.container}>
        <View style={styles.canvasContainer}>
          <SketchCanvas
            width={width}
            height={height - styles.bottomBar.height}
            backgroundImageUri={currentImage}
            color={color}
            strokeWidth={strokeWidth}
            clearSignal={clearVersion}
          />
        </View>

        <View style={styles.bottomBar}>
          <Pressable style={[styles.btn, styles.btnPrev, styles.popShadow]} onPress={prevImage}>
            <Text style={styles.btnText}>まえへ</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnClear, styles.popShadow]} onPress={resetCanvas}>
            <Text style={styles.btnText}>くりあ</Text>
          </Pressable>
          <Pressable style={[styles.btn, styles.btnNext, styles.popShadow]} onPress={nextImage}>
            <Text style={styles.btnText}>つぎへ</Text>
          </Pressable>
        </View>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
  },
  canvasContainer: {
    flex: 1,
  },
  bottomBar: {
    height: 96,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#f1f5f9",
  },
  btn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  btnPrev: {
    backgroundColor: "#a78bfa", // violet-400
  },
  btnClear: {
    backgroundColor: "#f97316", // orange-500
  },
  btnNext: {
    backgroundColor: "#34d399", // emerald-400
  },
  popShadow: {
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  btnText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 1,
  },
});
