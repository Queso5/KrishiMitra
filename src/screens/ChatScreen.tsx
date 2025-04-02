import React, { useEffect, useState, useLayoutEffect, useRef } from "react";
import { 
  View, Text, TextInput, TouchableOpacity, 
  FlatList, KeyboardAvoidingView, Platform, StyleSheet 
} from "react-native";
import { db } from "../config/firebase"; 
import { useNavigation, useRoute } from "@react-navigation/native";
import { collection, addDoc, query, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { auth } from "../config/firebase"; 
import RemixIcon from "react-native-remix-icon";
import * as ImagePicker from "expo-image-picker";  // ✅ Import Image Picker
import { Alert } from "react-native";
import { Image } from "react-native";


interface Message {
  id: string;
  senderId: string;
  senderName: string;
  text?: string;
  image?: string; // ✅ Added image field
  timestamp: Date;
}

const ChatScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { communityId } = route.params;
  const [communityName, setCommunityName] = useState("Community Chat"); // Default title
  const [messages, setMessages] = useState<Message[]>([]);
  const [message, setMessage] = useState("");
  const [userId, setUserId] = useState(""); 
  const [username, setUsername] = useState(""); 
  const flatListRef = useRef<FlatList>(null); // ✅ Reference for auto-scroll

  useEffect(() => {
    const user = auth.currentUser; 
    if (user) {
      setUserId(user.uid); 
      fetchUsername(user.uid);
    } else {
      console.error("No user is currently signed in.");
    }
  }, []);

  const fetchUsername = async (uid: string) => {
    try {
      const userDoc = await getDoc(doc(db, "users", uid)); 
      if (userDoc.exists()) {
        setUsername(userDoc.data().username || "User"); 
      } else {
        console.error("User document does not exist.");
      }
    } catch (error) {
      console.error("Error fetching username: ", error);
    }
  };

  useEffect(() => {
    const fetchCommunityName = async () => {
      try {
        const communityDoc = await getDoc(doc(db, "communities", communityId));
        if (communityDoc.exists()) {
          setCommunityName(communityDoc.data().name || "Community Chat");
        }
      } catch (error) {
        console.error("Error fetching community name:", error);
      }
    };

    fetchCommunityName();

    // ✅ Fetch messages in DESCENDING ORDER (latest messages at the bottom)
    const q = query(collection(db, "communities", communityId, "messages"), orderBy("timestamp", "asc"));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const msgs = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        senderId: doc.data().senderId || "",
        senderName: doc.data().senderName || "Unknown User",
        text: doc.data().text || "",
        timestamp: doc.data().timestamp ? doc.data().timestamp.toDate() : new Date(), // ✅ Convert Firestore timestamp
      }));

      setMessages(msgs); // ✅ No need to reverse, Firestore handles sorting
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300); // ✅ Auto-scroll on new message
    });

    return () => unsubscribe();
  }, [communityId]);

  // ✅ Set Community Name as Header
  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: communityName,
      headerTitleStyle: styles.headerTitle,
      headerStyle: styles.headerContainer,
    });
  }, [navigation, communityName]);

  const sendMessage = async () => {
    if (message.trim()) {
      try {
        await addDoc(collection(db, "communities", communityId, "messages"), {
          senderId: userId,
          senderName: username, 
          text: message,
          timestamp: new Date(),
        });
        setMessage("");

        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 300); // ✅ Auto-scroll on send
      } catch (error) {
        console.error("Error sending message: ", error);
      }
    }
  };

   // ✅ Handle Image Selection
   const pickImage = async () => {
       const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
       if (status !== "granted") {
         Alert.alert("Permission Denied", "You need to allow access to your gallery.");
         return;
       }
   
       const result = await ImagePicker.launchImageLibraryAsync({
         mediaTypes: ImagePicker.MediaTypeOptions.Images,
         allowsEditing: true,
         aspect: [4, 3],
         quality: 1,
       });
   
       if (!result.canceled) {
         setMessages([...messages, { sender: "user", image: result.assets[0].uri }]);
       }
     };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={[
            styles.messageBubble, 
            item.senderId === userId ? styles.userMessage : styles.botMessage
          ]}>
            <Text style={styles.senderName}>{item.senderName || "Unknown User"}</Text>
            {item.text ? <Text style={styles.messageText}>{item.text}</Text> : null}
            {item.image ? <Image source={{ uri: item.image }} style={styles.image} /> : null}
          </View>
        )}
        contentContainerStyle={styles.chatContainer}
      />

      {/* ✅ Chat Input Section with Image Upload */}
      <View style={styles.inputContainer}>
        <TouchableOpacity style={styles.imageButton} onPress={pickImage}>
          <RemixIcon name="image-fill" size={24} color="#A3CB38" />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          placeholderTextColor="#fff"
          value={message}
          onChangeText={setMessage}
        />
        
        <TouchableOpacity onPress={() => sendMessage()} style={styles.sendButton}>
          <RemixIcon name="send-plane-fill" size={24} color="#A3CB38" />
        </TouchableOpacity>
      </View>
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
  messageBubble: { 
    maxWidth: "75%", 
    padding: 12, 
    borderRadius: 10, 
    marginHorizontal: 10,
    marginBottom: 10, 
  },
  userMessage: { 
    backgroundColor: "#A3CB38", 
    alignSelf: "flex-end", 
    elevation: 2,
    borderColor: "#84a52b",
    borderWidth: 1,
    paddingVertical: 15,
    paddingHorizontal: 20,
  },
  botMessage: { 
    backgroundColor: "#bbb", 
    alignSelf: "flex-start", 
    elevation: 2,
    borderColor: "#aaa",
    borderWidth: 1,
  },
  senderName: { 
    fontSize: 12, 
    fontWeight: "bold", 
    color: "#060606", 
    marginBottom: 5 
  },
  messageText: { 
    fontSize: 16, 
    color: "#FFFFFF" 
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
  imageButton: { 
    marginRight: 10,
    backgroundColor: "#ffffff", 
    borderRadius: 50, 
    padding: 12, 
    elevation: 4 
  },
  headerContainer: { 
    backgroundColor: "#ffffff", 
    borderBottomLeftRadius: 20, 
    borderBottomRightRadius: 20, 
    elevation: 5,
  },
  headerTitle: { 
    fontSize: 18, 
    fontWeight: "bold", 
    color: "#060606" 
  },
  image: { 
    width: 200, 
    height: 150, 
    borderRadius: 10, 
    marginTop: 5 
  },

});

export default ChatScreen;
