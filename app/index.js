import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors, Spacing } from "../constants/theme";
import { getAllCategories } from "../utils/database";

export default function HomeScreen() {
  const [categories, setCategories] = useState([]);

  const loadCategories = useCallback(async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );


  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.logo}>ABHUSHAN BHANDAR</Text>
          <View style={styles.headerBtns}>
            <Pressable
              onPress={() => router.push("/add")}
              style={styles.headerButton}
            >
              <Svg width="20px" height="20px" viewBox="0 0 24 24" fill="none">
                <Path
                  d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1z"
                  fill="#fff"
                />
              </Svg>
              <Text style={styles.headerButtonText}>Add</Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/wishlists")}
              style={styles.headerButton}
            >
              <Svg width={18} height={18} viewBox="0 0 20 20" fill="#fff">
                <Path d="M18,20H2c-0.6,0-1.1-0.6-1-1.2l2-12C3.1,6.4,3.5,6,4,6h12c0.5,0,0.9,0.4,1,0.8l2,12C19.1,19.4,18.6,20,18,20z M3.2,18h13.6 L15.2,8H4.8L3.2,18z" />
                <Path d="M14,5h-2V4c0-1.1-0.9-2-2-2S8,2.9,8,4v1H6V4c0-2.2,1.8-4,4-4s4,1.8,4,4V5z" />
              </Svg>
              <Text style={styles.headerButtonText}>Wishlists</Text>
            </Pressable>
          </View>
        </View>

  <Text style={styles.title}>Explore Our Elegant Collection</Text>

        {/* Categories Grid */}
        <View style={styles.jewelleryCategories}>
          {/** render normal categories first, keep Archive (isDefault) last **/}
          {(() => {
            const archive = categories.find(c => c.isDefault || (c.name || '').toLowerCase() === 'archive');
            const regular = categories.filter(c => !(c.isDefault || (c.name || '').toLowerCase() === 'archive'));
            return (
              <>
                {regular.map((category, index) => (
                  <Pressable
                    key={category.id || index}
                    style={({ pressed }) => [styles.categoryItem, pressed && styles.categoryItemHovered]}
                    onPress={() => router.push(`/category/${category.name.toLowerCase()}`)}
                  >
                    <View style={styles.categoryImageContainer}>
                      <Image source={{ uri: category.icon }} style={styles.categoryImage} resizeMode="cover" />
                    </View>
                    <Text style={styles.categoryTitle}>{category.name}</Text>
                  </Pressable>
                ))}

                {/* Archive (if present) - reuse same category styles */}
                {archive && (
                  <Pressable
                    key={archive.id || 'archive'}
                    style={({ pressed }) => [styles.categoryItem, pressed && styles.categoryItemHovered]}
                    onPress={() => router.push(`/category/${archive.name.toLowerCase()}`)}
                  >
                    <View style={styles.categoryImageContainer}>
                      <Image source={{ uri: archive.icon }} style={styles.categoryImage} resizeMode="cover" />
                    </View>
                    <Text style={styles.categoryTitle}>{archive.name}</Text>
                  </Pressable>
                )}

                {/* Manage Categories - kept last and reuses same item style for consistency */}
                <Pressable
                  style={({ pressed }) => [styles.categoryItem, pressed && styles.categoryItemHovered]}
                  onPress={() => router.push('/manage-categories')}
                >
                  <View style={styles.categoryImageContainer}>
                    <Svg width={48} height={48} viewBox="0 0 24 24" fill={Colors.primary} stroke={Colors.white} strokeWidth="1">
                      <Path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
                    </Svg>
                  </View>
                  <Text style={styles.categoryTitle}>Manage Categories</Text>
                </Pressable>
              </>
            );
          })()}
  </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            All Rights Reserved © 2025 Abhushan Bhandar
          </Text>
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
  gradient: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 30,
    paddingBottom: 20,
    paddingHorizontal: Spacing.lg,
  },
  logoGradientContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logo: {
    fontSize: 18,
    fontWeight: "bold",
    letterSpacing: 1,
    color: Colors.primary,
    flex: 1,
  },
  headerBtns: {
    flexDirection: "row",
    gap: 6,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 6,
    backgroundColor: Colors.primary,
    elevation: 2,
  },
  headerButtonText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.lg,
  },
  title: {
    fontSize: 36,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 30,
    fontFamily: "serif",
    letterSpacing: 0.5,
    textShadowColor: "rgba(196, 144, 89, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },

  jewelleryCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    // gap is a web-only/CSS property; use item margins for spacing on native
    justifyContent: "flex-start",
  },
  categoryItem: {
    minWidth: 140,
    flex: 1,
    flexBasis: "22%",
    backgroundColor: Colors.white,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 3,
    margin: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryItemHovered: {
    elevation: 8,
  },
  categoryImageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: Colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryImage: {
    width: '100%',
    height: '100%',
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 8,
    paddingVertical: 6,
    backgroundColor: 'transparent',
  },

  footer: {
    paddingVertical: 30,
    alignItems: "center",
    marginTop: 40,
  },
  footerText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: "600",
  },
});
