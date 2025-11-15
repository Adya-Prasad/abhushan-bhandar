import { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    Image,
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes, Spacing } from "../constants/theme";

export default function ImageLightbox({ visible, images, initialIndex = 0, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  
  // Zoom state
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });

  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
      Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
    ]).start();
    lastScale.current = 1;
    lastTranslate.current = { x: 0, y: 0 };
  };

  useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      resetZoom();
    }
  }, [initialIndex, resetZoom, visible]);

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = lastScale.current * event.scale;
      const clampedScale = Math.max(1, Math.min(4, newScale));
      scale.setValue(clampedScale);
    })
    .onEnd((event) => {
      let newScale = lastScale.current * event.scale;
      newScale = Math.max(1, Math.min(4, newScale));
      lastScale.current = newScale;
      scale.setValue(newScale);
    });

  const panGesture = Gesture.Pan()
    .enabled(lastScale.current > 1)
    .onUpdate((event) => {
      if (lastScale.current > 1) {
        const maxTranslate = (lastScale.current - 1) * 150;
        const newX = lastTranslate.current.x + event.translationX;
        const newY = lastTranslate.current.y + event.translationY;
        translateX.setValue(Math.max(-maxTranslate, Math.min(maxTranslate, newX)));
        translateY.setValue(Math.max(-maxTranslate, Math.min(maxTranslate, newY)));
      }
    })
    .onEnd((event) => {
      if (lastScale.current > 1) {
        const maxTranslate = (lastScale.current - 1) * 150;
        const newX = lastTranslate.current.x + event.translationX;
        const newY = lastTranslate.current.y + event.translationY;
        lastTranslate.current = {
          x: Math.max(-maxTranslate, Math.min(maxTranslate, newX)),
          y: Math.max(-maxTranslate, Math.min(maxTranslate, newY)),
        };
        translateX.setValue(lastTranslate.current.x);
        translateY.setValue(lastTranslate.current.y);
      } else {
        lastTranslate.current = { x: 0, y: 0 };
        translateX.setValue(0);
        translateY.setValue(0);
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const handleDoubleTap = () => {
    if (lastScale.current > 1) {
      resetZoom();
    } else {
      Animated.spring(scale, { toValue: 2, useNativeDriver: true }).start();
      lastScale.current = 2;
    }
  };

  const showPrev = () => {
    setCurrentIndex((i) => (i - 1 + images.length) % images.length);
    resetZoom();
  };

  const showNext = () => {
    setCurrentIndex((i) => (i + 1) % images.length);
    resetZoom();
  };

  if (!images || images.length === 0) return null;

  const currentImage = images[currentIndex];

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </TouchableOpacity>

          <View style={styles.content}>
            <View style={styles.imageWrap}>
              <GestureDetector gesture={composedGesture}>
                <Animated.View
                  style={[
                    styles.imageContainer,
                    {
                      transform: [
                        { scale: scale },
                        { translateX: translateX },
                        { translateY: translateY },
                      ],
                    },
                  ]}
                >
                  <Pressable
                    onPress={handleDoubleTap}
                    style={styles.imagePressable}
                  >
                    <Image
                      source={{ uri: currentImage.image }}
                      style={styles.image}
                      resizeMode="contain"
                    />
                  </Pressable>
                </Animated.View>
              </GestureDetector>
            </View>

            <View style={styles.detailsRow}>
              <Pressable onPress={showPrev} style={styles.navButton}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2">
                  <Path d="M15 18l-6-6 6-6" />
                </Svg>
              </Pressable>

              <View style={styles.detailsCenter}>
                <Text style={styles.title}>{currentImage.name}</Text>
                <View style={styles.chips}>
                  {currentImage.imgId && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>ID: {currentImage.imgId}</Text>
                    </View>
                  )}
                  {currentImage.metal && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>Metal: {currentImage.metal}</Text>
                    </View>
                  )}
                  {currentImage.weight && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>Weight: {currentImage.weight}</Text>
                    </View>
                  )}
                  {currentImage.carat && (
                    <View style={styles.chip}>
                      <Text style={styles.chipText}>Carat: {currentImage.carat}</Text>
                    </View>
                  )}
                </View>
              </View>

              <Pressable onPress={showNext} style={styles.navButton}>
                <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2">
                  <Path d="M9 6l6 6-6 6" />
                </Svg>
              </Pressable>
            </View>
          </View>
        </View>
      </GestureHandlerRootView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "#0f0600e1",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 20,
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  content: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imageWrap: {
    flex: 1,
    width: "100%",
  },
  imageContainer: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePressable: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.6,
  },
  detailsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: Spacing.xs,
  },
  navButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    margin: Spacing.xs,
    borderRadius: 6,
  },
  detailsCenter: {
    flex: 1,
    alignItems: "center",
  },
  title: {
    fontSize: FontSizes.large,
    fontWeight: "600",
    color: Colors.white,
    marginBottom: Spacing.sm,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  chipText: {
    color: Colors.text,
    fontSize: FontSizes.small,
    fontWeight: "600",
  },
});
