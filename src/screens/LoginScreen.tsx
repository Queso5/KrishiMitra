"use client";

import { useState } from "react";
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Text,
  Alert,
  Image,
} from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import RemixIcon from "react-native-remix-icon";
import { FirebaseError } from "firebase/app"; // ✅ Import FirebaseError

const LoginScreen = ({ navigation }: { navigation: any }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });

  const validateForm = () => {
    let valid = true;
    let newErrors = { email: "", password: "" };

    if (!email.trim()) {
      newErrors.email = "Email is required";
      valid = false;
    }

    if (!password.trim()) {
      newErrors.password = "Password is required";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleLogin = async () => {
    if (!validateForm()) return;
  
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigation.reset({
        index: 0,
        routes: [{ name: "Main", params: { screen: "Home" } }],
      });
    } catch (error) {
      if (error instanceof FirebaseError) {
        Alert.alert("Error", error.message); // ✅ TypeScript now recognizes error.message
      } else {
        console.error("Unexpected error:", error);
        Alert.alert("Error", "An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* ✅ Logo Added */}
      <Image source={require("../logo_asset/krishimitra_logo.png")} style={styles.logo} />

      <Text style={styles.title}>Login</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.email ? styles.errorInput : null]}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          placeholderTextColor="#666"
        />
        <RemixIcon name="ri-mail-line" size={22} color="#666" style={styles.icon} />
      </View>
      {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.password ? styles.errorInput : null]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPassword}
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
          <RemixIcon name={showPassword ? "ri-eye-off-line" : "ri-eye-line"} size={22} color="#666" style={styles.icon} />
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      {/* Sign Up Link */}
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("Signup")}>
        <Text style={styles.linkText}>
          Don't have an account? <Text style={styles.highlightText}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#FFFFFF",
  },
  logo: {
    width: 280, // Adjusted size for better alignment
    height: 200,
    resizeMode: "contain",
    marginBottom: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#060606",
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    borderColor: "#84a52b",
    borderWidth: 2,
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 10,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: "#060606",
  },
  icon: {
    marginLeft: 10,
  },
  errorInput: {
    borderColor: "red",
  },
  errorText: {
    color: "red",
    alignSelf: "flex-start",
    marginLeft: 10,
    fontSize: 14,
  },
  button: {
    width: "100%",
    backgroundColor: "#A3CB38",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
    borderWidth: 2,
    borderColor: "#84a52b",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
  },
  linkButton: {
    marginTop: 15,
  },
  linkText: {
    color: "#060606",
    fontSize: 16,
    textDecorationLine: "none",
  },
  highlightText: {
    color: "#2B5E18",
    fontWeight: "bold",
  },
});

export default LoginScreen;
