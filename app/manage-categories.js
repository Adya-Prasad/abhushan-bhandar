import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes } from "../constants/theme";
import { deleteCategory, getAllCategories, getJewelleryByCategory, updateCategory } from "../utils/database";

export default function ManageCategoriesScreen() {
  const [categories, setCategories] = useState([]);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { width } = dimensions;
  const isMobile = width < 768;
  const [isLoading, setIsLoading] = useState(true);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editName, setEditName] = useState("");
  const [editIcon, setEditIcon] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [editError, setEditError] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const allCategories = await getAllCategories();
      const categoriesWithCounts = await Promise.all(
        allCategories.map(async (category) => {
          const items = await getJewelleryByCategory(category.name);
          return {
            ...category,
            itemCount: items.length
          };
        })
      );
      setCategories(categoriesWithCounts);
    } catch (_error) {
      console.error('Error loading categories:', _error);
      Alert.alert('Error', 'Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const openDeleteModal = (category) => {
    if (category.isDefault) {
      Alert.alert('Error', 'Cannot delete the Archive category');
      return;
    }
    setSelectedCategory(category);
    setDeleteModalVisible(true);
    setDeleteError("");
  };

  const closeDeleteModal = () => {
    setDeleteModalVisible(false);
    setSelectedCategory(null);
    setDeleteLoading(false);
    setDeleteError("");
  };

  const confirmDeleteCategory = async () => {
    if (!selectedCategory) return;
    setDeleteLoading(true);
    setDeleteError("");
    try {
      await deleteCategory(selectedCategory.id);
      closeDeleteModal();
      loadCategories();
    } catch (_error) {
      setDeleteError("Failed to delete category");
      setDeleteLoading(false);
    }
  };

  const openEditModal = (category) => {
    if (category.isDefault) {
      Alert.alert('Error', 'Cannot edit the Archive category');
      return;
    }
    setSelectedCategory(category);
    setEditName(category.name);
    setEditIcon(category.icon || "");
    setEditModalVisible(true);
    setEditError("");
  };

  const closeEditModal = () => {
    setEditModalVisible(false);
    setSelectedCategory(null);
    setEditName("");
    setEditIcon("");
    setEditLoading(false);
    setEditError("");
  };

  const confirmEditCategory = async () => {
    if (!selectedCategory || !editName.trim()) {
      setEditError("Category name is required");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      await updateCategory(selectedCategory.id, {
        name: editName,
        icon: editIcon || selectedCategory.icon,
      });
      closeEditModal();
      loadCategories();
    } catch (_error) {
      setEditError("Failed to update category");
      setEditLoading(false);
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        const asset = result.assets[0];
        // Prefer storing a data URI (base64) when available — this persists across reloads and works on web/native
        if (asset.base64) {
          // Guess mime type from uri extension if possible, otherwise default to jpeg
          let mime = "image/jpeg";
          try {
            const uri = asset.uri || "";
            const ext = uri.split(".").pop();
            if (ext) {
              const e = ext.toLowerCase();
              if (e === "png") mime = "image/png";
              else if (e === "webp") mime = "image/webp";
              else if (e === "jpg" || e === "jpeg") mime = "image/jpeg";
            }
          } catch (_e) {}

          const dataUri = `data:${mime};base64,${asset.base64}`;
          setEditIcon(dataUri);
        } else if (asset.uri) {
          // Fallback to the file URI
          setEditIcon(asset.uri);
        }
      }
    } catch (_error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => router.push("/")}
          style={styles.backButton}
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
        </Pressable>
        <Text style={[
          styles.headerTitle,
          { fontSize: isMobile ? FontSizes.medium : FontSizes.xlarge }
        ]}>
          Manage Categories
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <Text style={styles.loadingText}>Loading categories...</Text>
        ) : categories.length === 0 ? (
          <Text style={styles.emptyText}>No categories found</Text>
        ) : (
          <>
            <Text style={styles.subtitle}>
              Manage your jewellery categories. You can edit and delete it here.
            </Text>
            {categories.map((category) => (
              <View key={category.id || 'archive'} style={styles.categoryCard}>
                <View style={styles.categoryInfo}>
                  <Image
                    source={{ uri: category.icon }}
                    style={styles.categoryIcon}
                  />
                  <View style={styles.categoryDetails}>
                    <Text style={styles.categoryName}>{category.name}</Text>
                    <Text style={styles.itemCount}>
                      {category.itemCount} {category.itemCount === 1 ? 'item' : 'items'}
                    </Text>
                  </View>
                </View>
                {!category.isDefault && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={styles.editButton}
                      onPress={() => openEditModal(category)}
                    >
                      <Svg
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={Colors.primary}
                        strokeWidth="2"
                      >
                        <Path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <Path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </Svg>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.deleteButton}
                      onPress={() => openDeleteModal(category)}
                    >
                      <Svg
                        width={20}
                        height={20}
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={Colors.red}
                        strokeWidth="2"
                      >
                        <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </Svg>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
            {/* Delete Confirmation Modal */}
            <Modal
              visible={deleteModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={closeDeleteModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                    <Text style={[
                      styles.modalTitle,
                      { fontSize: isMobile ? FontSizes.large : FontSizes.xlarge }
                    ]}>
                      Delete Category
                    </Text>
                    <Pressable onPress={closeDeleteModal} style={styles.closeButton}>
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
                  <View style={styles.modalBody}>
                    {selectedCategory && (
                      <>
                        <Text style={[
                          styles.modalLabel,
                          { fontSize: isMobile ? FontSizes.medium : FontSizes.large }
                        ]}>
                          Are you sure you want to delete <Text style={{fontWeight:'bold'}}>{selectedCategory.name}</Text>?
                        </Text>
                        <Text style={[
                          styles.modalSubtext,
                          { fontSize: isMobile ? FontSizes.small : FontSizes.medium }
                        ]}>
                          All {selectedCategory.itemCount} items will remain in Archive.
                        </Text>
                        {deleteError ? (
                          <Text style={[
                            styles.modalError,
                            { fontSize: isMobile ? FontSizes.small : FontSizes.medium }
                          ]}>
                            {deleteError}
                          </Text>
                        ) : null}
                      </>
                    )}
                  </View>
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeDeleteModal}
                      disabled={deleteLoading}
                    >
                      <Text style={[
                        styles.cancelButtonText,
                        { fontSize: isMobile ? FontSizes.medium : FontSizes.large }
                      ]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmDeleteButton}
                      onPress={confirmDeleteCategory}
                      disabled={deleteLoading}
                    >
                      <Text style={[
                        styles.confirmDeleteButtonText,
                        { fontSize: isMobile ? FontSizes.medium : FontSizes.large }
                      ]}>
                        {deleteLoading ? "Deleting..." : "Delete"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>

            {/* Edit Category Modal */}
            <Modal
              visible={editModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={closeEditModal}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                  <View style={styles.modalHeader}>
                    <Text style={[
                      styles.modalTitle,
                      { fontSize: isMobile ? FontSizes.large : FontSizes.xlarge }
                    ]}>
                      Edit Category
                    </Text>
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
                  <View style={styles.modalBody}>
                    {selectedCategory && (
                      <>
                        <Text style={[
                          styles.modalLabel,
                          { fontSize: isMobile ? FontSizes.medium : FontSizes.large }
                        ]}>
                          Category Name
                        </Text>
                        <TextInput
                          style={[
                            styles.modalInput,
                            { fontSize: isMobile ? FontSizes.medium : FontSizes.medium }
                          ]}
                          value={editName}
                          onChangeText={setEditName}
                          placeholder="Enter category name"
                          placeholderTextColor={Colors.border}
                        />
                        <Text style={[
                          styles.modalLabel,
                          { marginTop: 20, fontSize: isMobile ? FontSizes.medium : FontSizes.large }
                        ]}>
                          Category Icon
                        </Text>
                        <View style={styles.iconContainer}>
                          <Image
                            source={{ uri: editIcon }}
                            style={styles.categoryIconPreview}
                          />
                          <TouchableOpacity
                            style={styles.uploadIconButton}
                            onPress={pickImage}
                          >
                            <Svg
                              width={24}
                              height={24}
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke={Colors.primary}
                              strokeWidth="2"
                            >
                              <Path d="M12 5v14M5 12h14" />
                            </Svg>
                          </TouchableOpacity>
                        </View>
                        {editError ? (
                          <Text style={[
                            styles.modalError,
                            { fontSize: isMobile ? FontSizes.small : FontSizes.medium }
                          ]}>
                            {editError}
                          </Text>
                        ) : null}
                      </>
                    )}
                  </View>
                  <View style={styles.modalFooter}>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={closeEditModal}
                      disabled={editLoading}
                    >
                      <Text style={[
                        styles.cancelButtonText,
                        { fontSize: isMobile ? FontSizes.medium : FontSizes.large }
                      ]}>
                        Cancel
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.confirmDeleteButton}
                      onPress={confirmEditCategory}
                      disabled={editLoading}
                    >
                      <Text style={[
                        styles.confirmDeleteButtonText,
                        { fontSize: isMobile ? FontSizes.medium : FontSizes.large }
                      ]}>
                        {editLoading ? "Saving..." : "Save"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </>
        )}
      </ScrollView>
    </View>
  );
}
const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 24,
  },
  backButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  headerTitle: {
    fontWeight: "bold",
    color: Colors.text,
  },
  placeholder: {
    width: 34,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
  },
  subtitle: {
    fontSize: FontSizes.medium,
    color: Colors.text,
    marginBottom: 32,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 22,
    color: Colors.text,
    textAlign: "center",
    marginTop: 32,
  },
  emptyText: {
    fontSize: 22,
    color: Colors.text,
    textAlign: "center",
    marginTop: 32,
  },
  categoryCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.secondary,
  },
  categoryInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 16,
  },
  categoryDetails: {
    flex: 1,
  },
  categoryName: {
    fontSize: FontSizes.medium,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 4,
  },
  itemCount: {
    fontSize: FontSizes.small,
    color: Colors.border,
    fontWeight: "500",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  editButton: {
    padding: 8,
  },
  deleteButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
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
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  modalTitle: {
    fontWeight: "bold",
    color: Colors.text,
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 24,
  },
  modalLabel: {
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  modalSubtext: {
    color: Colors.border,
    marginBottom: 12,
    textAlign: "center",
  },
  modalError: {
    color: "#e74c3c",
    marginBottom: 12,
    textAlign: "center",
  },
  modalInput: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.secondary,
    marginBottom: 12,
  },
  previewIcon: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginVertical: 12,
    alignSelf: "center",
  },
  iconContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginTop: 12,
  },
  categoryIconPreview: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.border,
  },
  uploadIconButton: {
    width: 48,
    height: 48,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: `${Colors.primary}08`,
  },
  modalFooter: {
    flexDirection: "row",
    gap: 12,
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: Colors.background,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: Colors.border,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButtonText: {
    color: Colors.white,
    fontWeight: "bold",
  },
  confirmDeleteButton: {
    flex: 1,
    backgroundColor: "#e74c3c",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmDeleteButtonText: {
    color: Colors.white,
    fontWeight: "bold",
  },
};