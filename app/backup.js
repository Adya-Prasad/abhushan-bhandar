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
        <View style={styles.content}>
          <View style={styles.infoCard}>
            <Svg
              width={64}
              height={64}
              viewBox="0 0 24 24"
              fill="none"
              stroke={Colors.primary}
              strokeWidth="2"
            >
              <Path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
            </Svg>
            <Text style={styles.infoTitle}>Download All Images</Text>
            <Text style={styles.infoText}>
              Save all your jewelry images and category icons to your device&apos;s gallery.
              This ensures you won&apos;t lose your images if you reinstall the app.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How It Works</Text>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <Text style={styles.stepText}>
                Tap the &quot;Download All Images&quot; button below
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <Text style={styles.stepText}>
                Grant permission to save images to your device
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <Text style={styles.stepText}>
                All images will be saved to your Photos/Gallery
              </Text>
            </View>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>4</Text>
              </View>
              <Text style={styles.stepText}>
                After reinstalling, you can re-add images from your gallery
              </Text>
            </View>
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

          <View style={styles.tipsCard}>
            <Text style={styles.tipsTitle}>💡 Important Notes</Text>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Images will be saved to your device&apos;s Photos/Gallery app
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Make sure you have enough storage space on your device
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                Download regularly to keep your images safe
              </Text>
            </View>
            <View style={styles.tipItem}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>
                You can also backup images to cloud storage (Google Photos, iCloud)
              </Text>
            </View>
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
  content: {
    maxWidth: 600,
    alignSelf: "center",
    width: "100%",
  },
  infoCard: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: Spacing.xl,
    alignItems: "center",
    marginBottom: Spacing.xl,
    elevation: 2,
  },
  infoTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
  },
  infoText: {
    fontSize: FontSizes.medium,
    color: Colors.text,
    textAlign: "center",
    lineHeight: 22,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSizes.large,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  stepNumberText: {
    color: Colors.white,
    fontSize: FontSizes.medium,
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    fontSize: FontSizes.medium,
    color: Colors.text,
    lineHeight: 22,
    paddingTop: 4,
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
  tipsCard: {
    backgroundColor: "#fff3cd",
    borderRadius: 12,
    padding: Spacing.lg,
  },
  tipsTitle: {
    fontSize: FontSizes.large,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: Spacing.md,
  },
  tipItem: {
    flexDirection: "row",
    marginBottom: Spacing.sm,
  },
  tipBullet: {
    fontSize: FontSizes.medium,
    color: Colors.text,
    marginRight: Spacing.sm,
    fontWeight: "bold",
  },
  tipText: {
    flex: 1,
    fontSize: FontSizes.medium,
    color: Colors.text,
    lineHeight: 22,
  },
});
