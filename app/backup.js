import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes, Spacing } from "../constants/theme";
import { downloadAllImages } from "../utils/backup";

export default function BackupScreen() {
  const [loading, setLoading] = useState(false);

  const handleDownloadAll = async () => {
    try {
      setLoading(true);
      const result = await downloadAllImages();

      if (result.success) {
        let message = `Successfully downloaded ${result.downloadedCount} images to your device!`;
        
        if (result.errors.length > 0) {
          message += `\n\nFailed to download: ${result.errors.join(", ")}`;
        }

        Alert.alert("Download Complete", message);
      }
    } catch (error) {
      console.error("Download error:", error);
      Alert.alert(
        "Error",
        "Failed to download images. Please check permissions and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push("/")} style={styles.backButton}>
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
        <Text style={styles.headerTitle}>Backup Images</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
          <View style={styles.section}>
            <Text style={styles.listitem}>
                ⋄ Save all your jewelry images and category icons to your device&apos;s gallery.
              This ensures you won&apos;t lose your images if you reinstall the app.
              </Text>
              <Text style={styles.listitem}>
                ⋄ Tap the &quot;Download All Images&quot; button below.
              </Text>
              <Text style={styles.listitem}>
                ⋄ Grant permission to save images to your device
              </Text>
              <Text style={styles.listitem}>
                ⋄ All images will be saved to your Photos/Gallery
              </Text>
              <Text style={styles.listitem}>
                ⋄ After reinstalling, you can re-add images from your gallery
              </Text>
              <Text style={styles.listitem}>
                ⋄ Download periodically to keep your images safe
              </Text>
              <Text style={styles.listitem}>
                ⋄ You can also backup images to cloud storage (Google Photos, iCloud)
              </Text>
          </View>

          <TouchableOpacity
            style={[styles.downloadButton, loading && styles.buttonDisabled]}
            onPress={handleDownloadAll}
            disabled={loading}
          >
            <Svg
              width={24}
              height={24}
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
            >
              <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </Svg>
            <Text style={styles.buttonText}>
              {loading ? "Downloading..." : "Download All Images"}
            </Text>
          </TouchableOpacity>
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
    borderRadius: 6,
  },
  headerTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.xl,
    backgroundColor: Colors.white,
    padding: Spacing.md,
    borderRadius: 6,
  },

  listitem: {
    flex: 1,
    fontSize: FontSizes.medium,
    color: Colors.text,
    lineHeight: 30,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    elevation: 3,
    marginBottom: Spacing.xl,
    
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: Colors.white,
    fontSize: FontSizes.large,
    fontWeight: "bold",
  },
});
