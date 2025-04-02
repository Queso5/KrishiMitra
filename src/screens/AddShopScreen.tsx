import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer } from "@react-navigation/native";
import MarketScreen from "../screens/MarketScreen";
import AddShopScreen from "../screens/AddShopScreen"; 

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="MarketScreen"
          component={MarketScreen}
          options={{ title: "Market" }}
        />
        <Stack.Screen
          name="AddShopScreen"
          component={AddShopScreen} // ✅ Now properly imported and used
          options={{ title: "Add Shop" }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
