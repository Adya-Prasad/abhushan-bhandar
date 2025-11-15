import React, { useCallback, useState } from "react";
import {
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes, Spacing } from "../constants/theme";
import { getJewelleryByCategory } from "../utils/database";

export default function ImageSelector({ visible, categoryName, selectedImages, onSelect, onClose }) {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadImages = useCallback(async () => {
    if (!categoryName || !visible) return;
    
    try {
      setLoading(true);
      const items = await getJewelleryByCategory(categoryName);
      setImages(items);
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryName, visible]);

  React.useEffect(() => {
    if (visible) {
      loadImages();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const isSelected = (imageId) => {
    return selectedImages.some((img) => img.id === imageId);
  };

  const handleImagePress = (image) => {
    onSelect(image);
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Select Images from {categoryName}</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2">
              <Path d="M18 6L6 18M6 6l12 12" />
            </Svg>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          {loading ? (
            <Text style={styles.loadingText}>Loading images...</Text>
          ) : images.length === 0 ? (
            <Text style={styles.emptyText}>No images in this category</Text>
          ) : (
            <View style={styles.grid}>
              {images.map((image) => (
                <Pressable
                  key={image.id}
                  style={[
                    styles.imageCard,
                    isSelected(image.id) && styles.imageCardSelected,
                  ]}
                  onPress={() => handleImagePress(image)}
                >
                  <Image source={{ uri: image.image }} style={styles.image} />
                  {isSelected(image.id) && (
                    <View style={styles.selectedBadge}>
                      <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                        <Path d="M20 6L9 17l-5-5" />
                      </Svg>
                    </View>
                  )}
                  <View style={styles.imageInfo}>
                    <Text style={styles.imageName}>{image.name}</Text>
                    {image.imgId && (
                      <Text style={styles.imageId}>ID: {image.imgId}</Text>
                    )}
                  </View>
                </Pressable>
              ))}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            {selectedImages.length} image(s) selected
          </Text>
          <TouchableOpacity style={styles.doneButton} onPress={onClose}>
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingTop: 50,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.primary,
  },
  headerTitle: {
    fontSize: FontSizes.large,
    fontWeight: "bold",
    color: Colors.white,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  loadingText: {
    textAlign: "center",
    fontSize: FontSizes.medium,
    color: Colors.text,
    marginTop: 50,
  },
  emptyText: {
    textAlign: "center",
    fontSize: FontSizes.medium,
    color: Colors.text,
    marginTop: 50,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
  },
  imageCard: {
    width: "48%",
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 3,
    borderColor: "transparent",
  },
  imageCardSelected: {
    borderColor: Colors.primary,
  },
  image: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  selectedBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: Colors.primary,
    borderRadius: 20,
    padding: 4,
  },
  imageInfo: {
    padding: Spacing.sm,
  },
  imageName: {
    fontSize: FontSizes.small,
    fontWeight: "600",
    color: Colors.text,
  },
  imageId: {
    fontSize: FontSizes.small,
    color: Colors.primary,
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  footerText: {
    fontSize: FontSizes.medium,
    fontWeight: "600",
    color: Colors.text,
  },
  doneButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  doneButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
});
