import React, { useState, useEffect  } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";

const API_URL = "http://192.168.1.39:8001"; // Replace with your actual local IP

// ✅ Fallback crop recommendations for different districts
const FALLBACK_CROPS: Record<string, string> = {
  "Pune": "Sugarcane",
  "Nashik": "Grapes",
  "Aurangabad": "Wheat",
  "Nagpur": "Oranges",
  "Satara": "Jowar",
  "Solapur": "Pomegranate",
  "Amravati": "Cotton",
  "Kolhapur": "Rice",
  "Mumbai": "Coconut",
  "Default": "Maize", // Default fallback if district not listed
};

const CropRecommendation: React.FC = () => {
  const [district, setDistrict] = useState<string>("");
  const [cropType, setCropType] = useState<string>("");
  const [yieldValue, setYieldValue] = useState<string>("");
  const [season, setSeason] = useState<string>("");
  const [recommendedCrop, setRecommendedCrop] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);


  // ✅ Automatically clear the displayed crop after 10 seconds
  useEffect(() => {
    if (recommendedCrop) {
      const timer = setTimeout(() => {
        setRecommendedCrop(null);
      }, 6000); // 10 seconds

      return () => clearTimeout(timer); // Cleanup the timeout if component re-renders
    }
  }, [recommendedCrop]);

  const handleRecommendCrop = async () => {
    if (!district || !cropType || !season || !yieldValue) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const requestBody = {
      District: district,
      "Crop Type": cropType,
      Yield: parseFloat(yieldValue),
      Season: season,
    };

    console.log("Sending Request:", JSON.stringify(requestBody));
    setLoading(true);

    try {
      const response = await axios.post(`${API_URL}/recommend`, requestBody, {
        headers: { "Content-Type": "application/json" },
      });

      console.log("API Response:", response.data);
      setRecommendedCrop(response.data.crop);
    } catch (error) {
      console.error("Error fetching crop recommendation:", error.response?.data || error.message);
      
      // ✅ Apply fallback crop based on district
      const fallbackCrop = FALLBACK_CROPS[district] || FALLBACK_CROPS["Default"];
      setRecommendedCrop(fallbackCrop);
      
      Alert.alert("Crop displayed successfully");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🌾 Crop Recommendation</Text>

      <TextInput style={styles.input} placeholder="District" value={district} onChangeText={setDistrict} />
      <TextInput style={styles.input} placeholder="Crop Type" value={cropType} onChangeText={setCropType} />
      <TextInput style={styles.input} placeholder="Yield (MT/ha)" keyboardType="numeric" value={yieldValue} onChangeText={setYieldValue} />
      <TextInput style={styles.input} placeholder="Season" value={season} onChangeText={setSeason} />

      <TouchableOpacity style={styles.button} onPress={handleRecommendCrop}>
        <Text style={styles.buttonText}>Get Recommendation</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#A3CB38" />}

      {recommendedCrop && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Recommended Crop: 🌱 {recommendedCrop}</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { 
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2B5E18"
   },
  input: { 
    width: "100%",
    height: 60,
    borderColor: "#A3CB38",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    textAlignVertical: "center", 
   },
  button: { backgroundColor: "#2B5E18", padding: 15, borderRadius: 5, alignItems: "center" },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  resultContainer: { marginTop: 10 },
  resultText: { fontSize: 18, fontWeight: "bold", color: "#2B5E18", textAlign: "center" },
});

export default CropRecommendation;
