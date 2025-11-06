import { useFocusEffect } from "@react-navigation/native";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useState } from "react";
import {
    Alert,
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
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes, Spacing } from "../../constants/theme";
import {
    deleteJewelleryItem,
    getJewelleryByCategory,
    updateJewelleryItem,
} from "../../utils/database";

const { width } = Dimensions.get("window");
const isMobile = width < 768;

export default function CategoryScreen() {
  const { name } = useLocalSearchParams();
  const categoryName = name.charAt(0).toUpperCase() + name.slice(1);
  const [jewelleryItems, setJewelleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editName, setEditName] = useState("");
  const [editMetal, setEditMetal] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editCarat, setEditCarat] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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
          style={styles.backButton}
        >
          <Svg
            width={24}
            height={24}
            viewBox="0 0 24 24"
            fill="none"
            stroke={Colors.primary}
            strokeWidth="2"
          >
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{categoryName}</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.wishlistButton}
            onPress={() =>
              Alert.alert("Wishlist", "Wishlist feature coming soon!")
            }
          >
            <Text style={styles.wishlistText}>Wishlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, editMode && styles.actionButtonActive]}
            onPress={() => setEditMode(!editMode)}
          >
            {editMode ? (
              <Svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke={Colors.primary}
                strokeWidth="3"
              >
                <Path d="M20 6L9 17l-5-5" />
              </Svg>
            ) : (
              <Svg
                width={22}
                height={22}
                viewBox="0 0 24 24"
                fill="none"
                stroke={Colors.primary}
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
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <Text style={styles.emptyText}>Loading...</Text>
        ) : jewelleryItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No items yet</Text>
            <Text style={styles.emptySubtext}>
              Upload {categoryName.toLowerCase()} to showcase them here
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {jewelleryItems.map((item) => (
              <View key={item.id} style={styles.gridItem}>
                <View style={styles.card}>
                  <Image
                    source={{ uri: item.image }}
                    style={styles.cardImage}
                  />
                  <View style={styles.cardContent}>
                    <Text style={styles.cardTitle}>{item.name}</Text>
                    {item.imgId && (
                      <Text style={styles.cardImgId}>ID: {item.imgId}</Text>
                    )}
                    {item.metal && (
                      <Text style={styles.cardDetail}>Metal: {item.metal}</Text>
                    )}
                    {item.weight && (
                      <Text style={styles.cardDetail}>
                        Weight: {item.weight}
                      </Text>
                    )}
                    {item.carat && (
                      <Text style={styles.cardDetail}>Carat: {item.carat}</Text>
                    )}
                    <Pressable
                      style={styles.likeButton}
                      onPress={() =>
                        Alert.alert("Like", "Like feature coming soon!")
                      }
                    >
                      <Svg
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={Colors.primary}
                        strokeWidth="2"
                      >
                        <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </Svg>
                    </Pressable>
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
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={editModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeEditModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Jewellery</Text>
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
  backButton: {
    padding: 5,
    backgroundColor: "#f5dfcbff",
    borderRadius: 3,
  },
  headerTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.text,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
    alignItems: "center",
  },
  wishlistButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f5dfcbff",
    borderRadius: 6,
  },
  wishlistText: {
    fontSize: FontSizes.medium,
    fontWeight: "600",
    color: Colors.primary,
  },
  actionButton: {
    padding: 8,
    backgroundColor: "#f5dfcbff",
    borderRadius: 6,
  },
  actionButtonActive: {
    backgroundColor: Colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 100,
  },
  emptyText: {
    fontSize: FontSizes.large,
    color: Colors.text,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtext: {
    fontSize: FontSizes.medium,
    color: Colors.border,
    textAlign: "center",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 15,
  },
  gridItem: {
    flexBasis: isMobile ? "47%" : "31%",
    minWidth: isMobile ? 140 : 160,
    flexGrow: 1,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    overflow: "hidden",
    elevation: 3,
  },
  cardImage: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  cardContent: {
    padding: Spacing.md,
  },
  cardTitle: {
    fontSize: FontSizes.large,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.xs,
    alignItems: "center",
  },
  cardImgId: {
    fontSize: FontSizes.small,
    color: Colors.primary,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardDetail: {
    fontSize: FontSizes.small,
    color: Colors.border,
    marginTop: 4,
    fontWeight: 600,
  },
  likeButton: {
    position: "absolute",
    top: 10,
    right: 10,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  editButton: {
    position: "absolute",
    top: 10,
    right: 50,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  modalContent: {
    backgroundColor: Colors.white,
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
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  modalTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
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
    fontSize: FontSizes.medium,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  required: {
    color: "#e74c3c",
  },
  modalInput: {
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.medium,
    color: Colors.text,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.secondary,
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
    backgroundColor: "#e74c3c",
    paddingVertical: Spacing.md,
    borderRadius: 8,
    elevation: 2,
  },
  deleteModalButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
  updateButton: {
    flex: 1,
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
    elevation: 2,
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
    color: Colors.text,
    textAlign: "center",
    fontWeight: "600",
  },
  deleteConfirmButtons: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.border,
    paddingVertical: Spacing.md,
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
    backgroundColor: "#e74c3c",
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmDeleteButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
});
