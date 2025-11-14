import { useFocusEffect } from "@react-navigation/native";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
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
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [dimensions, setDimensions] = useState(Dimensions.get("window"));

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setDimensions(window);
    });
    return () => subscription?.remove();
  }, []);

  const { width } = dimensions;
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;

  // Calculate items per row: 2 on mobile, 3 on tablet, 4 on desktop
  const itemsPerRow = isMobile ? 2 : isTablet ? 3 : 4;
  const horizontalPadding = isMobile ? Spacing.sm * 2 : Spacing.lg * 2;
  const itemMargin = 6; // margin on each side = 12 total per item
  const totalMarginSpace = itemMargin * 2 * itemsPerRow;
  const categoryItemWidth = (width - horizontalPadding - totalMarginSpace) / itemsPerRow;

  const loadCategories = useCallback(async () => {
    const allCategories = await getAllCategories();
    setCategories(allCategories);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadCategories();
    }, [loadCategories])
  );

  // Separate categories
  const archive = categories.find(
    (c) => c.isDefault || (c.name || "").toLowerCase() === "archive"
  );
  const regular = categories.filter(
    (c) => !(c.isDefault || (c.name || "").toLowerCase() === "archive")
  );

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingHorizontal: isMobile ? Spacing.sm : Spacing.lg }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={[
          styles.header,
          {
            paddingTop: isMobile ? 50 : 30,
            paddingBottom: isMobile ? 30 : 20,
            paddingHorizontal: isMobile ? Spacing.sm : Spacing.lg,
          }
        ]}>
          <Text style={[
            styles.logo,
            {
              fontSize: isMobile ? 12 : isTablet ? 16 : 18,
              letterSpacing: isMobile ? 0.5 : 1,
            }
          ]}>
            ABHUSHAN BHANDAR
          </Text>
          <View style={styles.headerBtns}>
            <Pressable
              onPress={() => router.push("/add")}
              style={[
                styles.headerButton,
                {
                  paddingHorizontal: isMobile ? 8 : 12,
                  paddingVertical: isMobile ? 6 : 9,
                }
              ]}
            >
              <Svg 
                width={isMobile ? 16 : 20} 
                height={isMobile ? 16 : 20} 
                viewBox="0 0 24 24" 
                fill="none"
              >
                <Path
                  d="M12 4a1 1 0 0 1 1 1v6h6a1 1 0 1 1 0 2h-6v6a1 1 0 1 1-2 0v-6H5a1 1 0 1 1 0-2h6V5a1 1 0 0 1 1-1z"
                  fill="#fff"
                />
              </Svg>
              <Text style={[
                styles.headerButtonText,
                { fontSize: isMobile ? 12 : 15 }
              ]}>
                {isMobile ? "" : " "}Add
              </Text>
            </Pressable>
            <Pressable
              onPress={() => router.push("/wishlists")}
              style={[
                styles.headerButton,
                {
                  paddingHorizontal: isMobile ? 8 : 12,
                  paddingVertical: isMobile ? 6 : 9,
                }
              ]}
            >
              <Svg 
                width={isMobile ? 14 : 18} 
                height={isMobile ? 14 : 18} 
                viewBox="0 0 20 20" 
                fill="#fff"
              >
                <Path d="M18,20H2c-0.6,0-1.1-0.6-1-1.2l2-12C3.1,6.4,3.5,6,4,6h12c0.5,0,0.9,0.4,1,0.8l2,12C19.1,19.4,18.6,20,18,20z M3.2,18h13.6 L15.2,8H4.8L3.2,18z" />
                <Path d="M14,5h-2V4c0-1.1-0.9-2-2-2S8,2.9,8,4v1H6V4c0-2.2,1.8-4,4-4s4,1.8,4,4V5z" />
              </Svg>
              <Text style={[
                styles.headerButtonText,
                { fontSize: isMobile ? 12 : 15 }
              ]}>
                {isMobile ? "" : " "}Wishlists
              </Text>
            </Pressable>
          </View>
        </View>

        <Text style={[
          styles.title,
          {
            fontSize: isMobile ? 20 : isTablet ? 28 : 35,
            marginBottom: isMobile ? 20 : 30,
          }
        ]}>
          Explore Our Elegant Collection
        </Text>

        {/* Categories Grid */}
        <View style={styles.jewelleryCategories}>
          {regular.map((category, index) => (
            <Pressable
              key={category.id || index}
              style={[
                styles.categoryItem,
                { width: Math.max(categoryItemWidth, 120) }
              ]}
              onPress={() =>
                router.push(`/category/${category.name.toLowerCase()}`)
              }
              onMouseEnter={() => setHoveredCategory(category.id)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <View style={styles.categoryImageContainer}>
                <Image
                  source={{ uri: category.icon }}
                  style={[
                    styles.categoryImage,
                    hoveredCategory === category.id &&
                      styles.categoryImageHovered,
                  ]}
                  resizeMode="cover"
                />
              </View>
              <Text style={[
                styles.categoryTitle,
                { fontSize: isMobile ? 13 : isTablet ? 17 : 21 }
              ]}>
                {category.name}
              </Text>
            </Pressable>
          ))}

          {archive && (
            <Pressable
              key={archive.id || "archive"}
              style={[
                styles.categoryItem,
                { width: Math.max(categoryItemWidth, 120) }
              ]}
              onPress={() =>
                router.push(`/category/${archive.name.toLowerCase()}`)
              }
            >
              <View style={styles.categoryImageContainer}>
                <Svg
                  width={isMobile ? 50 : isTablet ? 60 : 80}
                  height={isMobile ? 50 : isTablet ? 60 : 80}
                  viewBox="0 0 24 24"
                  fill={Colors.primary}
                  strokeWidth="1"
                >
                  <Path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
                </Svg>
              </View>
              <Text style={[
                styles.categoryTitle,
                { fontSize: isMobile ? 13 : isTablet ? 17 : 21 }
              ]}>
                {archive.name} (Manage Images)
              </Text>
            </Pressable>
          )}

          <Pressable
            style={[
              styles.categoryItem,
              { width: Math.max(categoryItemWidth, 120) }
            ]}
            onPress={() => router.push("/manage-categories")}
          >
            <View style={styles.categoryImageContainer}>
              <Svg
                width={isMobile ? 50 : isTablet ? 60 : 80}
                height={isMobile ? 50 : isTablet ? 60 : 80}
                viewBox="0 0 24 24"
                fill={Colors.primary}
                strokeWidth="1"
              >
                <Path d="M3 17v2h6v-2H3zM3 5v2h10V5H3zm10 16v-2h8v-2h-8v-2h-2v6h2zM7 9v2H3v2h4v2h2V9H7zm14 4v-2H11v2h10zm-6-4h2V7h4V5h-4V3h-2v6z" />
              </Svg>
            </View>
            <Text style={[
              styles.categoryTitle,
              { fontSize: isMobile ? 13 : isTablet ? 17 : 21 }
            ]}>
              Manage Categories
            </Text>
          </Pressable>
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
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
  },
  logo: {
    fontWeight: "800",
    color: Colors.primary,
    flex: 1,
    flexShrink: 1,
  },
  headerBtns: {
    flexDirection: "row",
    gap: 6,
    flexShrink: 0,
  },
  headerButton: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 6,
    backgroundColor: Colors.primary,
    elevation: 2,
  },
  headerButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {},

  title: {
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: 0.5,
    textShadowColor: "rgba(196, 144, 89, 0.15)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  jewelleryCategories: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
  },
  categoryItem: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    overflow: "hidden",
    margin: 6,
  },
  categoryImageContainer: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: Colors.secondary,
    alignItems: "center",
    justifyContent: "center",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryImageHovered: {
    opacity: 0.9,
  },
  categoryTitle: {
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
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
