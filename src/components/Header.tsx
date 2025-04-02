import React from "react";
import { View, Image, TouchableOpacity, StatusBar, StyleSheet, Platform } from "react-native";
import { useNavigation } from "@react-navigation/native";
import RemixIcon from "react-native-remix-icon"; // ✅ Import Remix Icons

const Header = () => {
  const navigation = useNavigation();

  return (
    <>
      {/* ✅ Status Bar with background matching header */}
      <StatusBar backgroundColor="#ffffff" barStyle="dark-content" />
      
      <View style={styles.headerContainer}>
        {/* ✅ Logo Instead of "Hello User" */}
        <Image 
          source={require("../logo_asset/krishimitra_header.png")} // Ensure this path is correct
          style={styles.logo}
        />

        {/* ✅ Chatbot Button */}
        {/* ✅ Chatbot Button */}
        <TouchableOpacity style={styles.chatbotButton} onPress={() => navigation.navigate("Chatbot")}>
          <RemixIcon name="ri-robot-2-fill" size={20} color="white" />
        </TouchableOpacity>

      </View>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,  // ✅ Reduced padding to bring the logo closer
    paddingTop: 15,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 20,
    zIndex: 100, // ✅ Ensures it stays on top of all screens
    borderBottomRightRadius: 20,
    elevation: 5,

    // ✅ iOS Shadow
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 5,
  },
  logo: {
    width: 220, // Adjust width as needed
    height: 60, // Adjust height as needed
    resizeMode: "contain",
  },
  chatbotButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#A3CB38",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 50,
    elevation: 2,
    borderWidth: 2,
    borderColor: "#84a52b",
  },
});

export default Header;
