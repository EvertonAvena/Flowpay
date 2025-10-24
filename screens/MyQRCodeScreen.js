import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { LinearGradient } from 'expo-linear-gradient';
import * as MediaLibrary from 'expo-media-library';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { supabase } from '../supabase';

export default function MyQRCodeScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const qrRef = useRef(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        Alert.alert('Error', 'No user found. Please log in again.');
        navigation.goBack();
        return;
      }

      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error || !data) {
        Alert.alert('Error', 'Could not load profile data.');
        navigation.goBack();
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      Alert.alert('Error', 'Failed to load profile data.');
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      const message = `Send money to ${profile.fullname}\nAccount: ${profile.account_number}\n\nFlowPay - Fast & Secure Payments`;
      
      await Share.share({
        message: message,
        title: 'My FlowPay QR Code'
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleDownload = async () => {
    try {
      if (!qrRef.current || !qrRef.current.toDataURL) {
        Alert.alert('Error', 'Unable to access QR image.');
        return;
      }
      
      setSaving(true);
      const permission = await MediaLibrary.requestPermissionsAsync();
      if (permission.status !== 'granted') {
        setSaving(false);
        Alert.alert('Permission required', 'Permission to access photos is required to save the QR code.');
        return;
      }
      
      // toDataURL provides base64 PNG string via callback
      qrRef.current.toDataURL(async (base64Data) => {
        try {
          const filename = `flowpay_qr_${Date.now()}.png`;
          const fileUri = FileSystem.cacheDirectory + filename;
          // write base64 to file
          await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: FileSystem.EncodingType.Base64 });
          // create media asset
          const asset = await MediaLibrary.createAssetAsync(fileUri);
          // put into album (optional)
          const albumName = 'FlowPay';
          const album = await MediaLibrary.getAlbumAsync(albumName);
          if (!album) {
            await MediaLibrary.createAlbumAsync(albumName, asset, false);
          } else {
            await MediaLibrary.addAssetsToAlbumAsync([asset], album.id, false);
          }
          Alert.alert('Saved', 'QR code saved to your gallery/photos.');
        } catch (err) {
          console.error('Save error:', err);
          Alert.alert('Error', 'Failed to save QR code.');
        } finally {
          setSaving(false);
        }
      });
    } catch (err) {
      console.error('Download handler error:', err);
      setSaving(false);
      Alert.alert('Error', 'Failed to save QR code.');
    }
  };
 
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#179C7D" />
        <Text style={styles.loadingText}>Loading QR Code...</Text>
      </View>
    );
  }
 
  // Create QR code data
  const qrData = JSON.stringify({
    type: 'flowpay_payment',
    account_number: profile?.account_number,
    name: profile?.fullname,
    email: profile?.email
  });
 
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#179C7D', '#179C7D', '#0088cc']}
        style={styles.headerGradient}
      >
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My QR Code</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle-outline" size={24} color="#179C7D" />
            <Text style={styles.infoTitle}>Receive Payments</Text>
          </View>
          <Text style={styles.infoText}>
            Share this QR code with others to receive payments directly to your FlowPay account.
          </Text>
        </View>


        <View style={styles.qrContainer}>
          <View style={styles.qrCard}>
            <View style={styles.qrCodeWrapper}>
              <QRCode
                value={qrData}
                size={250}
                backgroundColor="white"
                color="#000000"
                logo={require('../assets/FlowPay_NoBg_Logo.png')}
                logoSize={60}
                logoBackgroundColor="transparent"
                getRef={(c) => (qrRef.current = c)}
              />
            </View>

            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile?.fullname}</Text>
              <View style={styles.accountRow}>
                <Ionicons name="card-outline" size={18} color="#666" />
                <Text style={styles.accountNumber}>{profile?.account_number}</Text>
              </View>
            </View>
          </View>

          {/* Centered action buttons below QR card */}
          <View style={styles.actionsContainerCentered}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleShare}
            >
              <View style={styles.actionIconContainer}>
                <Ionicons name="share-social-outline" size={24} color="#179C7D" />
              </View>
              <Text style={styles.actionText}>Share QR</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.actionButton}
              onPress={handleDownload}
              disabled={saving}
            >
              <View style={styles.actionIconContainer}>
                {saving ? <ActivityIndicator color="#179C7D" /> : <Ionicons name="cloud-download-outline" size={24} color="#179C7D" />}
              </View>
              <Text style={styles.actionText}>{saving ? 'Saving...' : 'Download QR'}</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.scanInstruction}>
            Scan this QR code to send money
          </Text>
        </View>

        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Account Details</Text>
          
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Number</Text>
            <Text style={styles.detailValue}>{profile?.account_number}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Account Name</Text>
            <Text style={styles.detailValue}>{profile?.fullname}</Text>
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Email</Text>
            <Text style={styles.detailValue}>{profile?.email}</Text>
          </View>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  headerGradient: {
    paddingTop: 20,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  infoCard: {
    backgroundColor: '#E8F8F5',
    borderRadius: 12,
    padding: 15,
    marginTop: 20,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#179C7D',
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#179C7D',
  },
  infoText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  qrContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  qrCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 15,
  },
  qrCodeWrapper: {
    padding: 20,
    backgroundColor: 'white',
    borderRadius: 15,
    marginBottom: 20,
  },
  userInfo: {
    alignItems: 'center',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  accountNumber: {
    fontSize: 16,
    color: '#666',
    fontWeight: '500',
  },
  scanInstruction: {
    fontSize: 14,
    color: '#999',
    fontStyle: 'italic',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 10,
    marginTop: 0,
    gap: 15,
  },
  actionsContainerCentered: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginTop: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    textAlign: 'right',
  },
});
