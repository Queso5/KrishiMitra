import React, { createContext, useState, useEffect } from "react";
import axios from "axios";

const GOOGLE_TRANSLATE_API_KEY = "AIzaSyCFhKLZphlelIX-ovBXy5P4ZVCxtBkj_IU"; // 🔒 Replace with your API key

// ✅ Default English Texts for all screens
// ✅ Default English Texts for all screens
const defaultTexts = {
  community: "Community",
  messages: "Messages",
  send: "Send",
  market: "Market",
  categories: "Categories",
  viewDetails: "View Details",
  chatbot: "Chatbot",
  welcome: "Welcome",
  profile: "Profile",
  languagePref: "Language Preference",
  logout: "Logout",
  helpSupport: "Help & Support",
  search: "Search",
  filter: "Filter",
  addCommunity: "Create Community",
  noResults: "No results found.",
  loading: "Loading...",
};
// ✅ Create Context
export const LanguageContext = createContext({
  language: "English",
  translatedText: defaultTexts,
  setLanguage: (lang: string) => {},
});

// ✅ Provider Component
export const LanguageProvider = ({ children }: { children: React.ReactNode }) => {
  const [language, setLanguage] = useState("English");
  const [translatedText, setTranslatedText] = useState(defaultTexts);

  // ✅ Fetch Translations when Language Changes
  useEffect(() => {
    if (language === "English") {
      setTranslatedText(defaultTexts);
      return;
    }

    const translateText = async () => {
      try {
        const texts = Object.values(defaultTexts);
        const response = await axios.post(
          `https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`,
          {
            q: texts,
            target: language.toLowerCase(),
            format: "text",
          }
        );

        // ✅ Store Translations in Correct Format
        const translations = response.data.data.translations.map((t) => t.translatedText);
        const translatedMap = Object.keys(defaultTexts).reduce((acc, key, index) => {
          acc[key] = translations[index] || defaultTexts[key]; // Fallback to English if missing
          return acc;
        }, {} as Record<string, string>);

        setTranslatedText(translatedMap);
      } catch (error) {
        console.error("Translation Error:", error);
      }
    };

    translateText();
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, translatedText, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};