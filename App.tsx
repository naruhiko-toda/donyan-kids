import { useCallback, useMemo, useState } from "react";
import { Pressable, SafeAreaView, StyleSheet, Text, useWindowDimensions, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import SketchCanvas from "./src/modules/draw/canvas/SketchCanvas";

const imagePool = [
  "https://picsum.photos/seed/a/1200/1800",
  "https://picsum.photos/seed/b/1200/1800",
  "https://picsum.photos/seed/c/1200/1800",
  "https://picsum.photos/seed/d/1200/1800",
  "https://picsum.photos/seed/e/1200/1800",
];

export default function App() {
  const { width, height } = useWindowDimensions();
  const [index, setIndex] = useState(() => Math.floor(Math.random() * imagePool.length));
  const [color, _setColor] = useState("#111827");
  const [strokeWidth, _setStrokeWidth] = useState(8);

  const currentImage = useMemo(() => imagePool[index], [index]);

  const nextImage = useCallback(() => {
    setIndex((prev) => (prev + 1) % imagePool.length);
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaView style={styles.root}>
        <View style={styles.container}>
          <View style={styles.toolbar}>
            <Pressable style={[styles.btn, styles.btnPrimary]} onPress={nextImage}>
              <Text style={styles.btnText}>次の画像</Text>
            </Pressable>
          </View>

          <View style={styles.canvasContainer}>
            <SketchCanvas
              width={width}
              height={height - 80}
              backgroundImageUri={currentImage}
              color={color}
              strokeWidth={strokeWidth}
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
  btnText: {
    color: "#fff",
    fontWeight: "600",
  },
  canvasContainer: {
    flex: 1,
  },
});
