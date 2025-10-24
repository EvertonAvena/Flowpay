import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { supabase } from '../supabase';

export default function ChangePasswordScreen({ navigation }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validatePassword = (password) => {
    // Password must be at least 8 characters, contain uppercase, lowercase, number, and special character
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumber && hasSpecialChar,
      minLength,
      hasUpperCase,
      hasLowerCase,
      hasNumber,
      hasSpecialChar
    };
  };

  const handleChangePassword = async () => {
    // Validation (keep your existing checks)
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }
    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }
    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      let errorMessage = 'Password must:\n';
      if (!validation.minLength) errorMessage += '• Be at least 8 characters\n';
      if (!validation.hasUpperCase) errorMessage += '• Contain uppercase letter\n';
      if (!validation.hasLowerCase) errorMessage += '• Contain lowercase letter\n';
      if (!validation.hasNumber) errorMessage += '• Contain number\n';
      if (!validation.hasSpecialChar) errorMessage += '• Contain special character';
      Alert.alert('Weak Password', errorMessage);
      return;
    }

    try {
      setLoading(true);

      // 1) get current user and email
      const { data: userData, error: userErr } = await supabase.auth.getUser();
      if (userErr || !userData?.user?.email) {
        throw new Error('Unable to get current user. Please re-login and try again.');
      }
      const email = userData.user.email;

      // 2) reauthenticate using current password
      const { error: signInErr } = await supabase.auth.signInWithPassword({
        email,
        password: currentPassword
      });
      if (signInErr) {
        throw new Error('Current password is incorrect.');
      }

      // 3) update the password
      const { error: updateErr } = await supabase.auth.updateUser({
        password: newPassword
      });
      if (updateErr) {
        throw updateErr;
      }

      // 4) optionally sign in again to refresh session with the new password
      await supabase.auth.signInWithPassword({ email, password: newPassword });

      Alert.alert('Success', 'Your password has been changed successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);

      // Clear fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Change password error:', error);
      Alert.alert('Error', error.message || 'Failed to change password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = validatePassword(newPassword);
  const strengthPercentage = 
    (passwordStrength.minLength ? 20 : 0) +
    (passwordStrength.hasUpperCase ? 20 : 0) +
    (passwordStrength.hasLowerCase ? 20 : 0) +
    (passwordStrength.hasNumber ? 20 : 0) +
    (passwordStrength.hasSpecialChar ? 20 : 0);

  const getStrengthColor = () => {
    if (strengthPercentage <= 40) return '#DC2626';
    if (strengthPercentage <= 60) return '#F59E0B';
    if (strengthPercentage <= 80) return '#FBBF24';
    return '#10B981';
  };

  const getStrengthText = () => {
    if (strengthPercentage <= 40) return 'Weak';
    if (strengthPercentage <= 60) return 'Fair';
    if (strengthPercentage <= 80) return 'Good';
    return 'Strong';
  };

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
            <Text style={styles.headerTitle}>Change Password</Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#179C7D" />
            <Text style={styles.infoTitle}>Password Security</Text>
          </View>
          <Text style={styles.infoText}>
            Choose a strong password to keep your account secure. Your password should be unique and not used on other sites.
          </Text>
        </View>

        <View style={styles.formSection}>
          {/* Current Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Current Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={currentPassword}
                onChangeText={setCurrentPassword}
                placeholder="Enter current password"
                placeholderTextColor="#999"
                secureTextEntry={!showCurrentPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowCurrentPassword(!showCurrentPassword)}
              >
                <Ionicons 
                  name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={24} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={newPassword}
                onChangeText={setNewPassword}
                placeholder="Enter new password"
                placeholderTextColor="#999"
                secureTextEntry={!showNewPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowNewPassword(!showNewPassword)}
              >
                <Ionicons 
                  name={showNewPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={24} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <View style={styles.strengthContainer}>
                <View style={styles.strengthBar}>
                  <View 
                    style={[
                      styles.strengthFill, 
                      { 
                        width: `${strengthPercentage}%`,
                        backgroundColor: getStrengthColor()
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.strengthText, { color: getStrengthColor() }]}>
                  {getStrengthText()}
                </Text>
              </View>
            )}

            {/* Password Requirements */}
            <View style={styles.requirementsContainer}>
              <RequirementItem 
                met={passwordStrength.minLength} 
                text="At least 8 characters" 
              />
              <RequirementItem 
                met={passwordStrength.hasUpperCase} 
                text="One uppercase letter" 
              />
              <RequirementItem 
                met={passwordStrength.hasLowerCase} 
                text="One lowercase letter" 
              />
              <RequirementItem 
                met={passwordStrength.hasNumber} 
                text="One number" 
              />
              <RequirementItem 
                met={passwordStrength.hasSpecialChar} 
                text="One special character (!@#$%...)" 
              />
            </View>
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirm New Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Confirm new password"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity 
                style={styles.eyeIcon}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'} 
                  size={24} 
                  color="#999" 
                />
              </TouchableOpacity>
            </View>
            {confirmPassword.length > 0 && (
              <View style={styles.matchIndicator}>
                <Ionicons 
                  name={newPassword === confirmPassword ? 'checkmark-circle' : 'close-circle'} 
                  size={16} 
                  color={newPassword === confirmPassword ? '#10B981' : '#DC2626'} 
                />
                <Text style={[
                  styles.matchText,
                  { color: newPassword === confirmPassword ? '#10B981' : '#DC2626' }
                ]}>
                  {newPassword === confirmPassword ? 'Passwords match' : 'Passwords do not match'}
                </Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.changeButton}
            onPress={handleChangePassword}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.changeButtonText}>Change Password</Text>
            )}
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const RequirementItem = ({ met, text }) => (
  <View style={styles.requirementItem}>
    <Ionicons 
      name={met ? 'checkmark-circle' : 'ellipse-outline'} 
      size={16} 
      color={met ? '#10B981' : '#D1D5DB'} 
    />
    <Text style={[styles.requirementText, met && styles.requirementMet]}>
      {text}
    </Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
  infoCard: {
    backgroundColor: '#E8F8F5',
    borderRadius: 12,
    padding: 15,
    marginBottom: 25,
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
  formSection: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  passwordContainer: {
    position: 'relative',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: 'white',
    color: '#333',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 12,
  },
  strengthContainer: {
    marginTop: 10,
  },
  strengthBar: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 5,
  },
  strengthFill: {
    height: '100%',
    borderRadius: 3,
  },
  strengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  requirementsContainer: {
    marginTop: 12,
    gap: 6,
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  requirementText: {
    fontSize: 13,
    color: '#999',
  },
  requirementMet: {
    color: '#10B981',
  },
  matchIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  matchText: {
    fontSize: 13,
    fontWeight: '500',
  },
  changeButton: {
    backgroundColor: '#179C7D',
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  changeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
