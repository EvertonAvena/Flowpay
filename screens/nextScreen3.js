import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Video } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function NextScreen3({ navigation }) {
  // Animated values - start visible
  const scaleAnim = useRef(new Animated.Value(1)).current;   // start at full size
  const opacityAnim = useRef(new Animated.Value(1)).current; // start visible

  useEffect(() => {
    // Reset to visible state immediately when component mounts
    scaleAnim.setValue(1);
    opacityAnim.setValue(1);
  }, []);

  return (
    <View style={styles.container}>
      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => navigation && navigation.goBack()}
      >
        <Ionicons name="arrow-undo-outline" size={28} color="#1DB89A" />
      </TouchableOpacity>

      {/* Main Content - Logo with fade-in bounce */}
      <View style={styles.illustrationContainer}>
        <Animated.View
          style={[
            styles.videoWrapper, 
            { 
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Video
            source={require('../assets/continue4.mp4')}
            style={styles.illustration}
            resizeMode="contain"
            shouldPlay={true}
            isLooping={true}
            isMuted={true}
          />
        </Animated.View>
      </View>

            {/* Bottom Container with Progress Dots and Continue Button */}
      <View style={styles.bottomContainer}>
        {/* Progress Dots */}
        <View style={styles.dotsContainer}>
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={styles.dot} />
          <View style={[styles.dot, styles.activeDot]} />
        </View>

        {/* Continue Button */}
        <TouchableOpacity 
          style={styles.continueButton}
          onPress={() => navigation && navigation.navigate('Login')}
        >
          <Text style={styles.continueText}>CONTINUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    padding: 10,
  },
  illustrationContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  videoWrapper: {
    width: width * 0.95,
    height: width * 1.2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustration: {
    width: '100%',
    height: '100%',
  },
  textContainer: {
    marginTop: 40,
    alignItems: 'center',
  },
  blueText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#179C7D',
    marginBottom: 5,
  },
  orangeText: {
    fontSize: 20,
    color: '#FFBA3F',
    textAlign: 'center',
    lineHeight: 28,
  },
  bottomContainer: {
    width: '100%',
    position: 'absolute',
    bottom: 0,
    backgroundColor: '#FFBA3F',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  dotsContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#fff',
    marginHorizontal: 8,
  },
  activeDot: {
    backgroundColor: '#179C7D',
    width: 12,
    height: 12,
  },
  continueButton: {
    width: '100%',
    borderWidth: 2,
    borderColor: '#6B4800',
    borderRadius: 30,
    paddingVertical: 15,
    alignItems: 'center',
  },
  continueText: {
    color: '#6B4800',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
