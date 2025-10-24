import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, Video } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import { Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function GetStartedScreen({ navigation }) {
  const [userStatus, setUserStatus] = useState(null);
  const [sound, setSound] = useState(null);

  useEffect(() => {
    checkUserStatus();
    playVoice();

    // Cleanup function to unload sound when component unmounts
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, []);

  const playVoice = async () => {
    try {
      const { sound: audioSound } = await Audio.Sound.createAsync(
        require('../assets/flowpay_voice.mp3'),
        { shouldPlay: true }
      );
      setSound(audioSound);
    } catch (error) {
      console.error('Error playing voice:', error);
    }
  };

  const checkUserStatus = async () => {
    try {
      // Check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // User is logged in, check if they have completed profile
        const { data: profile } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setUserStatus('logged_in');
        } else {
          setUserStatus('needs_profile');
        }
      } else {
        // Check if onboarding was completed
        const onboardingComplete = await AsyncStorage.getItem('flowpay_onboarding_complete');
        if (onboardingComplete === 'true') {
          setUserStatus('onboarding_complete');
        } else {
          setUserStatus('new_user');
        }
      }
    } catch (error) {
      console.error('Error checking user status:', error);
      setUserStatus('new_user');
    }
  };

  const handleGetStarted = () => {
    // Always navigate to nextScreen for onboarding flow
    navigation.navigate('Next');
  };

  const handleHaveAccount = () => {
    // Always navigate to the Login screen so the user must authenticate
    navigation.navigate('Login');
  };

  return (
    <View style={styles.container}>
      {/* Logo section */}
      <View style={styles.logoContainer}>
        <Image source={require('../assets/logo.png')} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Video section - positioned to overlap with button container */}
      <View style={styles.videoContainer}>
        <Video
          source={require('../assets/getstarted.mp4')}
          style={styles.video}
          resizeMode="contain"
          shouldPlay={true}
          isLooping={true}
          isMuted={true}
        />
      </View>

      {/* Buttons */}
      <LinearGradient
        colors={['#FFD966', '#FFBA3F', '#F9A825']} // Light yellow to darker yellow gradient
        style={styles.buttonContainer}
        start={{ x: 0.5, y: 0 }} // Start from top
        end={{ x: 0.5, y: 1 }}   // End at bottom
      >
        <TouchableOpacity 
          onPress={handleGetStarted}
          style={{ width: '100%' }}
        > 
          <LinearGradient
            colors={['#1AB896', '#179C7D', '#127A61']} // Light to dark green gradient for 3D effect
            style={styles.getStartedButton}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
          >
            <Text style={styles.getStartedText}>
              {userStatus === 'logged_in' ? 'CONTINUE TO APP' : 'GET STARTED'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity style={styles.haveAccountButton} onPress={handleHaveAccount}>
          <Text style={styles.haveAccountText}>I ALREADY HAVE AN ACCOUNT</Text>
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: 100, // Increased from 60 to push logo down
    width: '100%',
    marginBottom: 80, // Increased from 60 for more space
  },
  logo: {
    width: width * 0.99, // Increased from 0.65 to make bigger
    height: width * 0.99, // Increased from 0.65 to make bigger
    marginBottom: 5,
    paddingTop: 10,
  },
  tagline: {
    color: '#F9A825',
    fontSize: 14,
    fontStyle: 'italic',
  },
  videoContainer: {
    position: 'absolute',
    alignItems: 'center',
    bottom: 130, // Position the video to overlap with button container
    zIndex: 1, // Ensure video appears on top
  },
  video: {
    width: width * 0.85,
    height: width * 0.85,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    paddingTop: 40, // Reduced from 80 back to 70
    paddingBottom: 30, // Reduced from 40 to 30
    paddingHorizontal: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    position: 'absolute',
    bottom: 0,
    zIndex: 2,
  },
  getStartedButton: {
    width: '100%',
    borderRadius: 30,
    paddingVertical: 18, // Increased from 14 for bigger button
    alignItems: 'center',
    marginBottom: 20, // Increased from 15 for more spacing
    elevation: 8, // Enhanced shadow for 3D depth
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  getStartedText: {
    color: '#fff',
    fontSize: 18, // Increased from 16 for bigger text
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  haveAccountButton: {
    width: '100%',
    backgroundColor: 'transparent',
    borderRadius: 30,
    paddingVertical: 16, // Increased from 12 for bigger button
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#6B4800',
  },
  haveAccountText: {
    color: '#6B4800',
    fontSize: 16, // Increased from 14 for bigger text
    fontWeight: 'bold',
    letterSpacing: 0.5,
  },
});
