import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Image,
  Dimensions,
  StyleSheet,
  Text,
  Animated,
  ActivityIndicator,
  ScrollView,
  FlatList,
  TouchableOpacity,
  Linking,
} from "react-native";
import Header from "../components/Header";
import axios from "axios";
import * as Location from "expo-location"; // ✅ Import Location API
import { LinearGradient } from "expo-linear-gradient";
import CropPricePrediction from "../screens/CropPricePrediction"; // Import the new component
import CropRecommendation from "../components/CropRecommendation"; // Import the new component



// ✅ OpenWeather API Key (Replace with yours)
const API_KEY = "636b74f1e918f2c9a7436ea425d4e29a"; // 🔥 Replace with your API key


// ✅ Get screen width
const { width } = Dimensions.get("window");


const HomeScreen = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [news, setNews] = useState([]);
  const [airQualityData, setAirQualityData] = useState(null);




  // ✅ Animated scrolling text
  const scrollX = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loopAnimation = () => {
      Animated.loop(
        Animated.timing(scrollX, {
          toValue: -width,
          duration: 7000,
          useNativeDriver: true,
        })
      ).start();
    };
    loopAnimation();
  }, []);

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
        const response = await axios.get(
            "https://newsapi.org/v2/everything?q=agriculture OR crops OR farming&language=hi&apiKey=4fffeb2ed48f4ff6af4d80eedc0cb2e9"
        );

        // ✅ Slice the response to limit to 5 articles
        setNews(response.data.articles.slice(0, 5));
    } catch (error) {
        console.error("Error fetching news:", error);
    } finally {
        setLoading(false);
    }
};

  // ✅ Open News in Browser
  const openNewsArticle = (url) => {
    Linking.openURL(url).catch((err) =>
      console.error("Couldn't open URL", err)
    );
  };


  useEffect(() => {
    fetchWeather();
  }, []);
  
  const fetchWeather = async () => {
    setLoading(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setError("Location permission denied.");
        return;
      }
  
      let location = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = location.coords;
  
      // Fetch weather forecast
      const weatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
      );
      setWeatherData(weatherResponse.data);
  
      // Fetch air quality data
      const airQualityResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${latitude}&lon=${longitude}&appid=${API_KEY}`
      );
      setAirQualityData(airQualityResponse.data);
  
    } catch (error) {
      setError("Failed to fetch weather data.");
    } finally {
      setLoading(false);
    }
  };
  
  

  // ✅ Function to get correct weather icon based on OpenWeather description
  const getWeatherIcon = (description) => {
    const lowerDesc = description.toLowerCase();
    
    if (lowerDesc.includes("clear")) return require("../logo_asset/weather/clear_day.png");
    if (lowerDesc.includes("clouds")) return require("../logo_asset/weather/cloudy.png");
    if (lowerDesc.includes("rain")) return require("../logo_asset/weather/light_rain.png");
    if (lowerDesc.includes("thunderstorm")) return require("../logo_asset/weather/thunderstorm.png");
    if (lowerDesc.includes("snow")) return require("../logo_asset/weather/snow.png");
    if (lowerDesc.includes("fog") || lowerDesc.includes("mist")) return require("../logo_asset/weather/fog.png");
  
    return require("../logo_asset/weather/clear_day.png"); // Default icon
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#A3CB38" />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
      <Header />


      <View style={styles.container}>
        
      <LinearGradient colors={['#5B86E5', '#36D1DC']} style={styles.weatherCard}>
      {/* Current Weather Section */}
      <View style={styles.currentWeatherSection}>
        {/* Location & Temperature */}
        <View style={styles.weatherLeft}>
          <Text style={styles.cityName}>{weatherData.city.name}</Text>
          <Text style={styles.temperature}>
            {Math.round(weatherData.list[0].main.temp)}°C
          </Text>
          <Text style={styles.humidity}>
            Humidity: {weatherData.list[0].main.humidity}%
          </Text>
          <Text style={styles.rainfall}>
            Rainfall: {weatherData.list[0].rain ? weatherData.list[0].rain["3h"] : 0} mm
          </Text>
        </View>

        {/* Climate & Icon */}
        <View style={styles.weatherRight}>
          <Image
            source={getWeatherIcon(weatherData.list[0].weather[0].description)}
            style={styles.weatherIcon}
          />
          <Text style={styles.weatherDesc}>
            {weatherData.list[0].weather[0].description}
          </Text>
        </View>
      </View>

      {/* Next 3 Days Forecast */}
      <View style={styles.forecastSection}>
        {weatherData.list
          .filter((item, index) => index % 8 === 0)
          .slice(0, 4)
          .map((item, index) => (
            <View key={index} style={styles.forecastItem}>
              <Text style={styles.forecastDay}>
                {new Date(item.dt * 1000).toLocaleDateString("en-US", {
                  weekday: "short",
                })}
              </Text>
              <Image
                source={getWeatherIcon(item.weather[0].description)}
                style={styles.forecastIcon}
              />
              <Text style={styles.forecastTemp}>
                {Math.round(item.main.temp)}°C
              </Text>
            </View>
          ))}
      </View>
    </LinearGradient>


        {/* ✅ Marquee Section */}
        <View style={styles.marqueeContainer}>
          <Animated.View style={{ flexDirection: "row", transform: [{ translateX: scrollX }] }}>
            <Text style={styles.marqueeText}>
              🌾 Welcome to Krishi Mitra! 🚜 {"  "}
              Empowering Farmers with Smart Solutions 🌱{"  "}
            </Text>
            <Text style={styles.marqueeText}>
              🌾 Welcome to Krishi Mitra! 🚜 {"  "}
              Empowering Farmers with Smart Solutions 🌱{"  "}
            </Text>
          </Animated.View>
        </View>

        <View style={styles.cropRecommendationContainer}>
          <CropRecommendation />
        </View>

      

      <View style={styles.newscontainer}>
      <Text style={styles.title}>🌱 Farming News</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#A3CB38" />
      ) : (
        <FlatList
          data={news}
          keyExtractor={(item) => item.url}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.newsItem}
              onPress={() => openNewsArticle(item.url)}
            >
              {/* ✅ News Image */}
              {item.urlToImage && (
                <Image source={{ uri: item.urlToImage }} style={styles.newsImage} />
              )}
              <View style={styles.newsTextContainer}>
                <Text style={styles.newsTitle} numberOfLines={2}>
                  {item.title}
                </Text>
                <Text style={styles.newsSource}>{item.source.name}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
        
      <View style={styles.cropPricePredictionContainer}>
        <CropPricePrediction />
      </View>



      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: 20,
    paddingBottom: 120,
  },
  bannerImage: {
    width: "92%",
    height: 200,
    borderRadius: 10,
    resizeMode: "cover",
    justifyContent: "center",
    alignSelf: "center",
  },
  pagination: {
    flexDirection: "row",
    marginTop: 10,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#ccc",
    marginHorizontal: 4,
  },
  activeDot: {
    backgroundColor: "#2B5E18",
  },
  marqueeContainer: {
    width: "100%",
    height: 50,
    backgroundColor: "#2B5E18",
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 10,
  },
  marqueeText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "bold",
  },


  //CPP
  cropPricePredictionContainer: {
    elevation: 5,
  },
  
  // ✅ News Section
  newscontainer: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginHorizontal: 10,
    elevation: 3,
    marginTop: 10,
    width: "90%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2B5E18",
    marginBottom: 10,
    textAlign: "center",
  },
  newsItem: {
    flexDirection: "row",
    backgroundColor: "#fafafa",
    padding: 8,
    borderRadius: 10,
    marginBottom: 8,
  },
  newsImage: {
    width: 80,
    height: 80,
    borderRadius: 10,
    marginRight: 10,
  },
  newsTextContainer: {
    flex: 1,
    justifyContent: "center",
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
  },
  newsSource: {
    fontSize: 12,
    color: "#777",
    marginTop: 3,
  },
  
  // ✅ Weather Card
  weatherContainer: {
    marginTop: 20,
    alignItems: "center",
  },
  weatherCard: {
    backgroundColor: "#2B5E18",
    borderRadius: 10,
    padding: 20,
    width: "90%",
    elevation: 5,
  },

  // ✅ Current Weather Section (Top)
  currentWeatherSection: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  weatherLeft: {
    alignItems: "flex-start",
    paddingLeft: 10,
  },
  cityName: {
    fontSize: 20, // Small font for location
    fontWeight: "bold",
    color: "#FFF",
  },
  temperature: {
    fontSize: 50, // Large font for temperature
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 2,
  },
  weatherRight: {
    alignItems: "center",
    paddingRight: 10,
  },
  weatherIcon: {
    width: 60,
    height: 60,
    marginBottom: 5,
  },
  weatherDesc: {
    fontSize: 14,
    color: "#FFF",
  },

   // ✅ New Styles for Humidity & Rainfall
   humidity: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 4,
  },
  rainfall: {
    fontSize: 16,
    color: "#FFF",
    marginTop: 4,
  },

  // ✅ Air Quality Section
  airQualitySection: {
    marginTop: 15,
    alignItems: "center",
  },
  airQuality: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
  },

  // ✅ Forecast Section (Bottom)
  forecastSection: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    marginTop: 15,
  },
  forecastItem: {
    alignItems: "center",
  },
  forecastDay: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFF",
  },
  forecastIcon: {
    width: 45,
    height: 45,
    resizeMode: "contain",
  },
  forecastTemp: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginTop: 5,
  },

  // ✅ Error & Loading Text
  loadingText: {
    fontSize: 16,
    color: "#FFF",
    textAlign: "center",
  },
  errorText: {
    fontSize: 16,
    color: "#c9302c",
    textAlign: "center",
    marginTop: 20,
  },
  cropRecommendationContainer: {
    elevation: 5,
  },


});

export default HomeScreen;
