import AsyncStorage from "@react-native-async-storage/async-storage";

const JEWELLERY_KEY = "@jewellery_items";
const CATEGORIES_KEY = "@custom_categories";

// Jewellery Items Management
export const saveJewelleryItem = async (item) => {
  try {
    const existingItems = await getJewelleryItems();
    const newItem = {
      id: Date.now().toString(),
      ...item,
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
    return allItems.filter((item) => {
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
    const { CATEGORIES } = require("../constants/categories");
    const customCategories = await getCustomCategories();
    return [...CATEGORIES, ...customCategories];
  } catch (error) {
    console.error("Error getting all categories:", error);
    return [];
  }
};
