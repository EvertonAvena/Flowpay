import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
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
import { supabase } from '../supabase';


const { width } = Dimensions.get('window');
const CREDENTIALS_KEY = 'flowpay_user_credentials';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isBiometricSaved, setIsBiometricSaved] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hasAutoFilledCredentials, setHasAutoFilledCredentials] = useState(false);

  // Run on initial load
  useEffect(() => {
    checkBiometricAvailability();
    loadSavedCredentials();
  }, []);

  // Load saved email from previous login/signup
  const loadSavedCredentials = async () => {
    try {
      const savedCredentialsString = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (savedCredentialsString) {
        const savedCredentials = JSON.parse(savedCredentialsString);
        
        // Auto-populate email if available
        if (savedCredentials.email) {
          setEmail(savedCredentials.email);
          setHasAutoFilledCredentials(true);
        }
        
        console.log('Loaded saved email for auto-fill');
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

  // Use the fixed key for saving credentials (now includes supabase session tokens)
  const saveCredentials = async (userData, authSession) => {
    try {
      // If authSession wasn't provided, try to get current session from Supabase
      let sessionToSave = authSession ?? null;
      if (!sessionToSave) {
        try {
          const { data: currentSession } = await supabase.auth.getSession();
          sessionToSave = currentSession?.session ?? null;
        } catch (e) {
          console.warn('Could not read current supabase session:', e);
          sessionToSave = null;
        }
      }

      const credentials = {
        email: email,
        userData: userData || null,
        // Save only non-sensitive session metadata in AsyncStorage
        session: sessionToSave
          ? {
              expiresAt: sessionToSave.expires_at ?? null,
            }
          : null,
        isLoggedIn: true,
        timestamp: new Date().toISOString()
      };

      // Save non-sensitive data to AsyncStorage
      await AsyncStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));

      // Save sensitive tokens to SecureStore (refresh token + access token)
      if (sessionToSave?.refresh_token) {
        await SecureStore.setItemAsync('flowpay_refresh_token', sessionToSave.refresh_token, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
      }
      if (sessionToSave?.access_token) {
        await SecureStore.setItemAsync('flowpay_access_token', sessionToSave.access_token, { keychainAccessible: SecureStore.ALWAYS_THIS_DEVICE_ONLY });
      }

      const savedCheck = await AsyncStorage.getItem(CREDENTIALS_KEY);
      if (savedCheck) setIsBiometricSaved(true);
      console.log('Credentials saved (biometric):', !!savedCheck, sessionToSave ? 'tokens saved to SecureStore' : 'no session');
    } catch (error) {
      console.error('Error saving credentials:', error);
      Alert.alert('Storage Error', 'Could not save credentials for biometric login');
    }
  };

  // Login with email and password
  const loginWithPassword = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    try {
      setLoading(true);
      
      // Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) {
        Alert.alert('Login Failed', authError.message);
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('*')
        .eq('email', email)
        .single();

      if (profileError || !profile) {
        Alert.alert('Login Failed', 'Could not load user profile.');
        return;
      }

      // Save credentials (include supabase session tokens so biometric can restore session)
      await saveCredentials(profile, authData?.session ?? null);

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
        Alert.alert('Error', 'No saved credentials found. Please log in first.');
        return;
      }

      const { success } = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Login with fingerprint',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Password',
        cancelLabel: 'Cancel',
      });

      if (!success) {
        Alert.alert('Authentication Failed', 'Please try again or use your email and password to log in');
        return;
      }

      const savedCredentials = JSON.parse(savedCredentialsString);
      console.log('Biometric: loaded saved credentials', !!savedCredentials);

      // Read tokens from SecureStore
      const refreshToken = await SecureStore.getItemAsync('flowpay_refresh_token');
      const accessToken = await SecureStore.getItemAsync('flowpay_access_token');

      // Helper to show safe preview (don't log whole token)
      const tokenPreview = (t) => (t ? `${t.length} chars, start=${t.slice(0,6)}...` : 'null');
      console.log('Biometric tokens preview ->', { refresh: tokenPreview(refreshToken), access: tokenPreview(accessToken) });

      if (!refreshToken) {
        console.warn('No refresh token saved in SecureStore.');
        Alert.alert('No user found', 'Could not restore session. Please log in again.');
        return;
      }

      // Try to restore session using stored refresh token only (preferred)
      const { data: setData, error: setError } = await supabase.auth.setSession({
        refresh_token: refreshToken,
        // only include access_token if available
        access_token: accessToken ?? undefined,
      });

      if (setError) {
        console.warn('supabase.auth.setSession failed:', setError);
        // If token is invalid/expired/revoked, clear saved tokens to avoid repeated failed attempts
        try {
          await SecureStore.deleteItemAsync('flowpay_refresh_token');
          await SecureStore.deleteItemAsync('flowpay_access_token');
          await AsyncStorage.removeItem(CREDENTIALS_KEY);
          setIsBiometricSaved(false);
          console.log('Cleared saved biometric tokens due to failed restore.');
        } catch (e) {
          console.error('Error clearing saved tokens after failed restore:', e);
        }

        // Provide clearer message: usually means token was revoked (e.g. signOut was called)
        Alert.alert(
          'No user found',
          'Could not restore session (token invalid or revoked). Please log in again.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Confirm session/user exists
      const { data: userData, error: userError } = await supabase.auth.getUser();
      console.log('Biometric: getUser after setSession ->', { userData, userError });

      if (userError || !userData?.user) {
        console.warn('No user available after restoring session:', userError);
        // If restoration unexpectedly failed, clear saved values to force fresh login next time
        try {
          await SecureStore.deleteItemAsync('flowpay_refresh_token');
          await SecureStore.deleteItemAsync('flowpay_access_token');
          await AsyncStorage.removeItem(CREDENTIALS_KEY);
          setIsBiometricSaved(false);
        } catch (e) {
          console.error('Error clearing saved tokens after missing user:', e);
        }
        Alert.alert('No user found', 'Please log in again.');
        return;
      }

      // Success
      navigation.navigate('Main', { screen: 'Home' });
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
    loginWithPassword();
  };

  // Clear saved credentials
  const clearSavedCredentials = async () => {
    try {
      await AsyncStorage.removeItem(CREDENTIALS_KEY);
      setEmail('');
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
          Please enter your email and password
        </Text>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.labelRow}>
              <Text style={styles.label}>Email</Text>
              {email && (
                <TouchableOpacity 
                  style={styles.changeNumberButton}
                  onPress={clearSavedCredentials}
                >
                  <Ionicons name="swap-horizontal-outline" size={18} color="#1DB89A" />
                  <Text style={styles.changeNumberText}>Change Email</Text>
                </TouchableOpacity>
              )}
            </View>
            <View style={styles.phoneInputContainer}>
              <TextInput
                style={[
                  styles.input,
                  styles.emailInput,
                  hasAutoFilledCredentials && email && styles.autoFilledInput
                ]}
                value={email}
                onChangeText={(text) => {
                  setEmail(text.toLowerCase());
                  if (hasAutoFilledCredentials) {
                    setHasAutoFilledCredentials(false);
                  }
                }}
                placeholder="your@email.com"
                placeholderTextColor="#AAAAAA"
                keyboardType="email-address"
                autoComplete="email"
                autoCapitalize="none"
              />
              {email && email.trim() !== '' && (
                <TouchableOpacity 
                  style={styles.clearPhoneButton}
                  onPress={() => setEmail('')}
                >
                  <Ionicons name="close-circle" size={20} color="#999999" />
                </TouchableOpacity>
              )}
            </View>
            {hasAutoFilledCredentials && email && (
              <View style={styles.autoFillIndicator}>
                <Text style={styles.autoFillText}>� Saved email</Text>
              </View>
            )}
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                placeholder="Enter your password"
                placeholderTextColor="#AAAAAA"
                secureTextEntry={!showPassword}
                autoComplete="password"
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={24} 
                  color="#1DB89A" 
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword', { email })}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>
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
  emailInput: {
    paddingLeft: 15, // Remove the extra padding for +63 prefix when email
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