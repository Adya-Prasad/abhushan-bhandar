import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Gesture, GestureDetector, GestureHandlerRootView } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes, Spacing } from "../../constants/theme";
import {
  deleteJewelleryItem,
  getJewelleryByCategory,
  updateJewelleryItem,
} from "../../utils/database";

// Module-level breakpoints for StyleSheet (initial load)
const { width: initialWidth } = Dimensions.get("window");
const isMobileInitial = initialWidth < 768;

export default function CategoryScreen() {
  const { name } = useLocalSearchParams();
  const categoryName = name.charAt(0).toUpperCase() + name.slice(1);
  const [jewelleryItems, setJewelleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { width } = dimensions;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Calculate items per row: 2 on mobile, 3 on tablet, 4 on desktop
  const itemsPerRow = isMobile ? 2 : isTablet ? 3 : 4;
  const horizontalPadding = isMobile ? Spacing.sm * 2 : Spacing.lg * 2;
  const itemMargin = 6; // margin on each side = 12 total per item
  const totalMarginSpace = itemMargin * 2 * itemsPerRow;
  const gridItemWidth = (width - horizontalPadding - totalMarginSpace) / itemsPerRow;
  const [editMode, setEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMetal, setEditMetal] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editCarat, setEditCarat] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  // Lightbox state
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Zoom state
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const lastScale = useRef(1);
  const lastTranslate = useRef({ x: 0, y: 0 });

  const loadJewellery = useCallback(async () => {
    try {
      setLoading(true);
      const items = await getJewelleryByCategory(categoryName);
      setJewelleryItems(items);
    } catch (error) {
      console.error("Error loading jewellery:", error);
    } finally {
      setLoading(false);
    }
  }, [categoryName]);

  useFocusEffect(
    useCallback(() => {
      loadJewellery();
    }, [loadJewellery])
  );

  const openEditModal = (item) => {
    setSelectedItem(item);
    setEditName(item.name);
    setEditMetal(item.metal || "");
    setEditWeight(item.weight || "");
    setEditCarat(item.carat || "");
    setEditModalVisible(true);
  };

  const resetZoom = () => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.spring(translateX, {
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }),
    ]).start();
    lastScale.current = 1;
    lastTranslate.current = { x: 0, y: 0 };
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxVisible(true);
    // Reset zoom when opening
    resetZoom();
  };

  const closeLightbox = () => {
    setLightboxVisible(false);
    resetZoom();
  };

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = lastScale.current * event.scale;
      const clampedScale = Math.max(1, Math.min(4, newScale));
      scale.setValue(clampedScale);
    })
    .onEnd((event) => {
      let newScale = lastScale.current * event.scale;
      if (newScale < 1) {
        newScale = 1;
      } else if (newScale > 4) {
        newScale = 4;
      }
      lastScale.current = newScale;
      scale.setValue(newScale);
    });

  // Pan gesture for moving image when zoomed
  const panGesture = Gesture.Pan()
    .enabled(lastScale.current > 1)
    .onUpdate((event) => {
      if (lastScale.current > 1) {
        const newX = lastTranslate.current.x + event.translationX;
        const newY = lastTranslate.current.y + event.translationY;
        
        const maxTranslate = (lastScale.current - 1) * 150;
        const clampedX = Math.max(-maxTranslate, Math.min(maxTranslate, newX));
        const clampedY = Math.max(-maxTranslate, Math.min(maxTranslate, newY));
        
        translateX.setValue(clampedX);
        translateY.setValue(clampedY);
      }
    })
    .onEnd((event) => {
      if (lastScale.current > 1) {
        const newX = lastTranslate.current.x + event.translationX;
        const newY = lastTranslate.current.y + event.translationY;
        
        const maxTranslate = (lastScale.current - 1) * 150;
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

  // Combine gestures
  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const handleDoubleTap = () => {
    if (lastScale.current > 1) {
      resetZoom();
    } else {
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 2,
          useNativeDriver: true,
        }),
      ]).start();
      lastScale.current = 2;
    }
  };

  const showPrev = () => {
    setLightboxIndex((i) => (i - 1 + jewelleryItems.length) % jewelleryItems.length);
    resetZoom();
  };

  const showNext = () => {
    setLightboxIndex((i) => (i + 1) % jewelleryItems.length);
    resetZoom();
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedItem(null);
    setEditName("");
    setEditMetal("");
    setEditWeight("");
    setEditCarat("");
    setShowDeleteConfirm(false);
  };

  const handleUpdate = async () => {
    if (!editName.trim()) {
      Alert.alert("Error", "Please enter jewellery name");
      return;
    }

    try {
      await updateJewelleryItem(selectedItem.id, {
        name: editName,
        metal: editMetal || null,
        weight: editWeight || null,
        carat: editCarat || null,
      });
      Alert.alert("Success", "Jewellery updated successfully!");
      closeEditModal();
      loadJewellery();
    } catch (_error) {
      Alert.alert("Error", "Failed to update jewellery");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;

    try {
      await deleteJewelleryItem(selectedItem.id);
      closeEditModal();
      loadJewellery();
    } catch (_error) {
      Alert.alert("Error", "Failed to delete item");
    }
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.push("/")}
          style={styles.actionButton}
        >
          <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke={Colors.white}
            strokeWidth="2"
          >
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.actionButton, editMode && styles.actionButtonActive]}
            onPress={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <Svg
                width={25}
                height={25}
                viewBox="0 0 24 24"
                fill="none"
                stroke={Colors.white}
                strokeWidth="3"
              >
                <Path d="M20 6L9 17l-5-5" />
              </Svg>
            ) : (
              <Svg
                width={25}
                height={25}
                viewBox="0 0 24 24"
                fill="none"
                stroke={Colors.white}
                strokeWidth="2"
              >
                <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </Svg>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isMobile ? Spacing.sm : Spacing.lg }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : jewelleryItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No jewellery image yet, Upload in {categoryName.toLowerCase()} to showcase them here</Text>
          </View>
        ) : (
          <>
          <View style={styles.gridContainer}>
            {jewelleryItems.map((item, idx) => (
              <View 
                key={item.id} 
                style={[
                  styles.gridItem,
                  { width: Math.max(gridItemWidth, 120) }
                ]}
              >
                <View style={styles.card}>
                  <Pressable onPress={() => openLightbox(idx)}>
                    <Image
                      source={{ uri: item.image }}
                      style={styles.cardImage}
                    />
                  </Pressable>
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    {item.imgId && (
                      <Text style={styles.cardImgId}>ID: {item.imgId}</Text>
                    )}
                    {editMode && (
                      <Pressable
                        style={styles.editButton}
                        onPress={() => openEditModal(item)}
                      >
                        <Svg
                          width={18}
                          height={18}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={Colors.primary}
                          strokeWidth="2"
                        >
                          <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </Svg>
                      </Pressable>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </View>

          {/* Lightbox Modal */}
          <Modal
            visible={lightboxVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={closeLightbox}
          >
            <GestureHandlerRootView style={{ flex: 1 }}>
              <View style={styles.lightboxOverlay}>
                <TouchableOpacity
                  style={styles.lightboxClose}
                  onPress={() => setLightboxVisible(false)}
                >
                  <Svg
                    width={24}
                    height={24}
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#fff"
                    strokeWidth="2"
                  >
                    <Path d="M18 6L6 18M6 6l12 12" />
                  </Svg>
                </TouchableOpacity>
                <View style={styles.lightboxContent}>
                  <View style={styles.lightboxImageWrap}>
                    <GestureDetector gesture={composedGesture}>
                      <Animated.View
                        style={[
                          styles.lightboxScrollView,
                          {
                            transform: [
                              { scale: scale },
                              { translateX: translateX },
                              { translateY: translateY },
                            ],
                          },
                        ]}
                      >
                        {jewelleryItems[lightboxIndex] ? (
                          <Pressable 
                            onPress={handleDoubleTap} 
                            delayLongPress={200}
                            style={{ width: "100%", height: "100%", alignItems: "center", justifyContent: "center" }}
                          >
                            <Image
                              key={`lightbox-img-${lightboxIndex}-${jewelleryItems[lightboxIndex].imgId || ""
                                }`}
                              source={{ uri: jewelleryItems[lightboxIndex].image }}
                              style={styles.lightboxImage}
                              resizeMode="contain"
                            />
                          </Pressable>
                        ) : (
                          <Text style={{ color: Colors.white }}>
                            No image to display
                          </Text>
                        )}
                      </Animated.View>
                    </GestureDetector>
                  </View>
                <View style={styles.lightboxDetailsRow}>
                  <Pressable onPress={showPrev} style={styles.detailsNavButton}>
                    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2">
                      <Path d="M15 18l-6-6 6-6" />
                    </Svg>
                  </Pressable>

                  <View style={styles.lightboxDetailsCenter}>
                    {jewelleryItems[lightboxIndex] && (
                      <>
                        <Text style={styles.lightboxTitle}>{jewelleryItems[lightboxIndex].name}</Text>
                        <View style={styles.lightboxDetailChips}>
                          {jewelleryItems[lightboxIndex].metal ? (
                            <View style={styles.detailChip}><Text style={styles.detailChipText}>Metal: {jewelleryItems[lightboxIndex].metal}</Text></View>
                          ) : null}
                          {jewelleryItems[lightboxIndex].weight ? (
                            <View style={styles.detailChip}><Text style={styles.detailChipText}>Weight: {jewelleryItems[lightboxIndex].weight}</Text></View>
                          ) : null}
                          {jewelleryItems[lightboxIndex].carat ? (
                            <View style={styles.detailChip}><Text style={styles.detailChipText}>Carat: {jewelleryItems[lightboxIndex].carat}</Text></View>
                          ) : null}
                          {jewelleryItems[lightboxIndex].imgId ? (
                            <View style={styles.detailChip}><Text style={styles.detailChipText}>ID: {jewelleryItems[lightboxIndex].imgId}</Text></View>
                          ) : null}
                        </View>
                      </>
                    )}
                  </View>

                  <Pressable onPress={showNext} style={styles.detailsNavButton}>
                    <Svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke={Colors.white} strokeWidth="2">
                      <Path d="M9 6l6 6-6 6" />
                    </Svg>
                  </Pressable>
                </View>
              </View>
            </View>
            </GestureHandlerRootView>
          </Modal>
          </>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.editPopupOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text>Edit Jewellery</Text>
              <Pressable onPress={closeEditModal} style={styles.closeButton}>
                <Svg
                  width={24}
                  height={24}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={Colors.text}
                  strokeWidth="2"
                >
                  <Path d="M18 6L6 18M6 6l12 12" />
                </Svg>
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {selectedItem && (
                <>
                  <Image
                    source={{ uri: selectedItem.image }}
                    style={styles.modalImage}
                  />

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalLabel}>
                      Jewellery Name <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editName}
                      onChangeText={setEditName}
                      placeholder="Enter jewellery name"
                      placeholderTextColor={Colors.border}
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalLabel}>Metal (Optional)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editMetal}
                      onChangeText={setEditMetal}
                      placeholder="e.g., Gold, Silver, Platinum"
                      placeholderTextColor={Colors.border}
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalLabel}>Weight (Optional)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editWeight}
                      onChangeText={setEditWeight}
                      placeholder="e.g., 10g"
                      placeholderTextColor={Colors.border}
                    />
                  </View>

                  <View style={styles.modalInputGroup}>
                    <Text style={styles.modalLabel}>Carat (Optional)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editCarat}
                      onChangeText={setEditCarat}
                      placeholder="e.g., 22K, 18K"
                      placeholderTextColor={Colors.border}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View style={styles.modalFooter}>
              {!showDeleteConfirm ? (
                <>
                  <TouchableOpacity
                    style={styles.deleteModalButton}
                    onPress={handleDeleteClick}
                  >
                    <Svg
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#fff"
                      strokeWidth="2"
                    >
                      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </Svg>
                    <Text style={styles.deleteModalButtonText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.updateButton}
                    onPress={handleUpdate}
                  >
                    <Text style={styles.updateButtonText}>Update</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <View style={styles.deleteConfirmContainer}>
                  <Text style={styles.deleteConfirmText}>
                    Are you sure you want to delete this item?
                  </Text>
                  <View style={styles.deleteConfirmButtons}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={cancelDelete}
                    >
                      <Text style={styles.cancelButtonText}>No</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmDeleteButton}
                      onPress={confirmDelete}
                    >
                      <Text style={styles.confirmDeleteButtonText}>Yes</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
    paddingBottom: Spacing.lg,
  },
  headerTitle: {
    fontSize: isMobileInitial ? FontSizes.medium : FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  actionButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  actionButtonActive: {
    backgroundColor: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: FontSizes.medium,
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  gridItem: {
    margin: 6,
    flexShrink: 0,
    flexGrow: 0,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
  },
  cardImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  cardContent: {
    paddingLeft: 15,
    paddingTop: 7,
  },
  cardTitle: {
    fontSize: isMobileInitial ? 14 : FontSizes.large,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 2,
    alignItems: "center",
  },
  cardImgId: {
    fontSize: 12,
    color: Colors.primary,
    fontWeight: "bold",
    marginBottom: Spacing.xs,
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 50,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 6,
  },
  editPopupOverlay: {
    flex: 1,
    backgroundColor: "#0f0600e1",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  /* Lightbox styles */
  lightboxOverlay: {
    flex: 1,
    backgroundColor: "#0f0600e1",
    justifyContent: "center",
    alignItems: "center",
  },
  lightboxContent: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxClose: {
    position: "absolute",
    top: 12,
    right: 12,
    zIndex: 20,
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  lightboxImageWrap: {
    flex: 1,
    width: "100%",
    position: "relative",
  },
  lightboxScroll: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  lightboxScrollView: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  lightboxImage: {
    width: Dimensions.get("window").width,
    height: Dimensions.get("window").height * 0.5,
  },
  lightboxDetails: {
    width: isMobileInitial ? "100%" : "35%",
    padding: Spacing.sm,
    backgroundColor: Colors.red,
  },
  lightboxDetailsRow: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  detailsNavButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    margin: Spacing.xs,
    borderRadius: 6,
  },
  lightboxDetailsCenter: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: "transparent"
  },
  lightboxDetailChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
    margin: Spacing.sm,
  },
  detailChip: {
    backgroundColor: Colors.secondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    marginRight: 8,
  },
  detailChipText: {
    color: Colors.text,
    fontSize: FontSizes.small,
    fontWeight: '600',
  },
  lightboxDetailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  lightboxTitle: {
    fontSize: isMobileInitial ? FontSizes.medium : FontSizes.xlarge,
    fontWeight: '600',
    color: Colors.white,
    maxWidth: '80%'
  },
  lightboxArrowsInline: {
    flexDirection: 'row',
    gap: 8,
  },
  lightboxSmallArrow: {
    padding: 6,
  },
  lightboxText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    marginBottom: Spacing.sm,
  },
  modalContent: {
    backgroundColor: Colors.background,
    borderRadius: 12,
    width: "95%",
    maxWidth: 700,
    maxHeight: "90%",
    elevation: 5,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: Spacing.lg,
    fontWeight: "bold",
    color: Colors.text,
  },
  modalBody: {
    padding: Spacing.lg,
  },
  modalImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    marginBottom: Spacing.lg,
  },
  modalInputGroup: {
    marginBottom: Spacing.lg,
  },
  modalLabel: {
    fontSize: FontSizes.small,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.red,
  },
  modalInput: {
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.medium,
    color: Colors.text,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.border,
  },
  modalFooter: {
    flexDirection: "row",
    gap: Spacing.sm,
    padding: Spacing.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  deleteModalButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: Colors.red,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
  },
  deleteModalButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
  updateButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  updateButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
  deleteConfirmContainer: {
    flex: 1,
    gap: Spacing.md,
  },
  deleteConfirmText: {
    fontSize: FontSizes.medium,
    color: Colors.red,
    textAlign: "center",
    fontWeight: "700",
  },
  deleteConfirmButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: Colors.red,
    paddingVertical: Spacing.sm,
    borderRadius: 8,
    alignItems: "center",
    
  },
  confirmDeleteButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
});
