import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'No user found. Please log in again.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }
      const { data, error } = await supabase
        .from('profile')
        .select('*')
        .eq('id', user.id)
        .single();
      if (error || !data) {
        Alert.alert('Error', 'Profile not found.');
        navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
        return;
      }
      setProfile(data);
    } catch (error) {
      console.error("Error loading profile:", error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: async () => {
            try {
              await supabase.auth.signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' }],
              });
            } catch (error) {
              console.error("Logout error:", error);
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={['#179C7D', '#179C7D', '#0088cc']}
        style={styles.headerGradient}
      >
        <SafeAreaView style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>
        </SafeAreaView>
        
        {/* Profile Picture & Basic Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarContainer}>
            <Image
              source={require('../assets/logo.png')}
              style={styles.avatar}
              resizeMode="contain"
            />
          </View>
          <Text style={styles.userName}>
            {profile ? profile.fullname : 'User'}
          </Text>
          <Text style={styles.userEmail}>
            {profile ? profile.account_number : 'account number'}
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.card}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Full Name</Text>
              <Text style={styles.infoValue}>{profile ? profile.fullname : '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Username</Text>
              <Text style={styles.infoValue}>{profile ? profile.username : '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{profile ? profile.email : '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Phone Number</Text>
              <Text style={styles.infoValue}>{profile ? profile.phone : '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Address</Text>
              <Text style={styles.infoValue}>{profile ? profile.address : '-'}</Text>
            </View>
            
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Date of Birth</Text>
              <Text style={styles.infoValue}>{profile ? profile.birthdate : '-'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Settings</Text>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Change Password</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Notifications</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Privacy & Security</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>Help & Support</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingRow}>
            <Text style={styles.settingText}>About</Text>
            <Text style={styles.arrowIcon}>›</Text>
          </TouchableOpacity>
        </View>
        
        {/* Add spacer for bottom navigation */}
        <View style={{ height: 80 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  logoutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  logoutText: {
    color: 'white',
    fontWeight: '600',
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 5,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  userName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  userEmail: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
  },
  content: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 20,
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
  card: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 8,
  },
  settingText: {
    fontSize: 16,
    color: '#333',
  },
  arrowIcon: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#999',
  },
});