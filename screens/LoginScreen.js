import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import * as LocalAuthentication from 'expo-local-authentication';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');
const CREDENTIALS_KEY = 'flowpay_user_credentials';

export default function LoginScreen({ navigation }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [mpin, setMpin] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricSaved, setIsBiometricSaved] = useState(false);
  const [showMpin, setShowMpin] = useState(false);
  const [hasAutoFilledCredentials, setHasAutoFilledCredentials] = useState(false);

  // Run on initial load
  useEffect(() => {
    checkBiometricAvailability();
    loadSavedCredentials();
  }, []);

  // Load saved phone number from previous login/signup
  const loadSavedCredentials = async () => {
    try {
      const savedCredentialsString = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (savedCredentialsString) {
        const savedCredentials = JSON.parse(savedCredentialsString);
        
        // Auto-populate phone number if available
        if (savedCredentials.phoneNumber) {
          setPhoneNumber(savedCredentials.phoneNumber);
          setHasAutoFilledCredentials(true);
        }
        
        console.log('Loaded saved phone number for auto-fill');
      }
    } catch (error) {
      console.error('Error loading saved credentials:', error);
    }
  };

  // Run every time the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      checkBiometricAvailability();
    }, [])
  );

  // Check for biometric support and saved credentials
  const checkBiometricAvailability = async () => {
    try {
      // First check if device supports biometrics
      const compatible = await LocalAuthentication.hasHardwareAsync();
      setIsBiometricSupported(compatible);
      
      if (compatible) {
        // Check if user has enrolled biometrics
        const isEnrolled = await LocalAuthentication.isEnrolledAsync();
        
        // Explicitly check for credentials with the fixed key
        try {
          const credentialsString = await AsyncStorage.getItem(CREDENTIALS_KEY);
          
          // Set state based on both conditions
          if (credentialsString && isEnrolled) {
            setIsBiometricSaved(true);
          } else {
            setIsBiometricSaved(false);
          }
        } catch (storageError) {
          console.error("AsyncStorage error:", storageError);
          setIsBiometricSaved(false);
        }
      }
    } catch (error) {
      console.error('Error checking biometrics:', error);
      setIsBiometricSaved(false);
    }
  };

  // Use the fixed key for saving credentials
  const saveCredentials = async (userData) => {
    try {
      // Create credentials object for phone auth
      const credentials = {
        phoneNumber: phoneNumber,
        userData: userData,
        isLoggedIn: true,
        timestamp: new Date().toISOString()
      };
      
      // Convert to string and save
      const credentialsString = JSON.stringify(credentials);
      await AsyncStorage.setItem(CREDENTIALS_KEY, credentialsString);
      
      // Verify credentials were saved by reading them back
      const savedCheck = await AsyncStorage.getItem(CREDENTIALS_KEY);
      
      if (savedCheck) {
        setIsBiometricSaved(true);
      }
    } catch (error) {
      console.error('Error saving credentials:', error);
      Alert.alert("Storage Error", "Could not save credentials for biometric login");
    }
  };

  // Login with phone number and MPIN
  const loginWithMPIN = async () => {
    if (!phoneNumber || !mpin) {
      Alert.alert('Error', 'Please enter your phone number and MPIN');
      return;
    }

    if (mpin.length !== 6) {
      Alert.alert('Error', 'MPIN must be 6 digits');
      return;
    }

    try {
      setLoading(true);
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Get user profile by phone number
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .eq('phone', formattedPhone)
        .single();

      if (profileError || !profile) {
        Alert.alert('Login Failed', 'Phone number not found. Please check your number or sign up.');
        return;
      }

      // Check MPIN
      if (profile.mpin !== mpin) {
        Alert.alert('Login Failed', 'Invalid MPIN. Please try again.');
        return;
      }

      // Login successful - sign in with email and a temporary session
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: `TempPass123!${profile.id}` // Use a password that meets requirements
      });

      if (authError) {
        // If auth fails, we'll still proceed with the profile data
        console.log('Auth warning:', authError.message);
      }

      await saveCredentials(profile);

      // Mark onboarding as complete
      await AsyncStorage.setItem('flowpay_onboarding_complete', 'true');

      // Navigate to home
      Alert.alert('Login Successful', 'Welcome back to FlowPay!', [
        { 
          text: 'OK', 
          onPress: () => {
            navigation.navigate('Main', { screen: 'Home' });
          }
        }
      ]);
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert('Error', 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBiometricAuth = async () => {
    try {
      if (!isBiometricSupported) {
        Alert.alert('Error', 'Biometric authentication is not supported on this device');
        return;
      }

      const savedCredentialsString = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (!savedCredentialsString) {
        Alert.alert('Error', 'No saved credentials found. Please log in with your phone number and MPIN first.');
        return;
      }

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with fingerprint',
        disableDeviceFallback: false,
        fallbackLabel: 'Use MPIN',
        cancelLabel: 'Cancel',
      });

      if (success) {
        const savedCredentials = JSON.parse(savedCredentialsString);

        // For phone auth, we need to get the current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError || !session) {
          Alert.alert('Session Expired', 'Please log in again with your phone number.');
          return;
        }

        // Now navigate to home
        navigation.navigate('Main', { screen: 'Home' });
      } else {
        Alert.alert('Authentication Failed', 'Please try again or use your phone number and MPIN to log in');
      }
    } catch (error) {
      console.error('Biometric auth error:', error);
      Alert.alert('Error', 'An error occurred during biometric authentication');
    }
  };

  // Format phone number for international format
  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Handle different country formats
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      return `+63${cleaned}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('09')) {
      return `+63${cleaned.substring(1)}`;
    } else if (cleaned.length === 13 && cleaned.startsWith('639')) {
      return `+${cleaned}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('63')) {
      return `+${cleaned}`;
    }
    
    return phone.startsWith('+') ? phone : `+${cleaned}`;
  };

  // Handle the main login action
  const handleLogin = () => {
    loginWithMPIN();
  };

  // Clear saved credentials
  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_KEY);
      setPhoneNumber('');
      setHasAutoFilledCredentials(false);
      Alert.alert('Cleared', 'Saved login information has been cleared.');
    } catch (error) {
      console.error('Error clearing credentials:', error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={60} // Adjust this value if you have a header
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        {/* Gradient Header */}
        <LinearGradient
          colors={['#1DB89A', '#179C7D', '#127A61']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-undo-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.loginTitle}>LOGIN</Text>
              <Text style={styles.headerSubtitle}>Welcome Back!</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../assets/FlowPay_NoBg_Logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.subtitle}>
          Please enter your phone number and MPIN
        </Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Phone Number Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Phone Number</Text>
              {phoneNumber && (
                <TouchableOpacity 
                  style={styles.changeNumberButton}
                  onPress={clearSavedCredentials}
                >
                  <Ionicons name="swap-horizontal-outline" size={18} color="#1DB89A" />
                  <Text style={styles.changeNumberText}>Change Number</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.phoneInputContainer}>
              <Text style={styles.phonePrefix}>+63</Text>
              <TextInput
                style={[
                  styles.input,
                  styles.phoneInput,
                  hasAutoFilledCredentials && phoneNumber && styles.autoFilledInput
                ]}
                value={phoneNumber}
                onChangeText={(text) => {
                  // Extract only digits from the input
                  let cleaned = text.replace(/\D/g, '');
                  
                  // Remove leading country code if present (63)
                  if (cleaned.startsWith('63')) {
                    cleaned = cleaned.substring(2);
                  }
                  
                  // If user types 0 at the start, remove it
                  if (cleaned.startsWith('0')) {
                    cleaned = cleaned.substring(1);
                  }
                  
                  // Limit to 10 digits (Philippine mobile number)
                  cleaned = cleaned.slice(0, 10);
                  
                  // If no digits, set empty
                  if (cleaned.length === 0) {
                    setPhoneNumber('');
                    return;
                  }
                  
                  // Format as XXXX XXX XXXX (without +63 since it's in prefix)
                  let formatted = '';
                  if (cleaned.length > 0) {
                    formatted += cleaned.substring(0, 4);
                  }
                  if (cleaned.length > 4) {
                    formatted += ' ' + cleaned.substring(4, 7);
                  }
                  if (cleaned.length > 7) {
                    formatted += ' ' + cleaned.substring(7, 10);
                  }
                  
                  setPhoneNumber(formatted);
                  
                  // Reset auto-fill indicator when user starts typing
                  if (hasAutoFilledCredentials && formatted !== phoneNumber) {
                    setHasAutoFilledCredentials(false);
                  }
                }}
                placeholder="9123 456 789"
                placeholderTextColor="#AAAAAA"
                keyboardType="phone-pad"
                autoComplete="tel"
              />
              {phoneNumber && phoneNumber.trim() !== '' && (
                <TouchableOpacity 
                  style={styles.clearPhoneButton}
                  onPress={() => setPhoneNumber('')}
                >
                  <Ionicons name="close-circle" size={20} color="#999999" />
                </TouchableOpacity>
              )}
            </View>
            {hasAutoFilledCredentials && phoneNumber && (
              <View style={styles.autoFillIndicator}>
                <Text style={styles.autoFillText}>📱 Saved phone number</Text>
              </View>
            )}
          </View>

          {/* MPIN Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>MPIN (6 digits)</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={mpin}
                onChangeText={setMpin}
                placeholder="Enter your 6-digit MPIN"
                placeholderTextColor="#AAAAAA"
                secureTextEntry={!showMpin}
                keyboardType="number-pad"
                maxLength={6}
                autoComplete="password"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowMpin(!showMpin)}
              >
                <Ionicons 
                  name={showMpin ? 'eye-outline' : 'eye-off-outline'} 
                  size={24} 
                  color="#1DB89A" 
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity 
            style={styles.loginButton} 
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" size="small" />
            ) : (
              <Text style={styles.loginButtonText}>LOGIN</Text>
            )}
          </TouchableOpacity>

          {/* Sign Up Link */}
          <View style={styles.signupContainer}>
            <Text style={styles.signupPromptText}>Don't have an account? </Text>
            <TouchableOpacity 
              onPress={() => navigation.navigate('Signup')}
            >
              <Text style={styles.signupLinkText}>Sign Up</Text>
            </TouchableOpacity>
          </View>
          
          {/* Fingerprint login */}
          {isBiometricSupported && isBiometricSaved && (
            <TouchableOpacity
              style={styles.fingerprintContainer}
              onPress={handleBiometricAuth}
            >
              <Ionicons name="finger-print" size={50} color="#179C7D" />
              <Text style={styles.fingerprintText}>Login with fingerprint</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  headerGradient: {
    paddingTop: 80,
    paddingBottom: 35,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 38, // Balance the back button width
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: 2,
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E0F7F4',
    fontWeight: '500',
  },
  backButton: {
    padding: 10,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: -10,
    marginBottom: -10,
  },
  logo: {
    width: width * 0.55,
    height: width * 0.55,
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    marginBottom: 15,
    paddingHorizontal: 20,
  },
  noticeContainer: {
    backgroundColor: '#FFF9E6',
    borderLeftWidth: 4,
    borderLeftColor: '#FFBA3F',
    marginHorizontal: 24,
    marginBottom: 20,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
  },
  noticeText: {
    fontSize: 14,
    color: '#8B6914',
    lineHeight: 20,
  },
  noticeHighlight: {
    fontWeight: 'bold',
    color: '#B8860B',
  },
  noticeLink: {
    fontWeight: '600',
    color: '#179C7D',
    textDecorationLine: 'underline',
  },
  // Removed biometricButton style
  // Added new fingerprint styles
  fingerprintContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 30,
    paddingVertical: 20,
    paddingHorizontal: 20,
    backgroundColor: '#E8F8F5',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#179C7D',
  },
  fingerprintText: {
    color: '#179C7D',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 10,
  },
  fingerprintIcon: {
    fontSize: 18,
  },
  formContainer: {
    paddingHorizontal: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  phoneInputContainer: {
    position: 'relative',
  },
  phonePrefix: {
    position: 'absolute',
    left: 15,
    top: '45%',
    transform: [{ translateY: -8 }],
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
    zIndex: 1,
    backgroundColor: '#FFFFFF',
    paddingRight: 5,
  },
  phoneInput: {
    paddingLeft: 50,
    paddingRight: 40,
    flex: 1,
  },
  clearPhoneButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -15 }],
    padding: 5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333333',
  },
  changeNumberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F8F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  changeNumberText: {
    fontSize: 12,
    color: '#1DB89A',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#D0D0D0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  passwordContainer: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: '40%',
    transform: [{ translateY: -12 }],
    padding: 5,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 25,
  },
  forgotPasswordText: {
    color: '#179C7D',
    fontSize: 14,
  },
  loginButton: {
    backgroundColor: '#179C7D',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10, // Reduced from 30 to 10 to make room for fingerprint
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  separatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 30,
    marginTop: 10, // Added margin top for spacing after fingerprint
  },
  separator: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  separatorText: {
    marginHorizontal: 10,
    color: '#999',
    fontSize: 14,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signupText: {
    color: '#6B4800',
    fontSize: 14,
  },
  signupLink: {
    color: '#179C7D',
    fontWeight: 'bold',
    fontSize: 14,
  },
  // New styles for phone/OTP authentication
  otpHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backButton: {
    marginRight: 15,
  },
  otpHeaderText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#179C7D',
  },
  otpSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 8,
    fontWeight: 'bold',
  },
  resendButton: {
    alignSelf: 'center',
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#179C7D',
    fontSize: 14,
    fontWeight: '600',
  },
  resendButtonTextDisabled: {
    color: '#999',
  },
  switchModeButton: {
    alignSelf: 'center',
    marginTop: 15,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  switchModeText: {
    color: '#179C7D',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  signupPromptText: {
    color: '#666',
    fontSize: 14,
  },
  signupLinkText: {
    color: '#179C7D',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  autoFilledInput: {
    borderColor: '#179C7D',
    borderWidth: 2,
    backgroundColor: '#F0FDF4',
  },
  autoFillIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    paddingHorizontal: 4,
  },
  autoFillText: {
    fontSize: 12,
    color: '#059669',
    fontWeight: '500',
    flex: 1,
  },
  clearButton: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    backgroundColor: '#FEE2E2',
    borderRadius: 4,
    marginLeft: 8,
  },
  clearButtonText: {
    fontSize: 10,
    color: '#DC2626',
    fontWeight: '600',
  },
});