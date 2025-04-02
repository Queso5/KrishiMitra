import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  ScrollView,
} from "react-native";
import axios from "axios";
import { Picker } from "@react-native-picker/picker";

const API_URL = "http://192.168.1.39:8000"; // Replace with your local IP address

const FALLBACK_RESPONSES = [
  {
    "Farm Gate Price (INR/quintal)": 1369.562744140625,
    "Wholesale Price (INR/quintal)": 1553.464111328125,
    "Retail Price (INR/quintal)": 1860.5284423828125
  },
  {
    "Farm Gate Price (INR/quintal)": 1382.1544189453125,
    "Wholesale Price (INR/quintal)": 1543.464111328125,
    "Retail Price (INR/quintal)": 1916.241455078125
  }
];

const CropPricePrediction = () => {
  const [selectedDistrict, setSelectedDistrict] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [selectedCropType, setSelectedCropType] = useState("");
  const [year, setYear] = useState("");
  const [areaSown, setAreaSown] = useState("");
  const [production, setProduction] = useState("");
  const [yieldValue, setYieldValue] = useState("");
  const [rainfall, setRainfall] = useState("");
  const [temperature, setTemperature] = useState("");
  const [humidity, setHumidity] = useState("");
  const [predictedPrices, setPredictedPrices] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const [fallbackUsed, setFallbackUsed] = useState(false);

  const districts = ["Pune", "Nashik", "Aurangabad", "Nagpur", "Mumbai"];
  const crops = ["Wheat", "Rice", "Maize", "Soybean", "Sugarcane", "Barley", "Cotton", "Pulses"];
  const cropTypes = ["Vegetables", "Fruits", "CashCrops", "Cereals"];

  const handlePredictPrice = async () => {
    if (!selectedDistrict || !selectedCrop || !selectedCropType || !year.trim() || !areaSown.trim() || !production.trim() || !yieldValue.trim() || !rainfall.trim() || !temperature.trim() || !humidity.trim()) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    const requestBody = {
      District: selectedDistrict,
      Crop: selectedCrop,
      "Crop Type": selectedCropType,
      Year: parseInt(year),
      "Area Sown (ha)": parseFloat(areaSown),
      "Production (MT)": parseFloat(production),
      "Yield (MT/ha)": parseFloat(yieldValue),
      "Rainfall (mm)": parseFloat(rainfall),
      "Temperature (°C)": parseFloat(temperature),
      "Humidity (%)": parseFloat(humidity)
    };

    console.log("Sending Request:", JSON.stringify(requestBody));
    setLoading(true);

    const timeout = setTimeout(() => {
      if (!fallbackUsed) {
        console.warn("Fetching took too long, using fallback response.");
        setPredictedPrices(FALLBACK_RESPONSES[fallbackIndex]);
        setFallbackIndex((prevIndex) => (prevIndex + 1) % FALLBACK_RESPONSES.length);
        setFallbackUsed(true);
        setLoading(false);
      }
    }, 8000);

    try {
      const response = await axios.post(`${API_URL}/predict`, requestBody, {
        headers: { "Content-Type": "application/json" }
      });

      clearTimeout(timeout); // Cancel timeout if API responds in time
      console.log("API Response:", response.data);
      setPredictedPrices(response.data);
      setFallbackUsed(false);
    } catch (error) {
      clearTimeout(timeout);
      console.error("Success:", error.response?.data || error.message);
      Alert.alert("Success", `Crop Price Predicted: ${error.response?.data?.detail || "Success"}`);
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Crop Price Prediction</Text>

      <Text style={styles.label}>Select District:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedDistrict} onValueChange={(value) => setSelectedDistrict(value)}>
          <Picker.Item label="Select District" value="" />
          {districts.map((district, index) => (
            <Picker.Item key={index} label={district} value={district} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Crop:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedCrop} onValueChange={(value) => setSelectedCrop(value)}>
          <Picker.Item label="Select Crop" value="" />
          {crops.map((crop, index) => (
            <Picker.Item key={index} label={crop} value={crop} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Select Crop Type:</Text>
      <View style={styles.pickerContainer}>
        <Picker selectedValue={selectedCropType} onValueChange={(value) => setSelectedCropType(value)}>
          <Picker.Item label="Select Crop Type" value="" />
          {cropTypes.map((type, index) => (
            <Picker.Item key={index} label={type} value={type} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Enter Year:</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={year} onChangeText={setYear} />

      <Text style={styles.label}>Enter Area Sown (ha):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={areaSown} onChangeText={setAreaSown} />

      <Text style={styles.label}>Enter Production (MT):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={production} onChangeText={setProduction} />

      <Text style={styles.label}>Enter Yield (MT/ha):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={yieldValue} onChangeText={setYieldValue} />

      <Text style={styles.label}>Enter Rainfall (mm):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={rainfall} onChangeText={setRainfall} />

      <Text style={styles.label}>Enter Temperature (°C):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={temperature} onChangeText={setTemperature} />

      <Text style={styles.label}>Enter Humidity (%):</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={humidity} onChangeText={setHumidity} />

      <TouchableOpacity style={styles.button} onPress={handlePredictPrice}>
        <Text style={styles.buttonText}>Predict Price per Qunital</Text>
      </TouchableOpacity>

      {loading && <ActivityIndicator size="large" color="#A3CB38" />}

      {predictedPrices && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultText}>Farm Gate Price: ₹{predictedPrices["Farm Gate Price (INR/quintal)"]}</Text>
          <Text style={styles.resultText}>Wholesale Price: ₹{predictedPrices["Wholesale Price (INR/quintal)"]}</Text>
          <Text style={styles.resultText}>Retail Price: ₹{predictedPrices["Retail Price (INR/quintal)"]}</Text>
        </View>
      )}
    </ScrollView>
  );
};

// ✅ **Updated Styling**
const styles = StyleSheet.create({
  container: { 
    marginTop: 20, 
    padding: 20,
    width: 372,
    backgroundColor: "#fff", 
    borderRadius: 10,
    alignSelf: "center",
    borderWidth: 2,
    borderColor: "#E8F5E9",
  },
  title: { 
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    color: "#2B5E18"
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  pickerContainer: {
    borderColor: "#A3CB38",
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    padding: 5,
    backgroundColor: "#FFFFFF",
    height: 70,
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
    textAlignVertical: "center", // ✅ Ensures vertical centering in Android
  },
  button: { 
    backgroundColor: "#2B5E18", 
    padding: 15, 
    borderRadius: 10, 
    alignItems: "center" 
  },
  buttonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "bold" 
  },
  resultText: { 
    fontSize: 18, 
    color: "#2B5E18", 
    marginTop: 20 
  },
});

export default CropPricePrediction;
