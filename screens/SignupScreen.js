import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useState, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function SignupScreen({ navigation }) {
  const [step, setStep] = useState(1); // 1 = phone input, 2 = full form
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState(''); // Added email state
  const [mpin, setMpin] = useState(''); // MPIN instead of password
  const [confirmMpin, setConfirmMpin] = useState(''); // Confirm MPIN
  const [secureTextEntry, setSecureTextEntry] = useState(true); // For toggling MPIN visibility
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [address, setAddress] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Timer for OTP resend
  useEffect(() => {
    let interval = null;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer(timer => timer - 1);
      }, 1000);
    } else if (resendTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || date;
    setShowDatePicker(Platform.OS === 'ios');
    setDate(currentDate);
    
    const formattedDate = currentDate.toLocaleDateString('en-US', {
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit'
    });
    
    setBirthdate(formattedDate);
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Format phone number for display (with spaces)
  const formatPhoneForDisplay = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    // Format Philippine numbers with spaces
    if (cleaned.length >= 11 && cleaned.startsWith('09')) {
      // 09123456789 -> 0912 345 6789
      return cleaned.replace(/(\d{4})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleaned.length >= 10 && cleaned.startsWith('9')) {
      // 9123456789 -> 912 345 6789
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    } else if (cleaned.length >= 10) {
      // Other 10+ digit numbers -> XXX XXX XXXX
      return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    return phone;
  };

  // Format phone number for international format (for API calls)
  const formatPhoneNumber = (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');
    
    console.log('Input phone:', phone);
    console.log('Cleaned phone:', cleaned);
    
    // Handle US numbers (for testing with your Twilio number)
    if (cleaned.length === 10 && !cleaned.startsWith('0') && !cleaned.startsWith('9')) {
      const formatted = `+1${cleaned}`;
      console.log('US format:', formatted);
      return formatted;
    }
    
    // Handle US numbers with country code
    if (cleaned.length === 11 && cleaned.startsWith('1')) {
      const formatted = `+${cleaned}`;
      console.log('US with code format:', formatted);
      return formatted;
    }
    
    // Add Philippine country code if not present
    if (cleaned.length === 10 && cleaned.startsWith('9')) {
      const formatted = `+63${cleaned}`;
      console.log('Philippine format:', formatted);
      return formatted;
    } else if (cleaned.length === 11 && cleaned.startsWith('09')) {
      const formatted = `+63${cleaned.substring(1)}`;
      console.log('Philippine 09 format:', formatted);
      return formatted;
    } else if (cleaned.length === 13 && cleaned.startsWith('639')) {
      const formatted = `+${cleaned}`;
      console.log('Philippine with code format:', formatted);
      return formatted;
    } else if (cleaned.length === 12 && cleaned.startsWith('63')) {
      const formatted = `+${cleaned}`;
      console.log('Philippine 63 format:', formatted);
      return formatted;
    }
    
    // If it already has a + sign, keep it
    if (phone.startsWith('+')) {
      console.log('Already formatted:', phone);
      return phone;
    }
    
    // Return as is if format is unclear
    console.log('Unknown format, returning as is:', phone);
    return phone;
  };

  // Send OTP to phone number for verification
  const sendOTP = async () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }

    try {
      setLoading(true);
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      console.log('=== SMS SENDING DEBUG ===');
      console.log('Original phone input:', phoneNumber);
      console.log('Formatted phone:', formattedPhone);
      console.log('About to send SMS to:', formattedPhone);
      
      // Send OTP via Supabase Auth
      const { error } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          channel: 'sms',
          data: {
            phone: formattedPhone
          }
        }
      });

      console.log('Supabase SMS result - error:', error);

      if (error) {
        console.log('SMS Error Details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        
        Alert.alert(
          'Phone Verification Unavailable', 
          'Unable to send verification code at this time. You can continue without phone verification.',
          [
            { 
              text: 'Continue Without Verification', 
              onPress: () => {
                setShowOtpInput(false);
                setStep(2);
              }
            },
            { text: 'Try Again', style: 'cancel' }
          ]
        );
        return;
      }

      console.log('SMS sent successfully to:', formattedPhone);
      setShowOtpInput(true);
      setResendTimer(60);
      Alert.alert('OTP Sent', `Verification code sent to ${formattedPhone}`);
    } catch (error) {
      console.error('Send OTP error:', error);
      Alert.alert(
        'Phone Verification Unavailable', 
        'Unable to send verification code at this time. You can continue without phone verification.',
        [
          { 
            text: 'Continue Without Verification', 
            onPress: () => {
              setShowOtpInput(false);
              setStep(2);
            }
          },
          { text: 'Try Again', style: 'cancel' }
        ]
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP
  const verifyOTP = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the verification code');
      return;
    }

    try {
      setOtpLoading(true);
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Verify OTP with Supabase
      const { data, error } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: otp,
        type: 'sms'
      });

      if (error || !data.user) {
        Alert.alert('Invalid Code', 'Please check your verification code and try again.');
        return;
      }

      // Phone verified, proceed to step 2
      Alert.alert('Phone Verified!', 'Your phone number has been verified. Please complete your profile.', [
        { text: 'Continue', onPress: () => setStep(2) }
      ]);
    } catch (error) {
      console.error('Verify OTP error:', error);
      Alert.alert('Error', 'Verification failed. Please try again.');
    } finally {
      setOtpLoading(false);
    }
  };

  // Resend OTP
  const resendOTP = async () => {
    if (resendTimer > 0) return;
    await sendOTP();
  };

  // Go back to phone input
  const goBackToPhone = () => {
    setShowOtpInput(false);
    setOtp('');
    setResendTimer(0);
  };

  // Handle phone number submission
  const handlePhoneSubmit = () => {
    if (!phoneNumber) {
      Alert.alert('Error', 'Please enter your phone number');
      return;
    }
    sendOTP();
  };

  const handleSignUp = async () => {
    // Basic validation
    if (!firstName || !lastName || !username || !email || !mpin || !phoneNumber || !address || !birthdate) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    
    // Email validation
    if (!validateEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    // MPIN validation - must be exactly 6 digits
    if (mpin.length !== 6 || !/^\d{6}$/.test(mpin)) {
      Alert.alert('Error', 'MPIN must be exactly 6 digits');
      return;
    }
    
    // Confirm MPIN
    if (mpin !== confirmMpin) {
      Alert.alert('Error', 'MPINs do not match');
      return;
    }
    
    try {
      setLoading(true);
      
      // Format birthdate for PostgreSQL (YYYY-MM-DD)
      const formattedDate = new Date(date).toISOString().split('T')[0];
      const formattedPhone = formatPhoneNumber(phoneNumber);
      
      // Step 1: Create Supabase Auth user with email and secure temporary password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: `TempPass123!${Date.now()}`, // Secure temporary password that meets requirements
        options: {
          data: {
            full_name: `${firstName} ${lastName}`,
            phone: formattedPhone,
          }
        }
      });
      
      if (authError) {
        console.error('Error creating auth user:', authError);
        Alert.alert('Signup Error', authError.message);
        return;
      }
      
      if (!authData.user) {
        Alert.alert('Error', 'Failed to create user account');
        return;
      }
      
      // Step 2: Create profile in the profile table with MPIN
      const { data: profileData, error: profileError } = await supabase
        .from('profile')
        .insert([
          {
            id: authData.user.id,
            fullname: `${firstName} ${lastName}`,
            username: username,
            email: email,
            phone: formattedPhone,
            address: address,
            birthdate: formattedDate,
            mpin: mpin // Store MPIN in profile
          }
        ])
        .select();

      if (profileError) {
        console.error('Profile creation error:', profileError);
        Alert.alert('Error', `Failed to create profile: ${profileError.message}`);
        return;
      }      console.log('User created:', { auth: authData, profile: profileData });
      
      // Save credentials for easy login
      const credentials = {
        phoneNumber: formattedPhone,
        email: email,
        userData: profileData[0],
        isLoggedIn: true,
        timestamp: new Date().toISOString()
      };
      await AsyncStorage.setItem('flowpay_user_credentials', JSON.stringify(credentials));
      
      // Mark onboarding as complete
      await AsyncStorage.setItem('flowpay_onboarding_complete', 'true');
      
      Alert.alert(
        'Success', 
        'Your account has been created successfully! You can now log in with your phone number and MPIN.',
        [{ text: 'OK', onPress: () => navigation.navigate('Login') }]
      );
      
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
        {/* Header with Gradient */}
        <LinearGradient
          colors={['#1DB89A', '#179C7D', '#127A61']}
          style={styles.headerGradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => {
                if (step === 2) {
                  setStep(1); // Go back to phone step
                } else {
                  navigation.goBack(); // Go back to previous screen
                }
              }}
            >
              <Ionicons name="arrow-undo-outline" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.signUpTitle}>SIGN UP</Text>
              <Text style={styles.headerSubtitle}>
                {step === 1 ? 'Verify Phone Number' : 'Create Account'}
              </Text>
            </View>
          </View>
        </LinearGradient>

        {step === 1 ? (
          // Step 1: Phone Number Verification
          <>
            <Text style={styles.subtitle}>
              {showOtpInput ? 'Enter verification code' : 'Enter your phone number to get started'}
            </Text>

            <View style={styles.form}>
              {!showOtpInput ? (
                // Phone Number Input
                <>
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Phone Number</Text>
                    <TextInput
                      style={styles.input}
                      value={formatPhoneForDisplay(phoneNumber)}
                      onChangeText={(text) => {
                        // Remove spaces and store clean number
                        const cleanNumber = text.replace(/\s/g, '');
                        setPhoneNumber(cleanNumber);
                      }}
                      placeholder="0912 345 6789"
                      placeholderTextColor="#CCCCCC"
                      keyboardType="phone-pad"
                      autoComplete="tel"
                      maxLength={13} // 0912 345 6789 = 13 chars with spaces
                    />
                  </View>

                  <Text style={styles.phoneHelpText}>
                    Try SMS verification or skip to continue without verification
                  </Text>

                  <TouchableOpacity 
                    style={styles.continueButton} 
                    onPress={handlePhoneSubmit}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.continueButtonText}>SEND CODE</Text>
                    )}
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.skipButton} 
                    onPress={() => {
                      setShowOtpInput(false);
                      setStep(2);
                    }}
                  >
                    <Text style={styles.skipButtonText}>Skip Phone Verification</Text>
                  </TouchableOpacity>
                </>
              ) : (
                // OTP Input
                <>
                  <Text style={styles.otpSubtext}>
                    Enter the 6-digit code sent to {formatPhoneNumber(phoneNumber)}
                  </Text>
                  
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Verification Code</Text>
                    <TextInput
                      style={[styles.input, styles.otpInput]}
                      value={otp}
                      onChangeText={setOtp}
                      placeholder="000000"
                      placeholderTextColor="#AAAAAA"
                      keyboardType="number-pad"
                      maxLength={6}
                      autoComplete="sms-otp"
                    />
                  </View>
                  
                  <TouchableOpacity 
                    style={[styles.resendButton, resendTimer > 0 && styles.resendButtonDisabled]}
                    onPress={resendOTP}
                    disabled={resendTimer > 0}
                  >
                    <Text style={[styles.resendButtonText, resendTimer > 0 && styles.resendButtonTextDisabled]}>
                      {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.continueButton} 
                    onPress={verifyOTP}
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={styles.continueButtonText}>VERIFY CODE</Text>
                    )}
                  </TouchableOpacity>
                </>
              )}
            </View>
          </>
        ) : (
          // Step 2: Full Registration Form
          <>
            <Text style={styles.subtitle}>Please fill in your details</Text>

            {/* Form */}
            <View style={styles.form}>
              <View style={styles.inputRow}>
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.inputLabel}>First Name</Text>
                  <TextInput
                    style={styles.input}
                    value={firstName}
                    onChangeText={setFirstName}
                    placeholder="John"
                    placeholderTextColor="#CCCCCC"
                  />
                </View>
                
                <View style={[styles.inputContainer, styles.halfInput]}>
                  <Text style={styles.inputLabel}>Last Name</Text>
                  <TextInput
                    style={styles.input}
                    value={lastName}
                    onChangeText={setLastName}
                    placeholder="Doe"
                    placeholderTextColor="#CCCCCC"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.input}
                  value={username}
                  onChangeText={setUsername}
                  placeholder="johndoe123"
                  placeholderTextColor="#CCCCCC"
                  autoCapitalize="none"
                />
              </View>

              {/* Email Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email Address</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="johndoe@example.com"
                  placeholderTextColor="#CCCCCC"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              {/* MPIN Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>MPIN (6 digits)</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.input, styles.passwordInput]}
                    value={mpin}
                    onChangeText={setMpin}
                    placeholder="Enter 6-digit MPIN"
                    placeholderTextColor="#AAAAAA"
                    secureTextEntry={secureTextEntry}
                    keyboardType="number-pad"
                    maxLength={6}
                    autoComplete="password"
                  />
                  <TouchableOpacity 
                    style={styles.eyeIcon}
                    onPress={() => setSecureTextEntry(!secureTextEntry)}
                  >
                    <Text style={styles.eyeIconText}>{secureTextEntry ? '👁️‍🗨️' : '👁️'}</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm MPIN Field */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Confirm MPIN</Text>
                <TextInput
                  style={styles.input}
                  value={confirmMpin}
                  onChangeText={setConfirmMpin}
                  placeholder="Re-enter your 6-digit MPIN"
                  placeholderTextColor="#AAAAAA"
                  secureTextEntry={true}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Address</Text>
                <TextInput
                  style={styles.input}
                  value={address}
                  onChangeText={setAddress}
                  placeholder="123 Main St, City, State, Zip"
                  placeholderTextColor="#CCCCCC"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Date of Birth</Text>
                <View style={styles.dateContainer}>
                  <TextInput
                    style={[styles.input, styles.dateInput]}
                    value={birthdate}
                    onChangeText={setBirthdate}
                    placeholder="MM/DD/YYYY"
                    placeholderTextColor="#CCCCCC"
                  />
                  <TouchableOpacity 
                    style={styles.datePickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={styles.datePickerButtonText}>📅</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {showDatePicker && (
                <DateTimePicker
                  value={date}
                  mode="date"
                  display="default"
                  onChange={handleDateChange}
                  maximumDate={new Date()}
                />
              )}
            </View>

            <TouchableOpacity 
              style={styles.signupButton} 
              onPress={handleSignUp}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.signupButtonText}>CREATE ACCOUNT</Text>
              )}
            </TouchableOpacity>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 40,
  },
  headerGradient: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    marginBottom: 30,
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
    marginRight: 38, // Balance the back button width for perfect centering
  },
  signUpTitle: {
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
  subtitle: {
    fontSize: 16,
    color: '#FFBA3F',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  form: {
    paddingHorizontal: 20,
  },
  inputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  inputContainer: {
    marginBottom: 20,
  },
  halfInput: {
    width: '48%',
  },
  inputLabel: {
    fontSize: 14,
    marginBottom: 8,
    color: '#6B4800',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#F9F9F9',
  },
  // New style for password container
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  eyeIconText: {
    fontSize: 20,
    color: '#666',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateInput: {
    flex: 1,
  },
  datePickerButton: {
    padding: 12,
    marginLeft: 10,
    backgroundColor: '#F9F9F9',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  datePickerButtonText: {
    fontSize: 20,
  },
  signupButton: {
    backgroundColor: '#179C7D',
    borderRadius: 30,
    paddingVertical: 15,
    marginHorizontal: 20,
    alignItems: 'center',
    marginTop: 20,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#6B4800',
  },
  loginLink: {
    color: '#179C7D',
    fontWeight: 'bold',
  },
  phoneHelpText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 20,
  },
  continueButton: {
    backgroundColor: '#179C7D',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  otpSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  otpInput: {
    textAlign: 'center',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 3,
  },
  resendButton: {
    backgroundColor: 'transparent',
    paddingVertical: 10,
    alignItems: 'center',
    marginBottom: 20,
  },
  resendButtonDisabled: {
    opacity: 0.5,
  },
  resendButtonText: {
    color: '#179C7D',
    fontSize: 14,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  resendButtonTextDisabled: {
    color: '#999',
    textDecorationLine: 'none',
  },
  skipButton: {
    backgroundColor: 'transparent',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#179C7D',
  },
  skipButtonText: {
    color: '#179C7D',
    fontSize: 14,
    fontWeight: '600',
  },
});