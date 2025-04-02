import React, { useState, useLayoutEffect, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import RemixIcon from "react-native-remix-icon";
import axios from "axios"; // ✅ Import Axios for API requests
import { Alert } from "react-native";
import MarketScreen from "../screens/MarketScreen";
import CommunityScreen from "../screens/CommunityScreen";
import ProfileScreen from "../screens/ProfileScreen";
import HomeScreen from "../screens/HomeScreen";


// ✅ Google Speech-to-Text API Key
const GOOGLE_SPEECH_API_KEY = "AIzaSyDBjUQfE7i0TG8BNFksnCMyGwsAqLET_-A";

const GEMINI_API_KEY = "AIzaSyBfDbUUVbyC9_ZXIYY1P3mJ3RseSe6QYrA"; // 🔥 Replace with your API key

const ChatbotScreen = () => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<{ text?: string; sender: "user" | "bot"; image?: string }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetModalVisible, setResetModalVisible] = useState(false);
  const [isListening, setIsListening] = useState(false); // ✅ Track if voice is being recorded
  const [listening, setListening] = useState(false);
  const [spokenText, setSpokenText] = useState("");



  // ✅ Update header styling
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <Image
          source={require("../logo_asset/krishimitra_cb.png")} // ✅ Replace Text with Image
          style={styles.headerLogo} // ✅ Add styling
          resizeMode="contain"
        />
      ),
      headerStyle: styles.headerContainer,
      headerRight: () => (
        <TouchableOpacity onPress={handleResetChat} style={styles.resetButton}>
          <RemixIcon name="refresh-line" size={24} color="#A3CB38" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);
  
  

  const handleResetChat = () => {
    setResetModalVisible(true); // Open modal
  };
  
  const confirmResetChat = () => {
    setMessages([]); // Clear chat
    setResetModalVisible(false); // Close modal
  };

  // ✅ Start Listening for Voice Commands
  const startListening = async () => {
    try {
      setListening(true);
      Alert.alert("Listening...", "Speak your command!");

      // ✅ Request permission
      const response = await axios.post(
        `https://speech.googleapis.com/v1/speech:recognize?key=${GOOGLE_SPEECH_API_KEY}`,
        {
          config: {
            encoding: "LINEAR16",
            sampleRateHertz: 16000,
            languageCode: "en-US", // Change for other languages
          },
          audio: {
            content: "AUDIO_DATA_IN_BASE64", // Replace with actual microphone input
          },
        }
      );

      const transcript =
        response.data.results?.[0]?.alternatives?.[0]?.transcript || "";
      setSpokenText(transcript);
      setListening(false);

      if (transcript) {
        navigateToPage(transcript);
      } else {
        Alert.alert("Error", "Could not recognize speech.");
      }
    } catch (error) {
      console.error("Voice Recognition Error:", error);
      setListening(false);
      Alert.alert("Error", "Speech recognition failed.");
    }
  };

  // ✅ Map Spoken Command to App Screens
  const navigateToPage = (command: string) => {
    const lowerCommand = command.toLowerCase();
  
    if (lowerCommand.includes("home")) {
      navigation.navigate("Home");
    } else if (lowerCommand.includes("market")) {
      navigation.navigate("MarketScreen");
    } else if (lowerCommand.includes("community")) {
      navigation.navigate("CommunityScreen");
    } else if (lowerCommand.includes("profile")) {
      navigation.navigate("ProfileScreen");
    } else if (lowerCommand.includes("sell")) {
      navigation.navigate("SellScreen");
    } else {
      Alert.alert("Unknown Command", "Try saying 'Go to Home' or 'Open Market'");
    }
  };
  
  

  // ✅ Fetch response from Gemini AI
  const getChatbotResponse = async (userMessage: string) => {
    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`,
        {
          contents: [{ role: "user", parts: [{ text: userMessage }] }],
        }
      );

      return response.data.candidates[0]?.content.parts[0]?.text || "I don't have an answer for that.";
    } catch (error) {
      console.error("Chatbot Error:", error);
      return "Sorry, I couldn't process that request.";
    }
  };

  // ✅ Handle user message & chatbot response
  const handleSend = async () => {
    if (input.trim() === "") return;
    
    setMessages([...messages, { text: input, sender: "user" }]);
    setInput("");
    setLoading(true);

    const botReply = await getChatbotResponse(input);
    
    setMessages((prevMessages) => [...prevMessages, { text: botReply, sender: "bot" }]);
    setLoading(false);
  };


  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* ✅ Chat Messages */}
          <FlatList
            data={messages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item }) => (
              <View style={[styles.messageContainer, item.sender === "user" ? styles.userMessageContainer : styles.botMessageContainer]}>
                <RemixIcon name={item.sender === "user" ? "user-3-fill" : "robot-2-fill"} size={24} color={item.sender === "user" ? "#A3CB38" : "grey"} />
                <View style={[styles.messageBubble, item.sender === "user" ? styles.userMessage : styles.botMessage]}>
                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.image} />
                  ) : (
                    <Text style={styles.messageText}>{item.text}</Text>
                  )}
                </View>
              </View>
            )}
            contentContainerStyle={styles.chatContainer}
          />

          {/* ✅ Loading Indicator */}
          {loading && <ActivityIndicator size="large" color="#A3CB38" style={styles.loadingIndicator} />}

          {/* ✅ Reset Chat Modal */} 
          {resetModalVisible && (
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Reset Chat</Text>
              <Text style={styles.modalMessage}>Are you sure you want to clear all messages?</Text>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity style={styles.modalCancelButton} onPress={() => setResetModalVisible(false)}>
                  <Text style={styles.modalButtonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.modalConfirmButton} onPress={confirmResetChat}>
                  <Text style={styles.modalButtonText}>Reset</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
 
          {/* ✅ Input Field with Image Upload */}
          <View style={styles.inputContainer}>
            {/* ✅ Voice Command Button */}
            <TouchableOpacity style={styles.voiceButton} onPress={startListening}>
              <RemixIcon name="mic-fill" size={30} color="#A3CB38" />
            </TouchableOpacity>

            {loading && <ActivityIndicator size="large" color="#A3CB38" />}

            {spokenText ? <Text style={styles.resultText}>You said: {spokenText}</Text> : null}
          
          
            <TextInput
              style={styles.input}
              placeholder="Ask about farming..."
              value={input}
              onChangeText={setInput}
              placeholderTextColor="#fff"
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <RemixIcon name="send-plane-fill" size={24} color="#A3CB38" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#F5F5F5" 
  },
  chatContainer: { 
    flexGrow: 1, 
    padding: 15, 
    justifyContent: "flex-end" 
  },
  messageContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10 
  },
  userMessageContainer: { 
    justifyContent: "flex-end", 
    flexDirection: "row" 
  },
  botMessageContainer: { 
    justifyContent: "flex-start", 
    flexDirection: "row" 
  },
  messageBubble: { 
    maxWidth: "75%", 
    padding: 12, 
    borderRadius: 20, 
    marginHorizontal: 10,
  },
  userMessage: { 
    backgroundColor: "#A3CB38", 
    alignSelf: "flex-end", 
    elevation: 2 
  },
  botMessage: { 
    backgroundColor: "grey", 
    alignSelf: "flex-start", 
    elevation: 2 
  },
  messageText: { 
    fontSize: 16, 
    color: "#FFFFFF" 
  },
  image: { 
    width: 200, 
    height: 150, 
    borderRadius: 10 
  },
  inputContainer: { 
    flexDirection: "row", 
    alignItems: "center", 
    backgroundColor: "#A3CB38", 
    padding: 15, 
    borderTopLeftRadius: 20, 
    borderTopRightRadius: 20 
  },
  input: { 
    flex: 1, 
    height: 45, 
    fontSize: 16, 
    color: "#ffffff", 
    backgroundColor: "rgba(255,255,255,0.2)", 
    paddingHorizontal: 15, 
    borderRadius: 10 
  },
  sendButton: { 
    backgroundColor: "#ffffff", 
    borderRadius: 50, 
    padding: 12, 
    marginLeft: 10, 
    elevation: 4 
  },
  plusButton: { 
    backgroundColor: "#ffffff", 
    borderRadius: 50, 
    padding: 10, 
    marginRight: 10, 
    elevation: 4 
  },
  loadingIndicator: { 
    marginBottom: 10 
  },
  headerContainer: { 
    backgroundColor: "#ffffff", 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
    elevation: 3 
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#060606" 
  },
  resetButton: {
    marginRight: 15,
    padding: 8,
  },
  //reset chat modal
  modalContainer: {
    position: "absolute",
    top: -20,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.1)", // ✅ Semi-transparent background
  },
  
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 20,
    alignItems: "center",
    elevation: 5,
    borderRadius: 10,
    borderWidth: 4,
    borderColor: "#E8F5E9",
  },
  
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2B5E18",
    marginBottom: 10,
  },
  
  modalMessage: {
    fontSize: 16,
    color: "#333",
    textAlign: "center",
    marginBottom: 20,
  },
  
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#ccc",
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#aaa",
  },
  
  modalConfirmButton: {
    flex: 1,
    backgroundColor: "#c9302c",
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
    borderColor: "#a82925",
    borderWidth: 2,
  },
  
  modalButtonText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  headerLogo: {
    width: 150,  // ✅ Adjust width as needed
    height: 40,  // ✅ Adjust height as needed
  },
  voiceButton: {
    backgroundColor: "#ffffff", 
    borderRadius: 50, 
    padding: 10, 
    marginRight: 10, 
    elevation: 4 
  },
  listeningText: {
    fontSize: 18,
    color: "#A3CB38",
    marginTop: 10,
  },
  spokenText: {
    fontSize: 16,
    color: "#333",
    marginTop: 10,
    fontWeight: "bold",
  },

  resultText: { fontSize: 18, color: "#2B5E18", marginTop: 20 },
  
});

export default ChatbotScreen;
