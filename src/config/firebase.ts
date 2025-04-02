import { initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig: FirebaseOptions = {
  apiKey: "AIzaSyDAjI6uSuqdeq8R0H8-pdW7kZ2XGmqWv4c",
  authDomain: "krishmitra-8f9ed.firebaseapp.com",
  projectId: "krishmitra-8f9ed",
  storageBucket: "krishmitra-8f9ed.appspot.com", // Fixed the incorrect domain
  messagingSenderId: "1034612167336",
  appId: "1:1034612167336:android:70c1d25c5ed09d5395289d",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Export the Firebase app along with auth and db
export { app, auth, db };
