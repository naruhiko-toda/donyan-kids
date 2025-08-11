import { useCallback, useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import images from "./src/masterdata/images.json";
import { resolveImagePath } from "./src/masterdata/resolveImage";
import SketchCanvas from "./src/modules/draw/canvas/SketchCanvas";

type MasterImage = { id: string; order: number; path: string };
const masterImages: MasterImage[] = (images as MasterImage[])
  .slice()
  .sort((a, b) => a.order - b.order);

export default function App() {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [color, _setColor] = useState("#111827");
  const [strokeWidth, _setStrokeWidth] = useState(8);
  const [clearVersion, setClearVersion] = useState(0);

  const currentImage = useMemo(() => resolveImagePath(masterImages[index]?.path ?? ""), [index]);

  const nextImage = useCallback(() => {
    setIndex((prev) => (prev + 1) % masterImages.length);
    // 画像切り替え時は描画をリセット
    setClearVersion((v) => v + 1);
  }, []);

  const resetCanvas = useCallback(() => {
    setClearVersion((v) => v + 1);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <View style={styles.container}>
          <View style={styles.toolbar}>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={nextImage}>
              <Text style={styles.btnText}>次の画像</Text>
            </Pressable>
            <Pressable style={[styles.btn, styles.btnDanger]} onPress={resetCanvas}>
              <Text style={styles.btnText}>リセット</Text>
            </Pressable>
          </View>

          <View style={styles.canvasContainer}>
            <SketchCanvas
              width={width}
              height={height - 80}
              backgroundImageUri={currentImage}
              color={color}
              strokeWidth={strokeWidth}
              clearSignal={clearVersion}
            />
          </View>
        </View>
      </SafeAreaView>
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
  toolbar: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    gap: 12,
  },
  btn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  btnPrimary: {
    backgroundColor: "#2563eb",
  },
  btnDanger: {
    backgroundColor: "#ef4444",
  },
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  canvasContainer: {
    flex: 1,
  },
});
