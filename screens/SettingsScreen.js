import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  ActivityIndicator
} from 'react-native';
import { supabase } from '../supabase';

export default function SettingsScreen({ navigation }) {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  
  // Notification Settings
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [transactionAlerts, setTransactionAlerts] = useState(true);
  const [promotionalEmails, setPromotionalEmails] = useState(false);
  
  // Privacy Settings
  const [profileVisibility, setProfileVisibility] = useState(true);
  const [shareTransactionHistory, setShareTransactionHistory] = useState(false);
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  
  // Security Settings
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [loginAlerts, setLoginAlerts] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      
      // Get user profile
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profileData } = await supabase
          .from('profile')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileData) {
          setProfile(profileData);
        }
      }

      // Load saved settings from AsyncStorage
      const savedSettings = await AsyncStorage.getItem('flowpay_settings');
      if (savedSettings) {
        const settings = JSON.parse(savedSettings);
        
        // Notification Settings
        setPushNotifications(settings.pushNotifications ?? true);
        setEmailNotifications(settings.emailNotifications ?? true);
        setTransactionAlerts(settings.transactionAlerts ?? true);
        setPromotionalEmails(settings.promotionalEmails ?? false);
        
        // Privacy Settings
        setProfileVisibility(settings.profileVisibility ?? true);
        setShareTransactionHistory(settings.shareTransactionHistory ?? false);
        setShowOnlineStatus(settings.showOnlineStatus ?? true);
        
        // Security Settings
        setBiometricEnabled(settings.biometricEnabled ?? false);
        setTwoFactorAuth(settings.twoFactorAuth ?? false);
        setLoginAlerts(settings.loginAlerts ?? true);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        // Notification Settings
        pushNotifications,
        emailNotifications,
        transactionAlerts,
        promotionalEmails,
        
        // Privacy Settings
        profileVisibility,
        shareTransactionHistory,
        showOnlineStatus,
        
        // Security Settings
        biometricEnabled,
        twoFactorAuth,
        loginAlerts,
        
        lastUpdated: new Date().toISOString()
      };

      await AsyncStorage.setItem('flowpay_settings', JSON.stringify(settings));
      
      // Optionally save to Supabase
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profile')
          .update({ 
            settings: settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
      }
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const handleChangePassword = () => {
    navigation.navigate('ChangePassword');
  };

  const handleToggleNotification = async (type, value) => {
    switch(type) {
      case 'push':
        setPushNotifications(value);
        break;
      case 'email':
        setEmailNotifications(value);
        break;
      case 'transaction':
        setTransactionAlerts(value);
        break;
      case 'promotional':
        setPromotionalEmails(value);
        break;
    }
    await saveSettings();
  };

  const handleTogglePrivacy = async (type, value) => {
    switch(type) {
      case 'visibility':
        setProfileVisibility(value);
        break;
      case 'history':
        setShareTransactionHistory(value);
        break;
      case 'online':
        setShowOnlineStatus(value);
        break;
    }
    await saveSettings();
  };

  const handleToggleSecurity = async (type, value) => {
    switch(type) {
      case 'biometric':
        setBiometricEnabled(value);
        if (value) {
          Alert.alert(
            'Biometric Authentication',
            'Biometric login has been enabled. You can now use your fingerprint to log in.',
            [{ text: 'OK' }]
          );
        }
        break;
      case '2fa':
        if (value) {
          Alert.alert(
            'Enable Two-Factor Authentication',
            'Two-factor authentication adds an extra layer of security. You will receive a code via SMS when logging in.',
            [
              { text: 'Cancel', style: 'cancel', onPress: () => setTwoFactorAuth(false) },
              { 
                text: 'Enable', 
                onPress: () => {
                  setTwoFactorAuth(true);
                  Alert.alert('Success', '2FA has been enabled for your account.');
                }
              }
            ]
          );
        } else {
          setTwoFactorAuth(value);
        }
        break;
      case 'loginAlerts':
        setLoginAlerts(value);
        break;
    }
    await saveSettings();
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Please confirm you want to delete your account. Type DELETE to confirm.',
              [
                { text: 'Cancel', style: 'cancel' },
                { 
                  text: 'I Understand', 
                  style: 'destructive',
                  onPress: async () => {
                    // Implement account deletion
                    Alert.alert('Account Deletion', 'Account deletion feature will be implemented.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#179C7D" />
        <Text style={styles.loadingText}>Loading settings...</Text>
      </View>
    );
  }

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
            <Text style={styles.headerTitle}>Settings</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Password Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Security</Text>
          
          <TouchableOpacity 
            style={styles.menuItem}
            onPress={handleChangePassword}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="key-outline" size={22} color="#F59E0B" />
              </View>
              <Text style={styles.menuText}>Change Password</Text>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#999" />
          </TouchableOpacity>
        </View>

        {/* Notification Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="notifications-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Push Notifications</Text>
                <Text style={styles.settingDescription}>Receive push notifications</Text>
              </View>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={(value) => handleToggleNotification('push', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={pushNotifications ? '#179C7D' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="mail-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Email Notifications</Text>
                <Text style={styles.settingDescription}>Get updates via email</Text>
              </View>
            </View>
            <Switch
              value={emailNotifications}
              onValueChange={(value) => handleToggleNotification('email', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={emailNotifications ? '#179C7D' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="card-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Transaction Alerts</Text>
                <Text style={styles.settingDescription}>Alert for every transaction</Text>
              </View>
            </View>
            <Switch
              value={transactionAlerts}
              onValueChange={(value) => handleToggleNotification('transaction', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={transactionAlerts ? '#179C7D' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="megaphone-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Promotional Emails</Text>
                <Text style={styles.settingDescription}>Offers and promotions</Text>
              </View>
            </View>
            <Switch
              value={promotionalEmails}
              onValueChange={(value) => handleToggleNotification('promotional', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={promotionalEmails ? '#179C7D' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Privacy Settings */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Privacy</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="eye-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Profile Visibility</Text>
                <Text style={styles.settingDescription}>Show profile to other users</Text>
              </View>
            </View>
            <Switch
              value={profileVisibility}
              onValueChange={(value) => handleTogglePrivacy('visibility', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={profileVisibility ? '#179C7D' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="time-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Transaction History</Text>
                <Text style={styles.settingDescription}>Share transaction data</Text>
              </View>
            </View>
            <Switch
              value={shareTransactionHistory}
              onValueChange={(value) => handleTogglePrivacy('history', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={shareTransactionHistory ? '#179C7D' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="radio-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Online Status</Text>
                <Text style={styles.settingDescription}>Show when you're active</Text>
              </View>
            </View>
            <Switch
              value={showOnlineStatus}
              onValueChange={(value) => handleTogglePrivacy('online', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={showOnlineStatus ? '#179C7D' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Security Options */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security Options</Text>
          
          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="finger-print" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Biometric Login</Text>
                <Text style={styles.settingDescription}>Use fingerprint to login</Text>
              </View>
            </View>
            <Switch
              value={biometricEnabled}
              onValueChange={(value) => handleToggleSecurity('biometric', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={biometricEnabled ? '#179C7D' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="shield-checkmark-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Two-Factor Authentication</Text>
                <Text style={styles.settingDescription}>Extra security for your account</Text>
              </View>
            </View>
            <Switch
              value={twoFactorAuth}
              onValueChange={(value) => handleToggleSecurity('2fa', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={twoFactorAuth ? '#179C7D' : '#f3f4f6'}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLeft}>
              <Ionicons name="alert-circle-outline" size={22} color="#179C7D" />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingText}>Login Alerts</Text>
                <Text style={styles.settingDescription}>Notify on new device login</Text>
              </View>
            </View>
            <Switch
              value={loginAlerts}
              onValueChange={(value) => handleToggleSecurity('loginAlerts', value)}
              trackColor={{ false: '#d1d5db', true: '#86efac' }}
              thumbColor={loginAlerts ? '#179C7D' : '#f3f4f6'}
            />
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: '#DC2626' }]}>Danger Zone</Text>
          
          <TouchableOpacity 
            style={[styles.menuItem, styles.dangerItem]}
            onPress={handleDeleteAccount}
          >
            <View style={styles.menuLeft}>
              <View style={[styles.iconContainer, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="trash-outline" size={22} color="#DC2626" />
              </View>
              <View>
                <Text style={[styles.menuText, { color: '#DC2626' }]}>Delete Account</Text>
                <Text style={styles.dangerDescription}>Permanently delete your account</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={22} color="#DC2626" />
          </TouchableOpacity>
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
    paddingTop: 20,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#999',
  },
  dangerItem: {
    borderWidth: 1,
    borderColor: '#FEE2E2',
  },
  dangerDescription: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
});
