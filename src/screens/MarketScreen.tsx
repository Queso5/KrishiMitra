import React, { useEffect, useState, useRef } from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Text,
  Alert,
  Linking,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import MapView, { Marker } from "react-native-maps";
import MapViewCluster from "react-native-map-clustering";
import RemixIcon from "react-native-remix-icon"; // ✅ Updated to Remix Icons
import { collection, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import * as Location from "expo-location";
import MapViewDirections from "react-native-maps-directions";
import Header from "../components/Header";

// ✅ Category Icons
const categoryIcons: Record<string, any> = {
  fruits: require("../logo_asset/fruits.png"),
  vegetables: require("../logo_asset/vegetables.png"),
  grains: require("../logo_asset/grains.png"),
  cashcrops: require("../logo_asset/cashcrops.png"),
  "fertilizers and seeds": require("../logo_asset/fertilizers_seeds.png"), // Handle spaces
  "soil testing labs": require("../logo_asset/soil_lab.png"), // Handle spaces
};

// ✅ Shop Data Type
type Shop = {
  id: string;
  name: string;
  contact: string;
  latitude: number;
  longitude: number;
  category: keyof typeof categoryIcons;
  city: string;
  state: string;
};

const MarketScreen = () => {
  const navigation = useNavigation();
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [selectedShop, setSelectedShop] = useState<Shop | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState<{ latitude: number; longitude: number }[]>([]);
  const [zoomLevel, setZoomLevel] = useState(10); // Default zoom level (Adjust as needed)



  const mapRef = useRef<MapView | null>(null);

  // ✅ Fetch city & state using coordinates
  const fetchLocationFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyDBjUQfE7i0TG8BNFksnCMyGwsAqLET_-A`
      );
      const data = await response.json();
      if (data.results.length > 0) {
        const addressComponents = data.results[0].address_components;
        const cityComponent = addressComponents.find((comp: any) =>
          comp.types.includes("locality")
        );
        const stateComponent = addressComponents.find((comp: any) =>
          comp.types.includes("administrative_area_level_1")
        );
        return {
          city: cityComponent ? cityComponent.long_name : "Unknown City",
          state: stateComponent ? stateComponent.long_name : "Unknown State",
        };
      }
    } catch (error) {
      console.error("Error fetching location details:", error);
    }
    return { city: "Unknown City", state: "Unknown State" };
  };

  // ✅ Fetch shops from Firestore
  const fetchShops = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "shops"));
      const shopList = await Promise.all(
        querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          const latitude = parseFloat(data.Latitude);
          const longitude = parseFloat(data.Longitude);

          // Fetch city & state using reverse geocoding
          const { city, state } = await fetchLocationFromCoordinates(latitude, longitude);

          return {
            id: doc.id,
            name: data["Name of Shop"],
            contact: data.Contact,
            latitude,
            longitude,
            category: data.Category.toLowerCase(),
            city,
            state,
          };
        })
      );

      setShops(shopList);
    } catch (error) {
      console.error("Error fetching shops:", error);
    }
  };

  // ✅ Get user location
  useEffect(() => {
    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission Denied", "Please enable location permissions in settings.");
          return;
        }
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      } catch (error) {
        console.error("Error getting location:", error);
      }
    };

    getLocation();
    fetchShops();
  }, []);

  // ✅ Filter shops by selected category
  const filteredShops = selectedCategory ? shops.filter((shop) => shop.category === selectedCategory) : shops;

  // ✅ Handle marker click (show modal)
  const handleMarkerPress = (shop: Shop) => {
    setSelectedShop(shop);
    setModalVisible(true);
  };

  // ✅ Handle Contact Button
  const handleContact = () => {
    if (selectedShop) {
      Linking.openURL(`tel:${selectedShop.contact}`);
    }
  };

  // ✅ Handle Direction Button (Google Maps Navigation)
  const handleDirections = () => {
    if (!userLocation) {
      Alert.alert("Location Error", "Your location is not available.");
      return;
    }
  
    if (!selectedShop) {
      Alert.alert("Shop Selection Error", "Please select a shop to navigate.");
      return;
    }
  
    setRouteCoordinates([
      { latitude: userLocation.latitude, longitude: userLocation.longitude },
      { latitude: selectedShop.latitude, longitude: selectedShop.longitude },
    ]);
  
    setModalVisible(false); // ✅ Auto-close modal after setting route
    console.log("Route set:", routeCoordinates);
  };
  

  const handleResetRoute = () => {
    setRouteCoordinates([]); // ✅ Clears route when button is pressed
  };

  // ✅ Handle Zoom In
const handleZoomIn = () => {
  if (mapRef.current) {
    mapRef.current.animateCamera({ zoom: zoomLevel + 1 }, { duration: 300 });
    setZoomLevel(zoomLevel + 1);
  }
};

// ✅ Handle Zoom Out
const handleZoomOut = () => {
  if (mapRef.current) {
    mapRef.current.animateCamera({ zoom: zoomLevel - 1 }, { duration: 300 });
    setZoomLevel(zoomLevel - 1);
  }
};

// ✅ Open Directions in Google Maps
const handleOpenGoogleMaps = () => {
  const destination = `${routeCoordinates[1].latitude},${routeCoordinates[1].longitude}`;
  const url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
  Linking.openURL(url);
};

  

  return (
    <View style={{ flex: 1 }}>
      <Header />

      {/* ✅ Category Selection Buttons */}
      <View style={styles.categoryContainer}>
        {Object.keys(categoryIcons).map((category) => (
          <TouchableOpacity
            key={category}
            style={[styles.categoryButton, selectedCategory === category && styles.selectedCategory]}
            onPress={() => setSelectedCategory(category)}
          >
            <Image source={categoryIcons[category as keyof typeof categoryIcons]} style={styles.categoryIcon} />
          </TouchableOpacity>
        ))}
      </View>


      {/* ✅ Map View */}
      <MapViewCluster
        ref={mapRef}
        provider={"google"}
        style={styles.map}
        initialRegion={{
          latitude: userLocation?.latitude || 18.5285,
          longitude: userLocation?.longitude || 73.8744,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        clusterColor="#A3CB38"
        clusterTextColor="white"
      >
        {/* ✅ Shop Markers with Correct Category Icons */}
        {filteredShops.map((shop) => (
          <Marker
            key={shop.id}
            coordinate={{ latitude: shop.latitude, longitude: shop.longitude }}
            title={shop.name}
            description={`📞 ${shop.contact}`}
            onPress={() => handleMarkerPress(shop)}
          >
            <Image source={categoryIcons[shop.category] || categoryIcons["fruits"]} style={styles.markerIcon} />
          </Marker>
        ))}

        {/* ✅ User's Current Location */}
        {userLocation && (
          <Marker coordinate={userLocation} title="Your Location">
            <Image
              source={require("../logo_asset/current_location.png")} // ✅ Add a red location marker image
              style={styles.currentLocationIcon}
            />
          </Marker>
        )}

        {/* ✅ Route Line */}
        {routeCoordinates.length > 0 && (
          <MapViewDirections
            origin={routeCoordinates[0]}
            destination={routeCoordinates[1]}
            apikey={"AIzaSyCVxIzAN5r7IP9-2YPQfvlAlvi7YByy0tg"}
            strokeWidth={4}
            strokeColor="#c9302c"
          />
        )}
      </MapViewCluster>

      {routeCoordinates.length > 0 && (
        <TouchableOpacity style={styles.resetButton} onPress={handleResetRoute}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      )}

      {/* ✅ Zoom In/Out Buttons */}
      <View style={styles.mapControls}>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomIn}>
          <RemixIcon name="add-line" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.zoomButton} onPress={handleZoomOut}>
          <RemixIcon name="subtract-line" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>

      {/* ✅ Open in Google Maps (Only Show When Route Exists) */}
      {routeCoordinates.length > 0 && (
        <TouchableOpacity style={styles.openGoogleMapsButton} onPress={handleOpenGoogleMaps}>
          <RemixIcon name="ri-map-2-line" size={24} color="#FFF" />
          <Text style={styles.googleMapsText}>Google Maps</Text>
        </TouchableOpacity>
      )}

      {/* ✅ Reset Route Button */}
      {routeCoordinates.length > 0 && (
        <TouchableOpacity style={styles.resetButton} onPress={handleResetRoute}>
          <Text style={styles.resetButtonText}>Reset</Text>
        </TouchableOpacity>
      )}


      {/* ✅ Modal for Shop Details */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>

            {/* ✅ Close Button */}
            <TouchableOpacity style={styles.closeButton} onPress={() => setModalVisible(false)}>
              <RemixIcon name="close-line" size={22} color="#fff" />
            </TouchableOpacity>

            {/* ✅ Shop Image */}
            <Image source={require("../logo_asset/shop.jpg")} style={styles.shopImage} />

            {/* ✅ Shop Name & Category */}
            <Text style={styles.shopName}>{selectedShop?.name}</Text>
            <Text style={styles.shopCategory}>{selectedShop?.category.toUpperCase()}</Text>

            {/* ✅ Contact Number */}
            <View style={styles.infoRow}>
              <RemixIcon name="phone-fill" size={22} color="#2B5E18" />
              <Text style={styles.contactText}>{selectedShop?.contact}</Text>
              <TouchableOpacity style={styles.iconButton} onPress={handleContact}>
                <RemixIcon name="phone-fill" size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* ✅ Location (City & State) */}
            <View style={styles.infoRow}>
              <RemixIcon name="map-pin-2-fill" size={22} color="#2B5E18" />
              <Text style={styles.locationText}>{selectedShop?.city}, {selectedShop?.state}</Text>
              <TouchableOpacity style={styles.iconButton} onPress={handleDirections}>
                <RemixIcon name="map-pin-fill" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};


const styles = StyleSheet.create({
  map: {
    flex: 1,
  },

  // ✅ Map Markers (Category-Specific)
  markerIcon: {
    width: 35, // Increased size for better visibility
    height: 35,
    resizeMode: "contain",
  },

  currentLocationIcon: {
    width: 35,  // ✅ Bigger for visibility
    height: 35,
    resizeMode: "contain",
  },
  

  // ✅ Category Selection Bar
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "transparent",
    marginVertical: 5,
    marginHorizontal: 5,
  },
  categoryButton: {
    alignItems: "center",
    padding: 10,
    borderRadius: 10,
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
    resizeMode: "contain",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2B5E18",
    marginTop: 4,
  },

  // ✅ Reset Route Button
  resetButton: {
    position: "absolute",
    top: 200,
    right: 20,
    alignSelf: "center",
    backgroundColor: "#c9302c",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    elevation: 3,
  },
  resetButtonText: {
    color: "white",
    fontWeight: "bold",
  },

  // ✅ Modal Styling
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // ✅ Dark transparent background
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
    width: "85%",
    elevation: 5,
    borderWidth: 4,
    borderColor: "#E8F5E9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },

  // ✅ Close Button Styling
  closeButton: {
    position: "absolute",
    top: 15,
    right: 15,
    backgroundColor: "#c9302c",
    padding: 5,
    borderRadius: 20,
    zIndex: 1,
  },

  // ✅ Shop Image (Made Bigger)
  shopImage: {
    width: 220, // Increased size
    height: 160,
    borderRadius: 15,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },

  // ✅ Shop Details Styling
  shopName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2B5E18",
    textAlign: "center",
    marginBottom: 5,
  },
  shopCategory: {
    fontSize: 16,
    fontWeight: "600",
    color: "#060606",
    marginBottom: 10,
    textAlign: "center",
  },

  // ✅ Contact & Location Styling
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "90%",
    paddingVertical: 8,
  },
  contactText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginLeft: 10,
    flex: 1,
  },
  locationText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#444",
    marginLeft: 10,
    flex: 1,
  },

  // ✅ Action Buttons (Call & Directions)
  iconButton: {
    backgroundColor: "#A3CB38",
    padding: 10,
    marginLeft: 10,
    borderRadius: 6,
    elevation: 3,
  },

  // ✅ Zoom Controls (Bottom Right)
  mapControls: {
    position: "absolute",
    bottom: 100,
    right: 15,
    flexDirection: "column",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderRadius: 10,
    padding: 5,
    elevation: 5,
  },
  zoomButton: {
    width: 45,
    height: 45,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#A3CB38",
    borderRadius: 5,
    margin: 5,
    borderWidth: 2,
    borderColor: "#84a52b",
  },

  // ✅ Google Maps Button (Bottom Center)
  openGoogleMapsButton: {
    position: "absolute",
    top: 250,
    right: -80,
    transform: [{ translateX: -100 }],
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#c9302c",
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    elevation: 4,
  },
  googleMapsText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },

});


export default MarketScreen;
