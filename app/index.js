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
  View
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
            fontSize: isMobile ? 17 : isTablet ? 28 : 35,
            marginBottom: isMobile ? 18 : 30,
          }
        ]}>
          Explore Elegant Jewelleries Collection
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
                  <Path d="M19,4H5A3,3,0,0,0,2,7V17a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V7A3,3,0,0,0,19,4ZM5,18a1,1,0,0,1-1-1V14.58l3.3-3.29a1,1,0,0,1,1.4,0L15.41,18Zm15-1a1,1,0,0,1-1,1h-.77l-3.81-3.83.88-.88a1,1,0,0,1,1.4,0L20,16.58Zm0-3.24-1.88-1.87a3.06,3.06,0,0,0-4.24,0l-.88.88L10.12,9.89a3.06,3.06,0,0,0-4.24,0L4,11.76V7A1,1,0,0,1,5,6H19a1,1,0,0,1,1,1Z"/>
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
                <Path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11 4h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-4v-4h4v4zM17 3c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2zM7 13c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4zm0 6c-1.103 0-2-.897-2-2s.897-2 2-2 2 .897 2 2-.897 2-2 2z"/>
              </Svg>
            </View>
            <Text style={[
              styles.categoryTitle,
              { fontSize: isMobile ? 13 : isTablet ? 17 : 21 }
            ]}>
              Manage Categories
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.categoryItem,
              { width: Math.max(categoryItemWidth, 120) }
            ]}
            onPress={() => router.push("/backup")}
          >
            <View style={styles.categoryImageContainer}>
              <Svg
                width={isMobile ? 50 : isTablet ? 60 : 80}
                height={isMobile ? 50 : isTablet ? 60 : 80}
                viewBox="0 0 24 24"
                fill={Colors.primary}
                strokeWidth="1"
              >
                <Path d="M8,5 L8,7 L5,7 L5,20 L19,20 L19,7 L16,7 L16,5 L19,5 C20.1046,5 21,5.89543 21,7 L21,20 C21,21.1046 20.1046,22 19,22 L5,22 C3.89543,22 3,21.1046 3,20 L3,7 C3,5.89543 3.89543,5 5,5 L8,5 Z M12,2 C12.5523,2 13,2.44772 13,3 L13,13.8284 L14.8284,12 C15.219,11.6094 15.8521,11.6094 16.2426,12 C16.6332,12.3905 16.6332,13.0237 16.2426,13.4142 L12.8839,16.7729 C12.3957,17.2611 11.6043,17.2611 11.1161,16.7729 L7.75736,13.4142 C7.36684,13.0237 7.36684,12.3905 7.75736,12 C8.14788,11.6094 8.78105,11.6094 9.17157,12 L11,13.8284 L11,3 C11,2.44772 11.4477,2 12,2 Z"/>
              </Svg>
            </View>
            <Text style={[
              styles.categoryTitle,
              { fontSize: isMobile ? 13 : isTablet ? 17 : 21 }
            ]}>
              Backup & Restore
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
