import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { StackNavigationProp } from "@react-navigation/stack";
import { useLayoutEffect, useState, useEffect } from "react";
import * as ImagePicker from "expo-image-picker";
import { collection, addDoc, getDocs, query, where, deleteDoc, doc } from "firebase/firestore";
import Header from "../components/Header";
import { auth, db } from "../config/firebase";
import { Picker } from "@react-native-picker/picker";  // ✅ Import Picker
import RemixIcon from "react-native-remix-icon"; // ✅ Import Remix Icons
import CommunityMarquee from "../screens/CommunityMarquee"; // ✅ Import the Marquee



type RootStackParamList = {
  BuyScreen: undefined;
};

// ✅ Preset Categories
const presetCategories = [
  { label: "Fruits", value: "fruits" },
  { label: "Vegetables", value: "vegetables" },
  { label: "Grains", value: "grains" },
  { label: "Cashcrops", value: "cashcrops" },
  { label: "Fertilizers & Seeds", value: "fertilizers and seeds" },
  { label: "Soil Testing Labs", value: "soil testing labs" },
];


type SellScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// ✅ Define Type for Listings
interface Listing {
  id?: string; // ✅ Corrected to optional string
  images: string[];
  cropName: string;
  variety: string;
  category: string;
  quantity: string;
  price: string;
  unit: string;
  harvestMonth: string;
  region: string;
  contact: string;
}


const SellScreen = () => {
  const navigation = useNavigation<SellScreenNavigationProp>();
  const [showForm, setShowForm] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [showListings, setShowListings] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0); // Track active slide
  const [formData, setFormData] = useState<Listing>({
    images: [],
    cropName: "",
    variety: "",
    category: "",
    quantity: "",
    price: "",
    unit: "kg", 
    harvestMonth: "",
    region: "",
    contact: "",
  });

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          style={styles.chatbotButton}
          onPress={() => navigation.navigate("Chatbot")}
        >
          <RemixIcon name="chatbubble-ellipses-outline" size={24} color="#FFFFFF" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    fetchUserListings();
  }, []);

  const fetchUserListings = async () => {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);
      try {
          const querySnapshot = await getDocs(query(collection(db, "listings"), where("userId", "==", user.uid)));
          
          const listingsData: Listing[] = querySnapshot.docs.map((doc) => ({
              id: doc.id,
              ...(doc.data() as Omit<Listing, 'id'>), // ✅ Cast Firestore data to Listing type excluding id
          }));

          setListings(listingsData);
      } catch (error) {
          console.error("Error fetching listings:", error);
      } finally {
          setLoading(false);
      }
  };

  const handleDeleteListing = async (item) => {
      if (!item) {
          console.error("Error: item is undefined!");
          Alert.alert("Error", "Invalid listing. Please try again.");
          return;
      }

      Alert.alert(
          "Delete Listing",
          "Are you sure you want to delete this listing?",
          [
              { text: "Cancel", style: "cancel" },
              {
                  text: "Delete",
                  style: "destructive",
                  onPress: async () => {
                      console.log("Deleting listing:", item);

                      try {
                          const listingRef = doc(db, "listings", item.id);
                          await deleteDoc(listingRef);
                          Alert.alert("Success", "Listing deleted successfully!");

                          setListings((prev) => prev.filter((listing) => listing.id !== item.id));
                      } catch (error) {
                          console.error("Error deleting listing:", error);
                          Alert.alert("Error", "Failed to delete listing.");
                      }
                  }
              }
          ],
          { cancelable: true }
      );
  };


  
  
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...result.assets.map((asset) => asset.uri)],
      }));
    }
  };

  const handleAddListing = async () => {
    const user = auth.currentUser;
    if (!user) {
      Alert.alert("Error", "You need to be logged in to add a listing.");
      return;
    }
  
    // ✅ Validate that required fields are filled
    if (
      !formData.cropName.trim() ||
      !formData.variety.trim() ||
      !formData.category.trim() || // This now picks from preset options
      !formData.quantity.trim() ||
      !formData.price.trim() ||
      !formData.unit.trim() ||
      !formData.harvestMonth.trim() ||
      !formData.region.trim() ||
      !formData.contact.trim()
    ) {
      Alert.alert("Error", "Please fill in all required fields before adding a listing.");
      return;
    }

  
    try {
      await addDoc(collection(db, "listings"), {
        ...formData,
        userId: user.uid,
        createdAt: new Date(),
      });
  
      Alert.alert("Success", "Listing added successfully!");
      setFormData({
        images: [],
        cropName: "",
        variety: "",
        category: "",
        quantity: "",
        price: "",
        unit: "kg",
        harvestMonth: "",
        region: "",
        contact: "",
      });
  
      fetchUserListings(); // Refresh Listings
      setShowForm(false);
    } catch (error) {
      console.error("Error adding listing:", error);
      Alert.alert("Error", "Failed to add listing.");
    }
  };

    return (
      <View style={{ flex: 1 }}>
        <Header />

        {/* ✅ Marquee Component */}
        <CommunityMarquee />
        
        <ScrollView contentContainerStyle={styles.container}>

        <View style={styles.categoryContainer}>
          {/* ✅ First Row (2 Categories) */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.categoryButton} onPress={() => navigation.navigate("BuyScreen")}>
              <Image source={require("../logo_asset/fruits.png")} style={styles.categoryImage} />
              <Text style={styles.categoryText}>Fruits</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryButton} onPress={() => navigation.navigate("BuyScreen")}>
              <Image source={require("../logo_asset/vegetables.png")} style={styles.categoryImage} />
              <Text style={styles.categoryText}>Vegetables</Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Second Row (2 Categories) */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.categoryButton} onPress={() => navigation.navigate("BuyScreen")}>
              <Image source={require("../logo_asset/grains.png")} style={styles.categoryImage} />
              <Text style={styles.categoryText}>Grains</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.categoryButton} onPress={() => navigation.navigate("BuyScreen")}>
              <Image source={require("../logo_asset/cashcrops.png")} style={styles.categoryImage} />
              <Text style={styles.categoryText}>Cashcrops</Text>
            </TouchableOpacity>
          </View>

          {/* ✅ Third Row (2 Categories) */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.categoryButton} onPress={() => navigation.navigate("BuyScreen")}>
              <Image source={require("../logo_asset/fertilizers_seeds.png")} style={styles.categoryImage} />
              <Text style={styles.categoryText}>Fertilizers & Seeds</Text>
            </TouchableOpacity>
          </View>

        </View>


          {/* ✅ Add Listings Section */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowForm(!showForm)}>
            <RemixIcon name="ri-add-box-line" size={22} color="#000" />
            <Text style={styles.sectionTitle}> Add Listings</Text>
          </TouchableOpacity>

          {showForm && (
            <View style={styles.formContainer}>
              <TouchableOpacity style={styles.imageUpload} onPress={pickImage}>
                <RemixIcon name="ri-image-add-fill" size={22} color="#000" />
                <Text style={styles.uploadText}> Upload Images</Text>
              </TouchableOpacity>
              <ScrollView horizontal>
                {formData.images.map((img, index) => (
                  <Image key={index} source={{ uri: img }} style={styles.imagePreview} />
                ))}
              </ScrollView>

              {/* ✅ Form Inputs */}
              <TextInput style={styles.input} placeholder="Crop Name" value={formData.cropName} onChangeText={(text) => setFormData({ ...formData, cropName: text })} />
              <TextInput style={styles.input} placeholder="Variety" value={formData.variety} onChangeText={(text) => setFormData({ ...formData, variety: text })} />
              
              {/* ✅ Replace Category Input with Picker */}
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={formData.category}
                  onValueChange={(itemValue) =>
                    setFormData({ ...formData, category: itemValue })
                  }
                  style={styles.categoryPicker}
                >
                  <Picker.Item label="Select Category" value="" />
                  {presetCategories.map((category) => (
                    <Picker.Item
                      key={category.value}
                      label={category.label}
                      value={category.value}
                    />
                  ))}
                </Picker>
              </View>



              <View style={styles.priceInputContainer}>
                <Text style={styles.rupeeSymbol}>₹</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Price Per Unit"
                  keyboardType="numeric"
                  value={formData.price}
                  onChangeText={(text) =>
                    setFormData({ ...formData, price: text.replace(/[^0-9]/g, "") })
                  }
                />
              </View>

              {/* ✅ Quantity & Unit Picker */}
              <View style={styles.quantityContainer}>
                <TextInput 
                  style={styles.quantityInput} 
                  placeholder="Quantity" 
                  keyboardType="numeric" 
                  value={formData.quantity} 
                  onChangeText={(text) => setFormData({ ...formData, quantity: text.replace(/[^0-9.]/g, "") })} 
                />
                <View style={styles.unitPickerContainer}>
                <Picker
                  selectedValue={formData.unit}
                  style={styles.unitPicker}
                  onValueChange={(itemValue) => setFormData({ ...formData, unit: itemValue })}
                >
                  <Picker.Item label="kg" value="kg" />
                  <Picker.Item label="gram" value="gram" />
                  <Picker.Item label="tonne" value="tonne" />
                  <Picker.Item label="quintal" value="quintal" />
                  <Picker.Item label="litre" value="litre" />
                  <Picker.Item label="millilitre" value="millilitre" />
                </Picker>
                </View>
              </View>

              <TextInput style={styles.input} placeholder="Harvest Month" value={formData.harvestMonth} onChangeText={(text) => setFormData({ ...formData, harvestMonth: text })} />
              <TextInput style={styles.input} placeholder="Region" value={formData.region} onChangeText={(text) => setFormData({ ...formData, region: text })} />
              <TextInput style={styles.input} placeholder="Contact Details" keyboardType="phone-pad" value={formData.contact} onChangeText={(text) => setFormData({ ...formData, contact: text.replace(/[^0-9]/g, "") })} />

              <TouchableOpacity style={styles.submitButton} onPress={handleAddListing}>
                <Text style={styles.submitText}>Add Listing</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* ✅ My Listings Section (Toggleable) */}
          <TouchableOpacity style={styles.sectionHeader} onPress={() => setShowListings(!showListings)}>
            <RemixIcon name="ri-list-check" size={22} color="#000" />
            <Text style={styles.sectionTitle}> My Listings</Text>
          </TouchableOpacity>

          {/* ✅ Listings Display */}
          {showListings && (
          <View style={styles.listingsContainer}>
              {loading ? (
                  <ActivityIndicator size="large" color="#A3CB38" />
              ) : listings.length === 0 ? (
                  <Text style={styles.noListings}>No listings added yet.</Text>
              ) : (
                  listings.map((item) => (
                      <View key={item.id} style={styles.listingCard}>
                          <Image source={{ uri: item.images[0] }} style={styles.listingImage} />
                          <View style={styles.listingDetails}>
                              <Text style={styles.listingTitle}>{item.cropName}</Text>
                              <Text style={styles.listingSubtitle}>{item.variety} • {item.category}</Text>
                              <Text style={styles.listingPrice}>₹{item.price} per {item.unit}</Text>
                              <Text style={styles.listingText}>Quantity : {item.quantity} {item.unit}</Text>
                              <Text style={styles.listingText}>Harvest Month : {item.harvestMonth}</Text>
                              <Text style={styles.listingText}>Region : {item.region}</Text>
                          </View>

                          {/* ✅ Delete Button */}
                          <TouchableOpacity style={styles.deleteButton} onPress={() => handleDeleteListing(item)}>
                              <RemixIcon name="ri-delete-bin-6-line" size={24} color="#c9302c" />
                          </TouchableOpacity>
                      </View>
                  ))
              )}


            </View>
          )}

        </ScrollView>


      </View>
      
      
    );
  };

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    padding: 20,
    paddingBottom: 120,
  },

  // ✅ Section Headers for "Add Listings" & "My Listings"
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    padding: 12,
    backgroundColor: "#ffffff",
    borderWidth: 2,
    borderColor: "#A3CB38",
    borderRadius: 5,
    marginVertical: 8, // More spacing below Add Listings
  },

  sectionTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },

  // ✅ Form Styling
  formContainer: {
    width: "100%",
    padding: 10,
  },
  input: {
    borderWidth: 1.5,
    borderColor: "#A3CB38",
    padding: 8,
    marginVertical: 5,
    borderRadius: 5,
    width: "100%",
    height:40,
  },
  submitButton: {
    backgroundColor: "#A3CB38",
    padding: 10,
    marginTop: 5,
    borderRadius: 5,
    alignItems: "center",
  },
  submitText: {
    color: "#fff",
    fontWeight: "bold",
  },

  // ✅ Add styles for Category Picker
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: "#A3CB38",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    height: 40, 
    overflow: "hidden",
  },
  categoryPicker: {
    width: "100%",
      height: 100, // ✅ Matches container height
      fontSize: 14, // ✅ Makes text inside picker more readable
      textAlign: "center", // ✅ Centers text in some devices
      textAlignVertical: "center", // ✅ Ensures vertical centering in Android
  },


  // ✅ Image Upload Section
  imageUpload: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
    padding: 10,
    borderRadius: 5,
    justifyContent: "center",
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: "#ccc",
  },
  uploadText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 5,
  },
  imagePreview: {
    width: 80,
    height: 80,
    margin: 5,
    borderRadius: 10,
  },

  // ✅ Adjustments for "My Listings" Section
  listingsLabel: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    marginBottom: 5, // Ensure spacing below label
  },
  
  listingsContainer: {
    width: "100%",
  },

  noListings: {
    fontSize: 16,
    color: "#777",
    textAlign: "center",
    marginTop: 10,
  },

  // ✅ Product Card Styling (For My Listings)
  listingCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 10,
    marginVertical: 6,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 1, height: 2 },
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "flex-start",
    position: "relative", // ✅ Enable absolute positioning
  },

  listingImage: {
    width: 85,
    height: 85,
    borderRadius: 5,
    backgroundColor: "#EEE",
    resizeMode: "cover",
  },

  listingDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },

  listingTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2B5E18",
  },

  listingSubtitle: {
    fontSize: 15,
    color: "#555",
    marginVertical: 2,
  },

  listingPrice: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#A3CB38",
  },

  listingText: {
    fontSize: 14,
    color: "#666",
  },

  // ✅ Delete Button Styling
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    padding: 5,
    backgroundColor: "#fdecea",
    borderRadius: 5,
  },

  

  // ✅ Chatbot Button on Header
  chatbotButton: {
    marginRight: 15,
    backgroundColor: "#A3CB38",
    width: 45,
    height: 45,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 2, height: 2 },
  },

  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  quantityInput: {
      flex: 1.2,
      borderWidth: 1.5,
      borderColor: "#A3CB38",
      padding: 8,
      marginVertical: 5,
      borderRadius: 5,
      fontSize: 14, // ✅ Ensures text is readable
      height: 40, 
  },
  unitPickerContainer: {
      flex: 1,
      borderWidth: 1.5,
      borderColor: "#A3CB38",
      borderRadius: 5,
      marginLeft: 5,
      justifyContent: "center",
      alignItems: "center",
      height: 40, 
      overflow: "hidden", // ✅ Ensures text inside is clipped properly
      
  },
  unitPicker: {
      width: "100%",
      height: 100, // ✅ Matches container height
      fontSize: 14, // ✅ Makes text inside picker more readable
      textAlign: "center", // ✅ Centers text in some devices
      textAlignVertical: "center", // ✅ Ensures vertical centering in Android
      color: "#060606",
  },
  priceInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#A3CB38",
    borderRadius: 5,
    marginVertical: 5,
    paddingHorizontal: 10,
    height: 40,
  },
  rupeeSymbol: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginRight: 10,
    
  },
  priceInput: {
    flex: 1,
    fontSize: 14,
    height: 100,
  },

  //carousel
  bannerImage: {
    width: "94%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    justifyContent: "center",
    alignSelf: "center",
  },
  pagination: {
    flexDirection: "row",
    marginTop: 10,
    alignSelf: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#2B5E18",

  },
  

  //category
  categoryContainer: {
    alignItems: "center", // Center-align the entire section
    marginTop: 5,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 10,
    marginTop: 5,
  },
  categoryButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: "#FFF",
    elevation: 4,
    marginHorizontal: 10,
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  categoryImage: {
    width: 60, // ✅ Increased icon size for prominence
    height: 60,
    resizeMode: "contain",
  },
  categoryText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#2B5E18",
    marginTop: 5,
    textAlign: "center",
  },

    
});

export default SellScreen;
