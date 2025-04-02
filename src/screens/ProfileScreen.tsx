import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Switch,
  ScrollView,
} from "react-native";
import { auth, db } from "../config/firebase";
import { getDoc, doc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { Picker } from "@react-native-picker/picker";
import Header from "../components/Header";

const GOOGLE_TRANSLATE_API_KEY = "AIzaSyCFhKLZphlelIX-ovBXy5P4ZVCxtBkj_IU"; // 🔒 Replace with your API key

const ProfileScreen = ({ navigation }: { navigation: any }) => {
  const user = auth.currentUser;
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [language, setLanguage] = useState("English"); // ✅ Default to English
  const [translatedText, setTranslatedText] = useState({});
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [loading, setLoading] = useState(false);

  // Address Fields
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");

  // Default English Texts
  const textToTranslate = {
    editProfile: "Edit Profile",
    username: "Username",
    email: "Email",
    contact: "Contact Number",
    address: "Address",
    street: "Street",
    city: "City",
    state: "State",
    pincode: "Pincode",
    languagePref: "Language Preference",
    notifications: "Enable Notifications",
    saveChanges: "Save Changes",
    logout: "Logout",
    helpSupport: "Help & Support",
  };

  useEffect(() => {
    setTranslatedText(textToTranslate); // ✅ Set default language text as English

    if (user) {
      const fetchProfileData = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setUsername(userData.username || "");
          setPhone(userData.phone || "");
          setLanguage(userData.language || "English"); // ✅ Ensure English is default
          setStreet(userData.street || "");
          setCity(userData.city || "");
          setState(userData.state || "");
          setPincode(userData.pincode || "");
          setNotificationsEnabled(userData.notificationsEnabled ?? true);
        }
      };
      fetchProfileData();
    }
  }, [user]);

  // ✅ Function to Translate Text
  const translateText = async (targetLang: string) => {
    if (targetLang === "English") {
      setTranslatedText(textToTranslate);
      return;
    }

    try {
      const texts = Object.values(textToTranslate);
      const response = await axios.post(
        `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
        {
          q: texts,
          target: targetLang.toLowerCase(),
          format: "text",
        }
      );

      const translations = response.data.data.translations.map((t) => t.translatedText);
      const translatedMap = Object.keys(textToTranslate).reduce((acc, key, index) => {
        acc[key] = translations[index];
        return acc;
      }, {} as Record<string, string>);

      setTranslatedText(translatedMap);
    } catch (error) {
      console.error("Translation Error:", error);
      Alert.alert("Error", "Failed to fetch translations.");
    }
  };

  // Save updated data to Firestore
  const handleSave = async () => {
    if (!user) return;
    setLoading(true);

    try {
      await updateDoc(doc(db, "users", user.uid), {
        username,
        phone,
        language,
        street,
        city,
        state,
        pincode,
        notificationsEnabled,
      });

      translateText(language); // Apply translation
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      Alert.alert("Error", "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged Out", "You have been logged out.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Alert.alert("Error", "Failed to log out.");
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
          <Text style={styles.title}>{translatedText.editProfile}</Text>

          {/* Username */}
          <Text style={styles.label}>{translatedText.username}</Text>
          <TextInput style={styles.input} value={username} onChangeText={setUsername} />

          {/* Email */}
          <Text style={styles.label}>{translatedText.email}</Text>
          <TextInput style={[styles.input, styles.disabledInput]} value={email} editable={false} />

          {/* Contact Number */}
          <Text style={styles.label}>{translatedText.contact}</Text>
          <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

          {/* Address Form */}
          <Text style={styles.sectionTitle}>{translatedText.address}</Text>
          <TextInput style={styles.input} value={street} onChangeText={setStreet} placeholder={translatedText.street} />
          <TextInput style={styles.input} value={city} onChangeText={setCity} placeholder={translatedText.city} />
          <TextInput style={styles.input} value={state} onChangeText={setState} placeholder={translatedText.state} />
          <TextInput style={styles.input} value={pincode} onChangeText={setPincode} placeholder={translatedText.pincode} keyboardType="numeric" />

          {/* Language Preferences */}
          <Text style={styles.sectionTitle}>{translatedText.languagePref}</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={language}
              onValueChange={(value) => {
                setLanguage(value);
                translateText(value);
              }}
            >
              <Picker.Item label="English" value="English" />
              <Picker.Item label="हिन्दी" value="hi" />
              <Picker.Item label="मराठी" value="mr" />
            </Picker>
          </View>

          {/* Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.saveButton} onPress={handleSave} disabled={loading}>
              <Text style={styles.buttonText}>{loading ? "Saving..." : translatedText.saveChanges}</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
              <Text style={styles.buttonText}>{translatedText.logout}</Text>
            </TouchableOpacity>
          </View>

          {/* Help & Support */}
          <TouchableOpacity style={styles.helpButton} onPress={() => Alert.alert(translatedText.helpSupport, "Contact us at krishimitra.support@gmail.com")}>
            <Text style={styles.buttonText}>{translatedText.helpSupport}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 50,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "transparent",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 5,
    color: "#333",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 5,
    color: "#333",
  },
  input: {
    width: "100%",
    height: 50,
    borderColor: "#A3CB38",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    fontSize: 16,
    backgroundColor: "#FFFFFF",
  },
  pickerContainer: {
    borderColor: "#A3CB38",
    borderWidth: 2,
    borderRadius: 10,
    marginBottom: 20,
    backgroundColor: "#FFFFFF",
    padding: 5,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#A3CB38",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginRight: 10,
    borderColor: "#84a52b",
    borderWidth: 2,
  },
  logoutButton: {
    flex: 1,
    backgroundColor: "#c9302c",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    borderColor: "#a82925",
    borderWidth: 2,
  },
  helpButton: {
    marginTop: 15,
    backgroundColor: "#2d2d2d",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 80,
    borderColor: "#060606",
    borderWidth: 2,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});


export default ProfileScreen;
