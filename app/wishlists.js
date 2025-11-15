import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Path } from "react-native-svg";
import CategoryCard from "../components/CategoryCard";
import ImageLightbox from "../components/ImageLightbox";
import ImageSelector from "../components/ImageSelector";
import { Colors, FontSizes, Spacing } from "../constants/theme";
import {
  deleteWishlist,
  getAllCategories,
  getWishlists,
  saveWishlist
} from "../utils/database";

export default function WishlistsScreen() {
  const [wishlists, setWishlists] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [selectedImages, setSelectedImages] = useState([]);
  
  // Image selector state
  const [selectorVisible, setSelectorVisible] = useState(false);
  const [selectorCategory, setSelectorCategory] = useState("");
  
  // Lightbox state
  const [lightboxVisible, setLightboxVisible] = useState(false);
  const [lightboxImages, setLightboxImages] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Delete confirmation state
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [wishlistToDelete, setWishlistToDelete] = useState(null);

  const loadData = useCallback(async () => {
    const allWishlists = await getWishlists();
    const allCategories = await getAllCategories();
    setWishlists(allWishlists);
    setCategories(allCategories);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const toggleCategory = (categoryName) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleCreateWishlist = async () => {
    if (!customerName.trim()) {
      Alert.alert("Error", "Please enter customer name");
      return;
    }
    if (selectedImages.length === 0) {
      Alert.alert("Error", "Please select at least one image");
      return;
    }

    try {
      const imageIds = selectedImages.map((img) => img.imgId || img.id).join(", ");
      const categories = [...new Set(selectedImages.map((img) => {
        // Get category from the image's categories array
        return img.categories ? img.categories[0] : "Archive";
      }))];

      await saveWishlist({
        customerName: customerName.trim(),
        categories: categories,
        jewelleryIds: imageIds,
        images: selectedImages.map((img) => ({
          id: img.id,
          imgId: img.imgId,
          name: img.name,
          image: img.image,
          metal: img.metal,
          weight: img.weight,
          carat: img.carat,
        })),
      });
      Alert.alert("Success", "Wishlist created successfully!");
      setCustomerName("");
      setSelectedCategories([]);
      setSelectedImages([]);
      setShowCategoryDropdown(false);
      loadData();
    } catch (_error) {
      Alert.alert("Error", "Failed to create wishlist");
    }
  };

  const openImageSelector = (categoryName) => {
    setSelectorCategory(categoryName);
    setSelectorVisible(true);
  };

  const handleImageSelect = (image) => {
    setSelectedImages((prev) => {
      const exists = prev.find((img) => img.id === image.id);
      if (exists) {
        return prev.filter((img) => img.id !== image.id);
      } else {
        return [...prev, image];
      }
    });
  };

  const removeSelectedImage = (imageId) => {
    setSelectedImages((prev) => prev.filter((img) => img.id !== imageId));
  };

  const handleDeleteWishlist = (wishlistId, customerName) => {
    setWishlistToDelete({ id: wishlistId, name: customerName });
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = async () => {
    if (!wishlistToDelete) return;
    
    try {
      await deleteWishlist(wishlistToDelete.id);
      setDeleteConfirmVisible(false);
      setWishlistToDelete(null);
      loadData();
    } catch (_error) {
      Alert.alert("Error", "Failed to delete wishlist");
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setWishlistToDelete(null);
  };

  const getSelectedCategoryObjects = () => {
    return categories.filter((cat) => selectedCategories.includes(cat.name));
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
            stroke={Colors.white}
            strokeWidth="2"
          >
            <Path d="M19 12H5M12 19l-7-7 7-7" />
          </Svg>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wishlists</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView style={styles.scrollContainer}>
        {/* Wishlists List */}
        <View style={styles.listSection}>
          {wishlists.length === 0 ? (
            <View style={styles.emptyWishlist}>
              <Svg
                width={60}
                height={60}
                viewBox="0 0 24 24"
                fill="none"
                stroke={Colors.border}
                strokeWidth="2"
              >
                <Path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </Svg>
              <Text style={styles.emptyWishlist}>No wishlists yet, please create one</Text>
            </View>
          ) : (
            wishlists.map((wishlist) => (
              <View key={wishlist.id} style={styles.wishlistCard}>
                <View style={styles.wishlistHeader}>
                  <Text style={styles.wishlistCustomerName}>Customer: {wishlist.customerName}</Text>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() =>
                      handleDeleteWishlist(wishlist.id, wishlist.customerName)
                    }
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
                  </TouchableOpacity>
                </View>
                <View style={styles.wishlistBody}>
                  <View style={styles.categoriesRow}>
                    {wishlist.categories.map((cat, idx) => (
                      <View key={idx} style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{cat}</Text>
                      </View>
                    ))}
                  </View>
                  
                  {wishlist.images && wishlist.images.length > 0 && (
                    <View style={styles.wishlistImagesSection}>
                      <Text style={styles.wishlistImagesTitle}>
                        Wishlist Images ({wishlist.images.length})
                      </Text>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={styles.wishlistImagesScroll}
                      >
                        {wishlist.images.map((img, idx) => (
                          <Pressable
                            key={idx}
                            style={styles.wishlistImageCard}
                            onPress={() => {
                              setLightboxImages(wishlist.images);
                              setLightboxIndex(idx);
                              setLightboxVisible(true);
                            }}
                          >
                            <Image
                              source={{ uri: img.image }}
                              style={styles.wishlistImageThumb}
                            />
                            <View style={styles.wishlistImageOverlay}>
                              <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                                <Path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <Path d="M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z" />
                              </Svg>
                            </View>
                            {img.imgId && (
                              <Text style={styles.wishlistImageId}>ID: {img.imgId}</Text>
                            )}
                          </Pressable>
                        ))}
                      </ScrollView>
                    </View>
                  )}
                  
                  {wishlist.jewelleryIds && (
                    <Text style={styles.wishlistText}>IDs: {wishlist.jewelleryIds}</Text>
                  )}
                  <Text style={styles.wishlistDate}>
                    Created: {new Date(wishlist.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Create Form */}
        <View>
          <View style={styles.formContent}>
            <Text style={styles.formTitle}>Create New Wishlist</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Customer Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter customer name"
                value={customerName}
                onChangeText={setCustomerName}
                placeholderTextColor={Colors.border}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Categories <Text style={styles.required}>*</Text>
              </Text>
              <Pressable
                style={styles.dropdownButton}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <Text style={styles.dropdownButtonText}>
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} selected`
                    : "Select categories"}
                </Text>
                <Svg
                  width={20}
                  height={20}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke={Colors.primary}
                  strokeWidth="2"
                >
                  <Path
                    d={
                      showCategoryDropdown
                        ? "M18 15l-6-6-6 6"
                        : "M6 9l6 6 6-6"
                    }
                  />
                </Svg>
              </Pressable>
              {selectedCategories.length > 0 && (
                <>
                  <View style={styles.selectedCategoriesContainer}>
                    {selectedCategories.map((cat, index) => (
                      <View key={index} style={styles.selectedCategoryChip}>
                        <Text style={styles.selectedCategoryText}>{cat}</Text>
                        <Pressable onPress={() => toggleCategory(cat)}>
                          <Svg
                            width={16}
                            height={16}
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke={Colors.white}
                            strokeWidth="2"
                          >
                            <Path d="M18 6L6 18M6 6l12 12" />
                          </Svg>
                        </Pressable>
                      </View>
                    ))}
                  </View>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoryCardsScroll}
                  >
                    {getSelectedCategoryObjects().map((cat, index) => (
                      <CategoryCard
                        key={index}
                        category={cat}
                        width={120}
                        onPress={() => openImageSelector(cat.name)}
                      />
                    ))}
                  </ScrollView>
                </>
              )}
            </View>

            {selectedImages.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Selected Images ({selectedImages.length})</Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.selectedImagesScroll}
                >
                  {selectedImages.map((img) => (
                    <View key={img.id} style={styles.selectedImageCard}>
                      <Image source={{ uri: img.image }} style={styles.selectedImageThumb} />
                      <Pressable
                        style={styles.removeImageButton}
                        onPress={() => removeSelectedImage(img.id)}
                      >
                        <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                          <Path d="M18 6L6 18M6 6l12 12" />
                        </Svg>
                      </Pressable>
                      <Text style={styles.selectedImageId}>ID: {img.imgId || img.id}</Text>
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jewellery IDs (Auto-filled)</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={selectedImages.map((img) => img.imgId || img.id).join(", ")}
                editable={false}
                placeholderTextColor={Colors.border}
              />
              {showCategoryDropdown && (
                <ScrollView
                  style={styles.dropdownList}
                  nestedScrollEnabled={true}
                >
                  {categories.map((cat, index) => (
                    <Pressable
                      key={index}
                      style={styles.dropdownItem}
                      onPress={() => toggleCategory(cat.name)}
                    >
                      <Text style={styles.dropdownItemText}>{cat.name}</Text>
                      {selectedCategories.includes(cat.name) && (
                        <Svg
                          width={20}
                          height={20}
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={Colors.primary}
                          strokeWidth="2"
                        >
                          <Path d="M20 6L9 17l-5-5" />
                        </Svg>
                      )}
                    </Pressable>
                  ))}
                </ScrollView>
              )}
            </View>



            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateWishlist}
            >
              <Text style={styles.submitButtonText}>Create Wishlist</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* Image Selector Modal */}
      <ImageSelector
        visible={selectorVisible}
        categoryName={selectorCategory}
        selectedImages={selectedImages}
        onSelect={handleImageSelect}
        onClose={() => setSelectorVisible(false)}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        visible={deleteConfirmVisible}
        transparent
        animationType="fade"
        onRequestClose={cancelDelete}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.confirmModal}>
            <Text style={styles.confirmTitle}>Delete Wishlist</Text>
            <Text style={styles.confirmMessage}>
              Are you sure you want to delete wishlist for &quot;{wishlistToDelete?.name}&quot;?
            </Text>
            <View style={styles.confirmButtons}>
              <TouchableOpacity
                style={[styles.confirmButton, styles.cancelButton]}
                onPress={cancelDelete}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.confirmButton, styles.confirmDeleteButton]}
                onPress={confirmDelete}
              >
                <Text style={styles.confirmDeleteButtonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Image Lightbox */}
      <ImageLightbox
        visible={lightboxVisible}
        images={lightboxImages}
        initialIndex={lightboxIndex}
        onClose={() => setLightboxVisible(false)}
      />
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
    paddingBottom: Spacing.md,
  },
  backButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 3,
  },
  headerTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.text,
  },
  listSection: {
    padding: Spacing.lg,
    borderBottomWidth: 1,
    borderColor: Colors.primary,
  },
  emptyWishlist: {
    alignItems: "center",
    paddingVertical: 60,
    fontSize: FontSizes.medium,
    fontWeight: "600",
    color: Colors.text,
  },
  wishlistCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.lg,
    marginBottom: Spacing.md,
  },
  wishlistHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  deleteButton: {
    backgroundColor: Colors.red,
    padding: 8,
    borderRadius: 6,
    elevation: 2,
  },

  wishlistCustomerName: {
    fontSize: FontSizes.large,
    fontWeight: "700",
    color: Colors.text,
  },
  wishlistText: {
    fontSize: FontSizes.medium,
    fontWeight: "600",
    color: Colors.text,
    borderBottomWidth: 1,
    borderColor: Colors.secondary,
    paddingBottom: Spacing.sm,
  },
  wishlistBody: {
    gap: Spacing.sm,
  },
  categoriesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.xs,
  },
  categoryBadge: {
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 16,
  },
  categoryBadgeText: {
    color: Colors.white,
    fontSize: FontSizes.small,
    fontWeight: "600",
  },
  categoryCardsScroll: {
    marginTop: Spacing.md,
    marginBottom: Spacing.md,
  },
  selectedImagesScroll: {
    marginTop: Spacing.sm,
  },
  selectedImageCard: {
    width: 100,
    marginRight: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  selectedImageThumb: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: Colors.red,
    borderRadius: 12,
    padding: 4,
  },
  selectedImageId: {
    fontSize: FontSizes.small,
    color: Colors.primary,
    fontWeight: "bold",
    textAlign: "center",
    padding: 4,
  },
  inputDisabled: {
    backgroundColor: Colors.secondary,
    color: Colors.text,
  },
  wishlistDate: {
    fontSize: FontSizes.small,
    color: Colors.text,
    fontStyle: "italic",
  },
  wishlistImagesSection: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  wishlistImagesTitle: {
    fontSize: FontSizes.small,
    fontWeight: "700",
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  wishlistImagesScroll: {
    marginTop: Spacing.xs,
  },
  wishlistImageCard: {
    width: 80,
    marginRight: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 8,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.secondary,
    position: "relative",
  },
  wishlistImageThumb: {
    width: "100%",
    aspectRatio: 1,
    resizeMode: "cover",
  },
  wishlistImageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  wishlistImageId: {
    fontSize: 10,
    color: Colors.primary,
    fontWeight: "bold",
    textAlign: "center",
    padding: 2,
    backgroundColor: Colors.white,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.lg,
  },
  confirmModal: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.xl,
    width: "100%",
    maxWidth: 400,
    elevation: 5,
  },
  confirmTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  confirmMessage: {
    fontSize: FontSizes.medium,
    color: Colors.text,
    marginBottom: Spacing.xl,
    textAlign: "center",
    lineHeight: 22,
  },
  confirmButtons: {
    flexDirection: "row",
    gap: Spacing.md,
  },
  confirmButton: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
  confirmDeleteButton: {
    backgroundColor: Colors.red,
  },
  confirmDeleteButtonText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
  formTitle: {
    fontSize: FontSizes.large,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: Spacing.md,
  },
  scrollContainer: {
    flex: 1,
  },
  formContent: {
    padding: Spacing.lg,
  },
  inputGroup: {
    marginBottom: Spacing.lg,
  },
  label: {
    fontSize: FontSizes.medium,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  required: {
    color: Colors.red,
  },
  input: {
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    fontSize: FontSizes.medium,
    color: Colors.text,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderWidth: 2,
    borderColor: Colors.secondary,
  },
  dropdownButtonText: {
    fontSize: FontSizes.medium,
    color: Colors.text,
    fontWeight: "600",
  },
  selectedCategoriesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  selectedCategoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: Colors.primary,
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: 20,
  },
  selectedCategoryText: {
    fontSize: FontSizes.small,
    color: Colors.white,
    fontWeight: "600",
  },
  dropdownList: {
    marginTop: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: Colors.secondary,
    maxHeight: 200,
    marginBottom: Spacing.md,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.background,
  },
  dropdownItemText: {
    fontSize: FontSizes.medium,
    color: Colors.text,
    fontWeight: "600",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    alignItems: "center",
    marginTop: Spacing.md,
    elevation: 3,
  },
  submitButtonText: {
    color: Colors.white,
    fontSize: FontSizes.large,
    fontWeight: "bold",
  },
});

