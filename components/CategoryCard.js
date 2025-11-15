import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes } from "../constants/theme";

export default function CategoryCard({ category, width, onPress }) {
  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/category/${category.name.toLowerCase()}`);
    }
  };

  return (
    <Pressable
      style={[styles.categoryItem, { width: Math.max(width, 120) }]}
      onPress={handlePress}
    >
      <View style={styles.categoryImageContainer}>
        {category.icon ? (
          <Image
            source={{ uri: category.icon }}
            style={styles.categoryImage}
            resizeMode="cover"
          />
        ) : (
          <Svg width={60} height={60} viewBox="0 0 24 24" fill={Colors.primary}>
            <Path d="M10 3H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1zM9 9H5V5h4v4zm11 4h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1zm-1 6h-4v-4h4v4z" />
          </Svg>
        )}
      </View>
      <Text style={styles.categoryTitle}>{category.name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
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
  categoryTitle: {
    fontSize: FontSizes.medium,
    fontWeight: "700",
    color: Colors.white,
    textAlign: "center",
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
});
