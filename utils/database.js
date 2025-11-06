import AsyncStorage from "@react-native-async-storage/async-storage";

const JEWELLERY_KEY = "@jewellery_items";
const CATEGORIES_KEY = "@custom_categories";
const IMG_COUNTER_KEY = "@img_counter";

// Get next image ID
const getNextImgId = async () => {
  try {
    const counter = await AsyncStorage.getItem(IMG_COUNTER_KEY);
    const nextId = counter ? parseInt(counter) + 1 : 1;
    await AsyncStorage.setItem(IMG_COUNTER_KEY, nextId.toString());
    // Format as 001, 002, 003, etc.
    return nextId.toString().padStart(3, "0");
  } catch (error) {
    console.error("Error getting next image ID:", error);
    return "001";
  }
};

// Jewellery Items Management
export const saveJewelleryItem = async (item) => {
  try {
    const { DEFAULT_CATEGORY } = require("../constants/categories");
    const existingItems = await getJewelleryItems();
    const imgId = await getNextImgId();
    
    // Always include Archive category
    const categories = item.categories || [];
    if (!categories.includes(DEFAULT_CATEGORY.name)) {
      categories.push(DEFAULT_CATEGORY.name);
    }

    const newItem = {
      id: Date.now().toString(),
      imgId: imgId,
      ...item,
      categories, // Override with updated categories
      createdAt: new Date().toISOString(),
    };
    const updatedItems = [...existingItems, newItem];
    await AsyncStorage.setItem(JEWELLERY_KEY, JSON.stringify(updatedItems));
    return newItem;
  } catch (error) {
    console.error("Error saving jewellery item:", error);
    throw error;
  }
};

export const getJewelleryItems = async () => {
  try {
    const items = await AsyncStorage.getItem(JEWELLERY_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Error getting jewellery items:", error);
    return [];
  }
};

export const getJewelleryByCategory = async (categoryName) => {
  try {
    const allItems = await getJewelleryItems();
    const filteredItems = allItems.filter((item) => {
      // Support both old single category and new multiple categories
      if (item.categories && Array.isArray(item.categories)) {
        return item.categories.some(
          (cat) => cat.toLowerCase() === categoryName.toLowerCase()
        );
      }
      // Backward compatibility for old single category
      if (item.category) {
        return item.category.toLowerCase() === categoryName.toLowerCase();
      }
      return false;
    });
    // Return in LIFO order (most recent first)
    return filteredItems.reverse();
  } catch (error) {
    console.error("Error getting jewellery by category:", error);
    return [];
  }
};

export const updateJewelleryItem = async (itemId, updatedData) => {
  try {
    const existingItems = await getJewelleryItems();
    const updatedItems = existingItems.map((item) =>
      item.id === itemId ? { ...item, ...updatedData } : item
    );
    await AsyncStorage.setItem(JEWELLERY_KEY, JSON.stringify(updatedItems));
    return true;
  } catch (error) {
    console.error("Error updating jewellery item:", error);
    throw error;
  }
};

export const deleteJewelleryItem = async (itemId) => {
  try {
    const existingItems = await getJewelleryItems();
    const updatedItems = existingItems.filter((item) => item.id !== itemId);
    await AsyncStorage.setItem(JEWELLERY_KEY, JSON.stringify(updatedItems));
    return true;
  } catch (error) {
    console.error("Error deleting jewellery item:", error);
    throw error;
  }
};

// Custom Categories Management
export const saveCategory = async (category) => {
  try {
    const existingCategories = await getCustomCategories();
    const newCategory = {
      id: Date.now().toString(),
      ...category,
      createdAt: new Date().toISOString(),
    };
    const updatedCategories = [...existingCategories, newCategory];
    await AsyncStorage.setItem(
      CATEGORIES_KEY,
      JSON.stringify(updatedCategories)
    );
    return newCategory;
  } catch (error) {
    console.error("Error saving category:", error);
    throw error;
  }
};

export const getCustomCategories = async () => {
  try {
    const categories = await AsyncStorage.getItem(CATEGORIES_KEY);
    return categories ? JSON.parse(categories) : [];
  } catch (error) {
    console.error("Error getting custom categories:", error);
    return [];
  }
};

export const getAllCategories = async () => {
  try {
    const { DEFAULT_CATEGORY } = require("../constants/categories");
    const customCategories = await getCustomCategories();
    
    // Format Archive category
    const archiveCategory = {
      id: DEFAULT_CATEGORY.id,
      name: DEFAULT_CATEGORY.name,
      iconSource: DEFAULT_CATEGORY.icon,
      isDefault: true,
    };
    
    // Custom categories with base64 icons
    const formattedCustomCategories = customCategories
      .map((cat) => ({
        id: cat.id,
        name: cat.name,
        iconSource: cat.icon,
        isCustom: true,
      }))
      // Sort alphabetically by name
      .sort((a, b) => a.name.localeCompare(b.name));
    
    // Return sorted categories with Archive at end
    return [...formattedCustomCategories, archiveCategory];
  } catch (error) {
    console.error("Error getting all categories:", error);
    return [];
  }
};

export const deleteCategory = async (categoryId) => {
  try {
    const existingCategories = await getCustomCategories();
    const updatedCategories = existingCategories.filter(
      (cat) => cat.id !== categoryId
    );
    await AsyncStorage.setItem(
      CATEGORIES_KEY,
      JSON.stringify(updatedCategories)
    );
    return true;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};
