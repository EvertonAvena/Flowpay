// TabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

// Import your screens
import HomeScreen from "../screens/HomeScreen";
import NotificationScreen from "../screens/NotificationScreen";
import QRScreen from "../screens/QRScreen";
import TransactionScreen from "../screens/TransactionScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "#F5F5F5",
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          height: 60,
          paddingBottom: 5,
        },
        tabBarActiveTintColor: "#6200EE",
        tabBarInactiveTintColor: "#999",
        tabBarIcon: ({ color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = "home";
          else if (route.name === "Notifications") iconName = "notifications";
          else if (route.name === "QR") iconName = "qr-code";
          else if (route.name === "Transactions") iconName = "swap-horizontal";
          else if (route.name === "Profile") iconName = "person";

          return <Ionicons name={iconName} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="QR" component={QRScreen} />
      <Tab.Screen name="Transactions" component={TransactionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
