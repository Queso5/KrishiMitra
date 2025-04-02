import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet, Dimensions } from "react-native";

const { width } = Dimensions.get("window");

const CommunityMarquee = () => {
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(scrollX, {
        toValue: -width, // Moves across the screen smoothly
        duration: 7000,  // Speed of scrolling
        useNativeDriver: true, // Better performance
      })
    ).start();
  }, []);

  return (
    <View style={styles.marqueeContainer}>
      <Animated.View style={{ flexDirection: "row", transform: [{ translateX: scrollX }] }}>
        <Text style={styles.marqueeText}>
          🚀 Join communities, share knowledge and grow together! 🌱 {"  "}
        </Text>
        <Text style={styles.marqueeText}>
          🚀 Join communities, share knowledge and grow together! 🌱 {"  "}
        </Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  marqueeContainer: {
    backgroundColor: "#2B5E18", // Dark Green Background
    paddingVertical: 12, // Adjusted padding for better spacing
    overflow: "hidden",
    marginTop: 8,
  },
  marqueeText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    paddingHorizontal: 10,
    letterSpacing: 0.8, // Adds slight spacing for readability
    textAlign: "center",
  },
});

export default CommunityMarquee;
