import { useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import { supabase } from '../supabase';

export default function ForgotPasswordScreen({ navigation, route }) {
  const [email, setEmail] = useState(route?.params?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSendReset = async () => {
    if (!email) {
      Alert.alert('Error', 'Please enter your email');
      return;
    }
    try {
      setLoading(true);
      // Try v2 API, fallback to older api if necessary
      let result;
      if (typeof supabase.auth?.resetPasswordForEmail === 'function') {
        // Use Supabase hosted page (no redirectTo) — works without building a custom client
        result = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: 'https://resetpassword--calej9vbbb.expo.app' // exact URL you hosted and registered
        });
      } else if (supabase.auth?.api?.resetPasswordForEmail) {
        result = await supabase.auth.api.resetPasswordForEmail(email);
      } else {
        throw new Error('Reset API not available in supabase client. Update supabase-js.');
      }

      if (result?.error) {
        throw result.error;
      }

      Alert.alert(
        'Email Sent',
        'If that email exists in our system, a password reset link has been sent. Check your inbox (and spam).',
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );
    } catch (err) {
      console.error('Password reset error:', err);
      Alert.alert('Error', err?.message || 'Failed to send reset email. Try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Forgot Password</Text>
      <Text style={styles.help}>Enter your account email and we'll send a reset link.</Text>
      <TextInput
        style={styles.input}
        placeholder="you@email.com"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TouchableOpacity style={styles.button} onPress={handleSendReset} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Send Reset Email</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: '700', marginBottom: 6 },
  help: { color: '#666', marginBottom: 18 },
  input: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, marginBottom: 14 },
  button: { backgroundColor: '#179C7D', padding: 14, borderRadius: 12, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' }
});