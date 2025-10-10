// TabNavigator.js
import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions } from "react-native";
import Svg, { Path } from "react-native-svg";

// Import your screens
import HomeScreen from "../screens/HomeScreen";
import NotificationScreen from "../screens/NotificationScreen";
import QRScreen from "../screens/QRScreen";
import TransactionScreen from "../screens/TransactionScreen";
import ProfileScreen from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();
const { width } = Dimensions.get('window');

// Custom Tab Bar with curved center
function CustomTabBar({ state, descriptors, navigation }) {
  const centerX = width / 2;
  const buttonSize = 70; // QR button size
  const curveRadius = 55; // Perfect circular radius
  const curveStart = 55; // Where curve starts from center
  
  // Create ultra-smooth curve using SVG arc for perfect circular shape
  const d = `
    M 0,0
    L ${centerX - curveStart},0
    Q ${centerX - curveStart + 8},0 ${centerX - 47},8
    A ${curveRadius} ${curveRadius} 0 0 0 ${centerX},${curveRadius - 10}
    A ${curveRadius} ${curveRadius} 0 0 0 ${centerX + 47},8
    Q ${centerX + curveStart - 8},0 ${centerX + curveStart},0
    L ${width},0
    L ${width},70
    L 0,70
    Z
  `;

  return (
    <View style={styles.tabBarContainer}>
      {/* Curved Background Shape */}
      <Svg
        width={width}
        height="70"
        style={styles.svgBackground}
      >
        <Path
          d={d}
          fill="white"
        />
      </Svg>

      {/* Tab Items */}
      <View style={styles.tabItemsContainer}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          // Skip QR Button in the loop - it's rendered separately below
          if (route.name === "QR") {
            return <View key={index} style={styles.qrButtonWrapper} />;
          }

          // Other tabs
          let iconName;
          if (route.name === "Home") {
            iconName = isFocused ? "home" : "home-outline";
          } else if (route.name === "Notifications") {
            iconName = isFocused ? "notifications" : "notifications-outline";
          } else if (route.name === "Transactions") {
            iconName = isFocused ? "swap-horizontal" : "swap-horizontal-outline";
          } else if (route.name === "Profile") {
            iconName = isFocused ? "person" : "person-outline";
          }

          return (
            <TouchableOpacity
              key={index}
              onPress={onPress}
              style={styles.tabItem}
            >
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? "#179C7D" : "#999"}
              />
              <Text style={[
                styles.tabLabel,
                { color: isFocused ? "#179C7D" : "#999", fontWeight: isFocused ? "600" : "500" }
              ]}>
                {route.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      {/* Center QR Button - Outside the flex container for perfect centering */}
      <View style={[styles.centerButtonAbsolute, { left: centerX - 35 }]}>
        <TouchableOpacity
          onPress={() => navigation.navigate('QR')}
          style={styles.qrButtonContainer}
        >
          <View style={styles.qrButton}>
            <Ionicons name="qr-code" size={28} color="white" />
          </View>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notifications" component={NotificationScreen} />
      <Tab.Screen name="QR" component={QRScreen} />
      <Tab.Screen name="Transactions" component={TransactionScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
  },
  svgBackground: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  tabItemsContainer: {
    flexDirection: 'row',
    height: 70,
    alignItems: 'flex-end',
    paddingBottom: 10,
  },
  tabItem: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 4,
    paddingBottom: 5,
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  qrButtonWrapper: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: 'transparent',
  },
  centerButtonAbsolute: {
    position: 'absolute',
    top: -30,
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  qrButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#02b09eff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
});
