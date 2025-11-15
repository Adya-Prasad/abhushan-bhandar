import * as FileSystem from "expo-file-system/legacy";
import * as MediaLibrary from "expo-media-library";
import { Alert } from "react-native";
import { getAllCategories, getJewelleryItems } from "./database";

// Download all images to device
export const downloadAllImages = async () => {
  try {
    // Request permission to access media library
    const { status } = await MediaLibrary.requestPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please grant permission to save images to your device."
      );
      return { success: false, message: "Permission denied" };
    }

    // Get all jewelry items and categories
    const jewelleryItems = await getJewelleryItems();
    const categories = await getAllCategories();

    let downloadedCount = 0;
    const errors = [];

    // Download jewelry images
    for (const item of jewelleryItems) {
      try {
        if (item.image && item.image.startsWith("data:")) {
          // Image is base64, save it
          const filename = `jewellery_${item.imgId || item.id}_${item.name.replace(/[^a-z0-9]/gi, "_")}.jpg`;
          const fileUri = `${FileSystem.cacheDirectory}${filename}`;

          // Extract base64 data
          const base64Data = item.image.split(",")[1];
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Save to media library
          await MediaLibrary.createAssetAsync(fileUri);
          downloadedCount++;
        } else if (item.image && item.image.startsWith("file://")) {
          // Image is already a file, just copy to media library
          await MediaLibrary.createAssetAsync(item.image);
          downloadedCount++;
        }
      } catch (error) {
        console.error(`Error downloading image for ${item.name}:`, error);
        errors.push(item.name);
      }
    }

    // Download category icons
    for (const category of categories) {
      try {
        if (
          category.icon &&
          category.icon.startsWith("data:") &&
          !category.isDefault
        ) {
          const filename = `category_${category.name.replace(/[^a-z0-9]/gi, "_")}.jpg`;
          const fileUri = `${FileSystem.cacheDirectory}${filename}`;

          // Extract base64 data
          const base64Data = category.icon.split(",")[1];
          await FileSystem.writeAsStringAsync(fileUri, base64Data, {
            encoding: FileSystem.EncodingType.Base64,
          });

          // Save to media library
          await MediaLibrary.createAssetAsync(fileUri);
          downloadedCount++;
        } else if (
          category.icon &&
          category.icon.startsWith("file://") &&
          !category.isDefault
        ) {
          await MediaLibrary.createAssetAsync(category.icon);
          downloadedCount++;
        }
      } catch (error) {
        console.error(`Error downloading icon for ${category.name}:`, error);
        errors.push(`${category.name} (icon)`);
      }
    }

    return {
      success: true,
      downloadedCount,
      totalItems: jewelleryItems.length + categories.filter((c) => !c.isDefault).length,
      errors,
    };
  } catch (error) {
    console.error("Error downloading images:", error);
    throw error;
  }
};
