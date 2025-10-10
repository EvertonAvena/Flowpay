// App.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

import TabNavigator from "./components/TabNavigator";
import GetStartedScreen from "./screens/GetStartedScreen";
import LoginScreen from "./screens/LoginScreen";
import Next from "./screens/nextScreen";
import Next1 from "./screens/nextScreen1";
import Next2 from "./screens/nextScreen2";
import Next3 from "./screens/nextScreen3";
import PayBillsScreen from './screens/PayBillsScreen';
import SignupScreen from "./screens/SignupScreen";
import TransferScreen from './screens/TransferScreen';
import TransferConfirmationScreen from './screens/TransferConfirmationScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import MyQRCodeScreen from './screens/MyQRCodeScreen';
import SettingsScreen from './screens/SettingsScreen';
import ChangePasswordScreen from './screens/ChangePasswordScreen';
import TermsAndConditionsScreen from './screens/TermsAndConditionsScreen';
import PrivacyPolicyScreen from './screens/PrivacyPolicyScreen';
import HelpScreen from './screens/HelpScreen';
import SendFeedbackScreen from './screens/SendFeedbackScreen';

const Stack = createStackNavigator();
const ONBOARDING_COMPLETE_KEY = "flowpay_onboarding_complete";

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [initialRouteName, setInitialRouteName] = useState("GetStarted");

  useEffect(() => {
    // Always start with GetStartedScreen for every user
    const initializeApp = async () => {
      try {
        // Small delay to show loading state
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Always set GetStarted as initial route
        setInitialRouteName("GetStarted");
      } catch (error) {
        console.error("Error initializing app:", error);
        setInitialRouteName("GetStarted");
      } finally {
        setIsLoading(false);
      }
    };

    initializeApp();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#179C7D" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRouteName} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="GetStarted" component={GetStartedScreen} />
        <Stack.Screen name="Next" component={Next} />
        <Stack.Screen name="Next1" component={Next1} />
        <Stack.Screen name="Next2" component={Next2} />
        <Stack.Screen name="Next3" component={Next3} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Signup" component={SignupScreen} />
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Transfer" component={TransferScreen} />
        <Stack.Screen name="PayBills" component={PayBillsScreen} />
        <Stack.Screen name="EditProfile" component={EditProfileScreen} />
        <Stack.Screen name="MyQRCode" component={MyQRCodeScreen} />
        <Stack.Screen name="Settings" component={SettingsScreen} />
        <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
        <Stack.Screen name="TermsAndConditions" component={TermsAndConditionsScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="Help" component={HelpScreen} />
        <Stack.Screen name="SendFeedback" component={SendFeedbackScreen} />
        <Stack.Screen 
          name="TransferConfirmation" 
          component={TransferConfirmationScreen}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
