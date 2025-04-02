import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import RemixIcon from "react-native-remix-icon";
import { useNavigation } from "@react-navigation/native";


// ✅ Category Icons
const categoryIcons = {
  fruits: require("../logo_asset/fruits.png"),
  vegetables: require("../logo_asset/vegetables.png"),
  grains: require("../logo_asset/grains.png"),
  cashcrops: require("../logo_asset/cashcrops.png"),
  fertilizers_and_seeds: require("../logo_asset/fertilizers_seeds.png"),
};

const BuyScreen = () => {
  const navigation = useNavigation();
  const [listings, setListings] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchListings();
  }, []);

  
  // ✅ Fetch Listings from Firestore
  const fetchListings = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "listings"));
      const listingsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setListings(listingsData);
      setFilteredData(listingsData);
    } catch (error) {
      console.error("Error fetching listings:", error);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle Category Change
  const handleCategoryChange = (category) => {
      if (selectedCategory === category) {
          // ✅ Deselect Category if the same icon is clicked
          setSelectedCategory("all");
          setFilteredData(listings);
      } else {
          // ✅ Select New Category and Filter Data
          setSelectedCategory(category);
          setFilteredData(listings.filter((item) => item.category === category));
      }
  };


  return (
    <View style={styles.container}>

    <View style={styles.headerContainer}>
      {/* ✅ Back Button */}
      <TouchableOpacity 
        style={styles.backButton} 
        onPress={() => navigation.goBack()}
      >
        <RemixIcon name="ri-arrow-left-line" size={30} color="#2B5E18" />
      </TouchableOpacity>

      {/* ✅ Centered Logo */}
      <Image 
        source={require("../logo_asset/krishimitra_cb.png")} 
        style={styles.logo} 
      />
      
      {/* ✅ Chatbot Button */}
      <TouchableOpacity 
        style={styles.chatbotButton} 
        onPress={() => navigation.navigate("Chatbot")}
      >
        <RemixIcon name="ri-robot-2-fill" size={20} color="white" />
      </TouchableOpacity>
    </View>



      <View>

        {/* ✅ Category Selection Bar */}
        <View style={styles.categoryContainer}>
          {Object.keys(categoryIcons).map((category) => (
            <TouchableOpacity
              key={category}
              style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
              onPress={() => handleCategoryChange(category)}
            >
              <Image source={categoryIcons[category]} style={styles.categoryIcon} />
            </TouchableOpacity>
          ))}
        </View>

        {/* ✅ Listings */}
        {loading ? (
          <ActivityIndicator size="large" color="#A3CB38" />
        ) : filteredData.length === 0 ? (
          <Text style={styles.noListings}>No products available in this category.</Text>
        ) : (
          <FlatList
            data={filteredData}
            keyExtractor={(item) => item.id}
            numColumns={2} // ✅ Show in Grid Format
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.listingCard}>
                <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
                <Text style={styles.listingTitle}>{item.cropName}</Text>
                <Text style={styles.listingSubtitle}>{item.variety} - {item.category}</Text>
                <Text style={styles.listingPrice}>₹{item.price} per {item.unit}</Text>

                {/* ✅ Buy Button */}
                <TouchableOpacity
                  style={styles.buyButton}
                  onPress={() => alert("Your Order is placed.....")}
                >
                  <RemixIcon name="shopping-cart-2-fill" size={18} color="#fff" />
                  <Text style={styles.buyText}>Buy Now</Text>
                </TouchableOpacity>

              </View>
            )}
          />
        )}
      </View>
    </View>
  );
};

// ✅ Styles
const styles = StyleSheet.create({

  //header
  // ✅ Header Container with Logo and Chatbot Button
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
  },

  backButton: {
    zIndex: 1,
  },

  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5",
    paddingBottom: 200, // ✅ Added padding to prevent overlap with the bottom navigation
  },

  // ✅ KrishiMitra Logo Styling
  logo: {
    width: 180, // Adjust width as needed
    height: 60, // Adjust height as needed
    resizeMode: "contain",
  },

  // ✅ Chatbot Button Styling (Already Provided)
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

  
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "transparent",
    borderRadius: 10,
    margin: 10,
  },
  
  categoryButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    backgroundColor: "#ffffff",
    elevation: 3,
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  
  selectedCategory: {
    backgroundColor: "#E8F5E9",
    borderWidth: 2,
    borderColor: "#2B5E18",
  },
  
  categoryIcon: { 
    width: 35, 
    height: 35, 
    resizeMode: "contain" 
  },
  
  listContainer: { 
    paddingHorizontal: 10 
  },
  
  listingCard: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    margin: 8,
    elevation: 3,
    alignItems: "center",
  },
  
  listingImage: {
    width: 100, 
    height: 100, 
    borderRadius: 10, 
    resizeMode: "cover" 
  },
  
  listingTitle: { 
    fontSize: 16, 
    fontWeight: "bold", 
    color: "#333", 
    textAlign: "center" 
  },
  
  listingSubtitle: { 
    fontSize: 14, 
    color: "#666", 
    textAlign: "center", 
    marginTop: 2 },
  
  listingPrice: { 
    fontSize: 15, 
    fontWeight: "bold", 
    color: "#A3CB38", 
    marginTop: 2 },
  
  buyButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2B5E18",
    padding: 8,
    borderRadius: 5,
    marginTop: 10,
    justifyContent: "center",
  },
  
  buyText: { 
    color: "#fff", 
    fontSize: 14, 
    fontWeight: "bold", 
    marginLeft: 5 
  },
  
  noListings: { 
    fontSize: 16, 
    color: "#777", 
    textAlign: "center", 
    marginTop: 20 
  },
});

export default BuyScreen;
