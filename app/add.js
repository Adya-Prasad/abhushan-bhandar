import { useFocusEffect } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
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
  getAllCategories,
  saveCategory,
  saveJewelleryItem,
} from "../utils/database";

export default function AddScreen() {
  const [activeTab, setActiveTab] = useState("jewellery");
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

  // Category form state
  const [categoryName, setCategoryName] = useState("");
  const [categoryIcon, setCategoryIcon] = useState(null);

  // Jewellery form state
  const [jewelleryImage, setJewelleryImage] = useState(null);
  const [jewelleryName, setJewelleryName] = useState("");
  const [selectedCategories, setSelectedCategories] = useState(["All"]);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [metal, setMetal] = useState("");
  const [weight, setWeight] = useState("");
  const [carat, setCarat] = useState("");

  const loadCategories = useCallback(async () => {
    try {
      console.log('Loading categories...');
      const allCategories = await getAllCategories();
      console.log('Categories loaded:', allCategories);
      setCategories(allCategories);
    } catch (error) {
      console.error('Error loading categories:', error);
      Alert.alert('Error', 'Failed to load categories');
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  const pickImage = async (type) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled) {
      const base64Image = `data:image/jpeg;base64,${result.assets[0].base64}`;
      if (type === "category") {
        setCategoryIcon(base64Image);
      } else {
        setJewelleryImage(base64Image);
      }
    }
  };

  const handleCreateCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert("Error", "Please enter category name");
      return;
    }
    if (!categoryIcon) {
      Alert.alert("Error", "Please select category icon");
      return;
    }

    try {
      // Check if category name already exists
      const allCategories = await getAllCategories();
      const categoryExists = allCategories.some(
        cat => cat.name.toLowerCase() === categoryName.trim().toLowerCase()
      );

      if (categoryExists) {
        Alert.alert("Error", "A category with this name already exists");
        return;
      }

      // Format category name properly (capitalize first letter)
      const formattedName = categoryName.trim();
      const finalName = formattedName.charAt(0).toUpperCase() + formattedName.slice(1);

      await saveCategory({
        name: finalName,
        icon: categoryIcon, // This is already base64 from pickImage
      });

      Alert.alert("Success", "Category created successfully!");
      setCategoryName("");
      setCategoryIcon(null);
      loadCategories(); // Refresh categories list
    } catch (_error) {
      Alert.alert("Error", "Failed to create category");
    }
  };

  const toggleCategory = (categoryName) => {
    // "All" category cannot be unchecked
    if (categoryName === "All") {
      return;
    }

    setSelectedCategories((prev) =>
      prev.includes(categoryName)
        ? prev.filter((c) => c !== categoryName)
        : [...prev, categoryName]
    );
  };

  const handleUploadJewellery = async () => {
    if (!jewelleryImage) {
      Alert.alert("Error", "Please select jewellery image");
      return;
    }
    if (!jewelleryName.trim()) {
      Alert.alert("Error", "Please enter jewellery name");
      return;
    }
    if (selectedCategories.length === 0) {
      Alert.alert("Error", "Please select at least one category");
      return;
    }

    try {
      await saveJewelleryItem({
        image: jewelleryImage,
        name: jewelleryName,
        categories: selectedCategories,
        metal: metal || null,
        weight: weight || null,
        carat: carat || null,
      });
      Alert.alert("Success", "Jewellery uploaded successfully!");
      setJewelleryImage(null);
      setJewelleryName("");
      setSelectedCategories(["All"]); // Reset to default with "All"
      setMetal("");
      setWeight("");
      setCarat("");
    } catch (_error) {
      Alert.alert("Error", "Failed to upload jewellery");
    }
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
        <Text style={[
          styles.headerTitle,
          { fontSize: isMobile ? FontSizes.medium : FontSizes.xlarge }
        ]}>
          Add New Jewellery or Category
        </Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.tabContainer}>
        <Pressable
          style={[styles.tab, activeTab === "jewellery" && styles.activeTab]}
          onPress={() => setActiveTab("jewellery")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "jewellery" && styles.activeTabText,
            ]}
          >
            Upload Jewellery
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, activeTab === "category" && styles.activeTab]}
          onPress={() => setActiveTab("category")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "category" && styles.activeTabText,
            ]}
          >
            Create Category
          </Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
      >
        {activeTab === "category" ? (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Create New Category</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Category Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter category name"
                value={categoryName}
                onChangeText={setCategoryName}
                placeholderTextColor={Colors.border}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Category Icon <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => pickImage("category")}
              >
                {categoryIcon ? (
                  <Image
                    source={{ uri: categoryIcon }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePickerContent}>
                    <Svg
                      width={40}
                      height={40}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={Colors.primary}
                      strokeWidth="2"
                    >
                      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </Svg>
                    <Text style={styles.imagePickerText}>
                      Tap to select icon
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleCreateCategory}
            >
              <Text style={styles.submitButtonText}>Create Category</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formSection}>
            <Text style={styles.sectionTitle}>Upload Jewellery</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Jewellery Image <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => pickImage("jewellery")}
              >
                {jewelleryImage ? (
                  <Image
                    source={{ uri: jewelleryImage }}
                    style={styles.previewImage}
                  />
                ) : (
                  <View style={styles.imagePickerContent}>
                    <Svg
                      width={40}
                      height={40}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={Colors.primary}
                      strokeWidth="2"
                    >
                      <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12" />
                    </Svg>
                    <Text style={styles.imagePickerText}>
                      Tap to select image
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Jewellery Name <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter jewellery name"
                value={jewelleryName}
                onChangeText={setJewelleryName}
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
                      showCategoryDropdown ? "M18 15l-6-6-6 6" : "M6 9l6 6 6-6"
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
                      style={[
                        styles.dropdownItem,
                        cat.name === "All" && styles.dropdownItemDisabled,
                      ]}
                      onPress={() => toggleCategory(cat.name)}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          cat.name === "All" && styles.dropdownItemTextDisabled,
                        ]}
                      >
                        {cat.name}
                        {cat.name === "All" && " (Always selected)"}
                      </Text>
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
              <Text style={styles.label}>Metal (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Gold, Silver, Platinum"
                value={metal}
                onChangeText={setMetal}
                placeholderTextColor={Colors.border}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Weight (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 10g"
                value={weight}
                onChangeText={setWeight}
                placeholderTextColor={Colors.border}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.label}>Carat (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 22K, 18K"
                value={carat}
                onChangeText={setCarat}
                placeholderTextColor={Colors.border}
              />
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleUploadJewellery}
            >
              <Text style={styles.submitButtonText}>Upload Jewellery</Text>
            </TouchableOpacity>
          </View>
        )}
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
    paddingBottom: Spacing.lg,
  },
  backButton: {
    padding: 8,
    backgroundColor: Colors.primary,
    borderRadius: 3,
    margin:2,
  },
  headerTitle: {
    fontWeight: "bold",
    color: Colors.text,
    marginLeft: 10,
  },
  placeholder: {
    width: 34,
  },
  tabContainer: {
    flexDirection: "row",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: Spacing.md,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: Colors.primary,
  },
  tabText: {
    fontSize: FontSizes.medium,
    color: Colors.white,
    fontWeight: "600",
  },
  activeTabText: {
    color: Colors.primary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },

  sectionTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.lg,
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
    borderColor: Colors.border,
  },
  imagePicker: {
    borderWidth: 2,
    borderColor: Colors.border,
    borderStyle: "dashed",
    borderRadius: 8,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.white,
  },
  imagePickerContent: {
    alignItems: "center",
  },
  imagePickerText: {
    marginTop: Spacing.sm,
    fontSize: FontSizes.medium,
    color: Colors.primary,
    fontWeight: "600",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
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
    borderColor: Colors.border,
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
  dropdownItemDisabled: {
    backgroundColor: Colors.background,
  },
  dropdownItemTextDisabled: {
    color: Colors.border,
    fontStyle: "italic",
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
