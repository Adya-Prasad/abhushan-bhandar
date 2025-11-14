import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes, Spacing } from "../constants/theme";
import {
  deleteWishlist,
  getAllCategories,
  getWishlists,
  saveWishlist,
} from "../utils/database";

export default function WishlistsScreen() {
  const [wishlists, setWishlists] = useState([]);
  const [categories, setCategories] = useState([]);

  // Form state
  const [customerName, setCustomerName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [jewelleryIds, setJewelleryIds] = useState("");

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
    if (selectedCategories.length === 0) {
      Alert.alert("Error", "Please select at least one category");
      return;
    }

    try {
      await saveWishlist({
        customerName: customerName.trim(),
        categories: selectedCategories,
        jewelleryIds: jewelleryIds.trim(),
      });
      Alert.alert("Success", "Wishlist created successfully!");
      setCustomerName("");
      setSelectedCategories([]);
      setJewelleryIds("");
      setShowCategoryDropdown(false);
      loadData();
    } catch (_error) {
      Alert.alert("Error", "Failed to create wishlist");
    }
  };

  const handleDeleteWishlist = (wishlistId, customerName) => {
    Alert.alert(
      "Delete Wishlist",
      `Delete wishlist for "${customerName}"?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteWishlist(wishlistId);
              loadData();
            } catch (_error) {
              Alert.alert("Error", "Failed to delete wishlist");
            }
          },
        },
      ]
    );
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
                    onPress={() =>
                      handleDeleteWishlist(wishlist.id, wishlist.customerName)
                    }
                  >
                    <Svg
                      width={20}
                      height={20}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#d43a5c"
                      strokeWidth="2"
                    >
                      <Path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </Svg>
                  </TouchableOpacity>
                </View>
                <View style={styles.wishlistBody}>
                    {wishlist.categories.map((cat, idx) => (
                      <View key={idx}>
                        <Text style={styles.wishlistText}>Category: {cat}</Text>
                      </View>
                    ))}
                  {wishlist.jewelleryIds && (
                    <>
                      <Text style={styles.wishlistText}>Jewellery IDs: {wishlist.jewelleryIds}
                      </Text>
                    </>
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
              )}
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

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Jewellery IDs (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 001, 002, 003"
                value={jewelleryIds}
                onChangeText={setJewelleryIds}
                placeholderTextColor={Colors.border}
              />
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
    marginBottom: Spacing.xs,
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
    gap: Spacing.xs,
  },
  wishlistDate: {
    fontSize: FontSizes.small,
    color: Colors.text,
    fontStyle: "italic",
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
