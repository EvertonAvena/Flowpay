import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect, useCallback } from 'react';
import { CameraView, Camera } from 'expo-camera';
import { useFocusEffect } from '@react-navigation/native';
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';
import { supabase } from '../supabase';
import {
    Dimensions,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Alert,
    ScrollView,
    TextInput,
    Image,
    Animated
} from 'react-native';

const { width } = Dimensions.get('window');

export default function QRScreen({ navigation }) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [profile, setProfile] = useState(null);
  const [requestAmount, setRequestAmount] = useState('');
  const [loading, setLoading] = useState(true);
  const [processingImage, setProcessingImage] = useState(false);
  const [showGenerateQR, setShowGenerateQR] = useState(false);
  const [isFocused, setIsFocused] = useState(true);
  const [cameraKey, setCameraKey] = useState(0); // Force camera remount
  const [cameraReady, setCameraReady] = useState(false);

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profileData, error } = await supabase
            .from('profile')
            .select('fullname, username, email, id')
            .eq('id', user.id)
            .single();
          
          if (profileData && !error) {
            setProfile(profileData);
          }
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
      setLoading(false);
    };

    getCameraPermissions();
    fetchProfile();
  }, []);

  // Handle screen focus to properly manage camera lifecycle
  useFocusEffect(
    useCallback(() => {
      // Screen is focused
      setIsFocused(true);
      setScanned(false); // Reset scanned state when coming back to screen
      setCameraReady(false); // Reset camera ready state
      
      // Small delay to ensure proper camera initialization
      const timer = setTimeout(() => {
        setCameraKey(prev => prev + 1); // Force camera remount for fresh start
        setCameraReady(true);
      }, 100);
      
      return () => {
        // Screen is unfocused
        setIsFocused(false);
        setCameraReady(false);
        clearTimeout(timer);
      };
    }, [])
  );

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    
    try {
      // Try to parse the QR code data as JSON (for payment QRs)
      const qrData = JSON.parse(data);
      
      if (qrData.type === 'payment' && qrData.recipientId && qrData.recipientName) {
        Alert.alert(
          'Payment QR Code Detected',
          `Send money to: ${qrData.recipientName}\nAmount: ${qrData.amount ? `₱${qrData.amount}` : 'Not specified'}`,
          [
            {
              text: 'Cancel',
              onPress: () => setScanned(false)
            },
            {
              text: 'Send Money',
              onPress: () => {
                setScanned(false);
                navigation.navigate('Transfer', {
                  recipientId: qrData.recipientId,
                  recipientName: qrData.recipientName,
                  amount: qrData.amount || ''
                });
              }
            }
          ]
        );
      } else {
        // Generic QR code
        Alert.alert(
          'QR Code Scanned',
          `Data: ${data}`,
          [
            { text: 'Scan Again', onPress: () => setScanned(false) },
            { text: 'OK', onPress: () => setScanned(false) }
          ]
        );
      }
    } catch (error) {
      // Not a JSON QR code, treat as generic
      Alert.alert(
        'QR Code Scanned',
        `Type: ${type}\nData: ${data}`,
        [
          { text: 'Scan Again', onPress: () => setScanned(false) },
          { text: 'OK', onPress: () => setScanned(false) }
        ]
      );
    }
  };

  const generateQRData = () => {
    if (!profile) return '';
    
    const qrData = {
      type: 'payment',
      recipientId: profile.id,
      recipientName: profile.fullname || profile.username || profile.email,
      amount: requestAmount || null
    };
    
    return JSON.stringify(qrData);
  };

  const scanQRFromImage = async (imageUri) => {
    try {
      // For now, we'll show a message that the image was processed
      // and offer to enter QR data manually or use the camera instead
      console.log('Processing image for QR code:', imageUri);
      
      // Since expo-barcode-scanner has compatibility issues,
      // we'll provide alternative options to the user
      return null; // This will trigger the "no QR found" dialog with alternatives
    } catch (error) {
      console.error('QR scan error:', error);
      return null;
    }
  };

  const processQRFromImage = (qrData) => {
    try {
      // Try to parse the QR code data as JSON (for payment QRs)
      const parsedData = JSON.parse(qrData);
      
      if (parsedData.type === 'payment' && parsedData.recipientId && parsedData.recipientName) {
        Alert.alert(
          'Payment QR Code Detected',
          `Send money to: ${parsedData.recipientName}\nAmount: ${parsedData.amount ? `₱${parsedData.amount}` : 'Not specified'}`,
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Send Money',
              onPress: () => {
                navigation.navigate('Transfer', {
                  recipientId: parsedData.recipientId,
                  recipientName: parsedData.recipientName,
                  amount: parsedData.amount || ''
                });
              }
            }
          ]
        );
      } else {
        // Generic QR code
        Alert.alert(
          'QR Code Found',
          `Data: ${qrData}`,
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      // Not a JSON QR code, treat as generic
      Alert.alert(
        'QR Code Found',
        `Data: ${qrData}`,
        [{ text: 'OK' }]
      );
    }
  };

  const pickImageFromGallery = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Permission Required',
          'FlowPay needs access to your photo library to scan QR codes from images. Please grant permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => console.log('Open settings - implement if needed') }
          ]
        );
        return;
      }

      // Launch image picker - using MediaTypeOptions for v16.x
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        setProcessingImage(true);
        
        try {
          // Use Expo's BarCodeScanner for reliable QR detection
          setProcessingImage(true);
          
          const qrData = await scanQRFromImage(imageUri);
          setProcessingImage(false);
          
          if (qrData) {
            processQRFromImage(qrData);
          } else {
            Alert.alert(
              'QR Code Processing',
              'For the best results scanning QR codes from images, please use the camera scanner instead. Would you like to try?',
              [
                { text: 'Try Another Image', style: 'cancel' },
                { 
                  text: 'Use Camera Scanner', 
                  onPress: () => {
                    // Just reset to use the main camera view
                    Alert.alert(
                      'Use Camera Scanner',
                      'Point your camera at the QR code using the main camera view above for instant scanning.',
                      [{ text: 'OK' }]
                    );
                  }
                },
                {
                  text: 'Enter Manually',
                  onPress: () => showManualEntryDialog()
                }
              ]
            );
          }
        } catch (processingError) {
          setProcessingImage(false);
          console.error('Image processing error:', processingError);
          Alert.alert(
            'Processing Error',
            'Failed to process the selected image. Please try with a different image.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image from gallery.');
    }
  };

  const openCamera = async () => {
    try {
      const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
      
      if (permissionResult.granted === false) {
        Alert.alert(
          'Camera Permission Required',
          'FlowPay needs access to your camera to take photos for QR code scanning. Please grant permission in your device settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => console.log('Open settings - implement if needed') }
          ]
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        
        setProcessingImage(true);
        
        try {
          // Use Expo's BarCodeScanner for reliable QR detection from camera
          setProcessingImage(true);
          
          const qrData = await scanQRFromImage(imageUri);
          setProcessingImage(false);
          
          if (qrData) {
            processQRFromImage(qrData);
          } else {
            Alert.alert(
              'QR Code Processing',
              'For the best results, please use the main camera scanner above. Point your camera directly at the QR code for instant scanning.',
              [
                { text: 'Try Again', style: 'cancel' },
                {
                  text: 'Use Live Scanner',
                  onPress: () => {
                    Alert.alert(
                      'Use Live Scanner',
                      'Use the camera view above to point directly at QR codes for instant scanning.',
                      [{ text: 'OK' }]
                    );
                  }
                }
              ]
            );
          }
        } catch (processingError) {
          setProcessingImage(false);
          console.error('Image processing error:', processingError);
          Alert.alert(
            'Processing Error',
            'Failed to process the captured image. Please try taking another photo.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo.');
    }
  };

  const showManualEntryDialog = () => {
    Alert.prompt(
      'Enter QR Code Data',
      'If you can see the QR code data, you can enter it manually:',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Process',
          onPress: (text) => {
            if (text && text.trim()) {
              processQRFromImage(text.trim());
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const showUploadOptions = () => {
    if (processingImage) {
      Alert.alert(
        'Processing in Progress',
        'Please wait for the current image to finish processing before selecting another.',
        [{ text: 'OK' }]
      );
      return;
    }

    Alert.alert(
      'QR Code Scanner Options',
      'Choose how you want to scan a QR code:',
      [
        {
          text: 'From Gallery',
          onPress: pickImageFromGallery
        },
        {
          text: 'Enter Manually',
          onPress: showManualEntryDialog
        },
        {
          text: 'Cancel',
          style: 'cancel'
        }
      ]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>Requesting camera permission...</Text>
        </View>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>No access to camera</Text>
          <Text style={styles.permissionSubtext}>
            Please grant camera permission to scan QR codes
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#179C7D', '#179C7D', '#0088cc']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>QR Scanner</Text>
        </SafeAreaView>
      </LinearGradient>

      <View style={styles.content}>
        {/* Camera Section */}
        <View style={styles.cameraSection}>
          <View style={styles.cameraContainer}>
            {isFocused && hasPermission && cameraReady && (
              <CameraView
                key={cameraKey} // Force remount when key changes
                style={StyleSheet.absoluteFillObject}
                facing="back"
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr", "pdf417"],
                }}
              />
            )}
            {(!isFocused || !cameraReady) && (
              <View style={[StyleSheet.absoluteFillObject, styles.cameraPlaceholder]}>
                <Text style={styles.cameraPlaceholderText}>
                  {!isFocused ? 'Camera will activate when focused' : 'Initializing camera...'}
                </Text>
              </View>
            )}
            <View style={styles.scannerOverlay}>
              <View style={[styles.scannerCorner]} />
              <View style={[styles.scannerCorner, styles.topRight]} />
              <View style={[styles.scannerCorner, styles.bottomLeft]} />
              <View style={[styles.scannerCorner, styles.bottomRight]} />
            </View>
          </View>
          
          <Text style={styles.scanInstructionText}>
            Position QR code within the frame to scan
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowGenerateQR(true)}
          >
            <View style={styles.actionButtonIcon}>
              <Text style={styles.actionButtonIconText}>+</Text>
            </View>
            <Text style={styles.actionButtonText}>Generate QR</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.actionButton, processingImage && styles.actionButtonDisabled]}
            onPress={processingImage ? null : showUploadOptions}
            disabled={processingImage}
          >
            <View style={styles.actionButtonIcon}>
              <Text style={styles.actionButtonIconText}>
                {processingImage ? '⟳' : '↑'}
              </Text>
            </View>
            <Text style={styles.actionButtonText}>
              {processingImage ? 'Processing...' : 'Upload QR'}
            </Text>
          </TouchableOpacity>
        </View>

        {scanned && (
          <TouchableOpacity 
            style={styles.scanAgainButton}
            onPress={() => setScanned(false)}
          >
            <Text style={styles.scanAgainText}>Scan Again</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Generate QR Modal */}
      {showGenerateQR && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Generate Payment QR</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setShowGenerateQR(false)}
              >
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView}>
              {profile && !loading ? (
                <View style={styles.qrGenerateContainer}>
                  <View style={styles.qrCodeContainer}>
                    <QRCode
                      value={generateQRData()}
                      size={180}
                      color="#000"
                      backgroundColor="#fff"
                      logo={require('../assets/FlowPay_NoBg_Logo.png')}
                      logoSize={30}
                      logoBackgroundColor="transparent"
                    />
                  </View>

                  <View style={styles.userInfo}>
                    <Text style={styles.userName}>
                      {profile?.fullname || profile?.username || profile?.email || 'User'}
                    </Text>
                    <Text style={styles.userEmail}>{profile?.email}</Text>
                  </View>

                  <View style={styles.amountSection}>
                    <Text style={styles.amountLabel}>Request Amount (Optional)</Text>
                    <TextInput
                      style={styles.amountInput}
                      placeholder="0.00"
                      value={requestAmount}
                      onChangeText={setRequestAmount}
                      keyboardType="numeric"
                      placeholderTextColor="#999"
                    />
                    <Text style={styles.amountNote}>
                      Leave empty for any amount or enter a specific amount
                    </Text>
                  </View>

                  <TouchableOpacity style={styles.shareButton}>
                    <Text style={styles.shareButtonText}>Share QR Code</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading QR Code...</Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      )}

      {/* Processing Overlay */}
      {processingImage && (
        <View style={styles.processingOverlay}>
          <View style={styles.processingContainer}>
            <Text style={styles.processingIcon}>⟳</Text>
            <Text style={styles.processingText}>Processing QR Code...</Text>
            <Text style={styles.processingSubtext}>Please wait while we scan your image</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerGradient: {
    paddingTop: 40,
    paddingBottom: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  tabContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 25,
    padding: 5,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 20,
  },
  activeTab: {
    backgroundColor: 'white',
  },
  tabText: {
    color: 'rgba(255,255,255,0.8)',
    fontWeight: '600',
    fontSize: 14,
  },
  activeTabText: {
    color: '#179C7D',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  myQRContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    alignItems: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  scanQRContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  cameraContainer: {
    backgroundColor: '#333',
    height: width * 0.8,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    overflow: 'hidden',
  },
  scannerOverlay: {
    width: width * 0.6,
    height: width * 0.6,
    position: 'relative',
  },
  scannerCorner: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderColor: '#fff',
    borderLeftWidth: 3,
    borderTopWidth: 3,
    left: 0,
    top: 0,
  },
  topRight: {
    left: undefined,
    right: 0,
    borderLeftWidth: 0,
    borderRightWidth: 3,
  },
  bottomLeft: {
    top: undefined,
    bottom: 0,
    borderTopWidth: 0,
    borderBottomWidth: 3,
  },
  bottomRight: {
    top: undefined,
    left: undefined,
    right: 0,
    bottom: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    borderRightWidth: 3,
    borderBottomWidth: 3,
  },
  scannerText: {
    color: 'white',
    marginTop: 20,
    fontSize: 14,
  },
  instructionsCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
    marginTop: 10,
    height: 200,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  instructionsScrollView: {
    flex: 1,
    marginTop: 5,
  },
  instructionsScrollContent: {
    paddingBottom: 15,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  instructionNumber: {
    backgroundColor: '#179C7D',
    color: 'white',
    width: 24,
    height: 24,
    borderRadius: 12,
    textAlign: 'center',
    lineHeight: 24,
    marginRight: 12,
    fontSize: 14,
    fontWeight: 'bold',
  },
  instructionText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 10,
  },
  permissionSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  scanInstructions: {
    alignItems: 'center',
    marginVertical: 20,
  },
  scanTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  scanSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  scanAgainButton: {
    backgroundColor: '#179C7D',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 20,
    marginTop: 10,
  },
  scanAgainText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  qrTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
    textAlign: 'center',
  },
  qrSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  qrCodeContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  loadingContainer: {
    height: 240,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  userInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 14,
    color: '#666',
  },
  amountSection: {
    width: '100%',
    marginBottom: 20,
  },
  amountLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  amountInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    padding: 15,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
  },
  amountNote: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  shareButton: {
    backgroundColor: '#179C7D',
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 30,
    width: '100%',
    alignItems: 'center',
  },
  shareButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // New styles for camera-first layout
  cameraSection: {
    flex: 1,
    marginBottom: 20,
  },
  scanInstructionText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  actionButton: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    width: width * 0.35,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonDisabled: {
    opacity: 0.7,
    backgroundColor: '#f5f5f5',
  },
  actionButtonIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#179C7D',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonIconText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 20,
    margin: 20,
    maxHeight: '80%',
    width: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 20,
    color: '#666',
    fontWeight: 'bold',
  },
  modalScrollView: {
    maxHeight: 400,
  },
  qrGenerateContainer: {
    padding: 20,
    alignItems: 'center',
  },
  processingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  processingContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  processingIcon: {
    fontSize: 40,
    color: '#179C7D',
    marginBottom: 15,
    transform: [{ rotate: '45deg' }],
  },
  processingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  processingSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  cameraPlaceholder: {
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraPlaceholderText: {
    color: '#999',
    fontSize: 16,
    textAlign: 'center',
  },
});