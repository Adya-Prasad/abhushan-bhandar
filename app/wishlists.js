import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { Colors, FontSizes, Spacing } from "../constants/theme";

export default function WishlistsScreen() {
  return (
    <View style={styles.container}>
      <LinearGradient 
        colors={[Colors.white, Colors.primary]} 
        start={{ x: 0, y: 0 }} 
        end={{ x: 1, y: 1 }} 
        style={styles.gradient}
      >
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke={Colors.primary} strokeWidth="2">
              <Path d="M19 12H5M12 19l-7-7 7-7" />
            </Svg>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Orders</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.content}>
          <Svg width={80} height={80} viewBox="0 0 20 20" fill={Colors.primary}>
            <Path d="M18,20H2c-0.6,0-1.1-0.6-1-1.2l2-12C3.1,6.4,3.5,6,4,6h12c0.5,0,0.9,0.4,1,0.8l2,12C19.1,19.4,18.6,20,18,20z M3.2,18h13.6 L15.2,8H4.8L3.2,18z" />
            <Path d="M14,5h-2V4c0-1.1-0.9-2-2-2S8,2.9,8,4v1H6V4c0-2.2,1.8-4,4-4s4,1.8,4,4V5z" />
          </Svg>
          <Text style={styles.title}>Orders Management</Text>
          <Text style={styles.subtitle}>Coming Soon</Text>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  gradient: {
    flex: 1,
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
    padding: 5,
  },
  headerTitle: {
    fontSize: FontSizes.xlarge,
    fontWeight: "bold",
    color: Colors.primary,
  },
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: FontSizes.xxlarge,
    fontWeight: "bold",
    color: Colors.text,
    marginTop: Spacing.lg,
  },
  subtitle: {
    fontSize: FontSizes.large,
    color: Colors.textLight,
    marginTop: 8,
  },
});
