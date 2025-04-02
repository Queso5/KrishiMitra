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
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import RemixIcon from "react-native-remix-icon"; // ✅ Import Remix Icons

const db = getFirestore();

const SignupScreen = ({ navigation }: { navigation: any }) => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [errors, setErrors] = useState({ username: "", email: "", password: "" });

  // ✅ Validation function
  const validateForm = () => {
    let valid = true;
    let newErrors = { username: "", email: "", password: "" };

    if (!username.trim()) {
      newErrors.username = "Username is required";
      valid = false;
    }

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

  const handleSignup = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        uid: user.uid,
      });

      Alert.alert("Success", "Account created successfully!");
      navigation.reset({
        index: 0,
        routes: [{ name: "Main", params: { screen: "Home" } }],
      });
    } catch (error: any) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require("../logo_asset/krishimitra_logo.png")} style={styles.logo} />

      <Text style={styles.title}>Sign Up</Text>

      {/* Username Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.username ? styles.errorInput : null]}
          placeholder="Username"
          value={username}
          onChangeText={setUsername}
          placeholderTextColor="#666"
        />
        <RemixIcon name="ri-user-3-fill" size={22} color="#666" style={styles.icon} />
      </View>
      {errors.username ? <Text style={styles.errorText}>{errors.username}</Text> : null}

      {/* Email Field */}
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

      {/* Password Field */}
      <View style={styles.inputContainer}>
        <TextInput
          style={[styles.input, errors.password ? styles.errorInput : null]}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
          placeholderTextColor="#666"
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <RemixIcon name={passwordVisible ? "ri-eye-off-line" : "ri-eye-line"} size={22} color="#666" style={styles.icon} />
        </TouchableOpacity>
      </View>
      {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

      {/* Sign Up Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignup} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? "Signing Up..." : "Sign Up"}</Text>
      </TouchableOpacity>

      {/* Login Link */}
      <TouchableOpacity style={styles.linkButton} onPress={() => navigation.navigate("Login")}>
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.highlightText}>Login</Text>
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
    width: 280, 
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
    borderColor: "#84a52b",
    borderWidth: 2,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 10,
    width: "100%",
    backgroundColor: "#FFFFFF",
    justifyContent: "space-between",
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

export default SignupScreen;




