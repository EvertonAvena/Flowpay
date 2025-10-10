import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from '../supabase';

export default function SendFeedbackScreen({ navigation }) {
  const [feedbackType, setFeedbackType] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');
  const [rating, setRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const feedbackTypes = [
    { id: 'bug', label: 'Bug Report', icon: 'bug-outline', color: '#EF4444' },
    { id: 'feature', label: 'Feature Request', icon: 'bulb-outline', color: '#F59E0B' },
    { id: 'improvement', label: 'Improvement', icon: 'trending-up-outline', color: '#3B82F6' },
    { id: 'compliment', label: 'Compliment', icon: 'heart-outline', color: '#EC4899' },
    { id: 'complaint', label: 'Complaint', icon: 'warning-outline', color: '#EF4444' },
    { id: 'other', label: 'Other', icon: 'chatbubble-outline', color: '#6B7280' },
  ];

  const validateForm = () => {
    if (!feedbackType) {
      Alert.alert('Validation Error', 'Please select a feedback type');
      return false;
    }
    if (!subject.trim()) {
      Alert.alert('Validation Error', 'Please enter a subject');
      return false;
    }
    if (!message.trim()) {
      Alert.alert('Validation Error', 'Please provide your feedback message');
      return false;
    }
    if (message.trim().length < 10) {
      Alert.alert('Validation Error', 'Feedback message must be at least 10 characters');
      return false;
    }
    if (email && !isValidEmail(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Prepare feedback data
      const feedbackData = {
        user_id: user?.id || null,
        user_email: email || user?.email || 'anonymous@flowpay.com',
        feedback_type: feedbackType,
        subject: subject.trim(),
        message: message.trim(),
        rating: rating,
        status: 'new',
        created_at: new Date().toISOString(),
        platform: Platform.OS,
        app_version: '1.0.0',
      };

      // In a real app, you would save this to a database
      // For now, we'll simulate the submission
      console.log('Feedback submitted:', feedbackData);

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Show success message
      Alert.alert(
        'Feedback Submitted! 🎉',
        `Thank you for your ${feedbackTypes.find(t => t.id === feedbackType)?.label.toLowerCase()}!\n\nWe appreciate your feedback and will review it shortly. You should receive a confirmation email within 24 hours.`,
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );

      // Optional: Save to Supabase if you have a feedback table
      // await supabase.from('feedback').insert([feedbackData]);

    } catch (error) {
      console.error('Error submitting feedback:', error);
      Alert.alert(
        'Submission Failed',
        'There was an error submitting your feedback. Please try again later or contact support directly.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRatingPress = (value) => {
    setRating(value);
  };

  const clearForm = () => {
    Alert.alert(
      'Clear Form',
      'Are you sure you want to clear all fields?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            setFeedbackType('');
            setSubject('');
            setMessage('');
            setEmail('');
            setRating(0);
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
        <SafeAreaView>
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Send Feedback</Text>
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={clearForm}
            >
              <Ionicons name="refresh-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Info Card */}
          <View style={styles.infoCard}>
            <Ionicons name="chatbox-ellipses-outline" size={40} color="#179C7D" />
            <Text style={styles.infoTitle}>We Value Your Feedback</Text>
            <Text style={styles.infoText}>
              Your feedback helps us improve FlowPay. Tell us what you think!
            </Text>
          </View>

          {/* Feedback Type Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Feedback Type *</Text>
            <View style={styles.feedbackTypes}>
              {feedbackTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.feedbackTypeCard,
                    feedbackType === type.id && styles.feedbackTypeCardActive,
                    feedbackType === type.id && { borderColor: type.color }
                  ]}
                  onPress={() => setFeedbackType(type.id)}
                >
                  <View style={[
                    styles.feedbackTypeIcon,
                    { backgroundColor: `${type.color}20` }
                  ]}>
                    <Ionicons name={type.icon} size={24} color={type.color} />
                  </View>
                  <Text style={[
                    styles.feedbackTypeLabel,
                    feedbackType === type.id && styles.feedbackTypeLabelActive
                  ]}>
                    {type.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rate Your Experience (Optional)</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleRatingPress(star)}
                  style={styles.starButton}
                >
                  <Ionicons
                    name={star <= rating ? 'star' : 'star-outline'}
                    size={40}
                    color={star <= rating ? '#F59E0B' : '#D1D5DB'}
                  />
                </TouchableOpacity>
              ))}
            </View>
            {rating > 0 && (
              <Text style={styles.ratingText}>
                {rating === 1 && '😞 Poor'}
                {rating === 2 && '😕 Fair'}
                {rating === 3 && '😐 Good'}
                {rating === 4 && '😊 Very Good'}
                {rating === 5 && '🤩 Excellent'}
              </Text>
            )}
          </View>

          {/* Subject */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subject *</Text>
            <TextInput
              style={styles.input}
              placeholder="Brief description of your feedback"
              placeholderTextColor="#999"
              value={subject}
              onChangeText={setSubject}
              maxLength={100}
            />
            <Text style={styles.charCounter}>{subject.length}/100</Text>
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Feedback *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Please provide detailed feedback. The more details you provide, the better we can help you."
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={8}
              textAlignVertical="top"
              maxLength={1000}
            />
            <Text style={styles.charCounter}>{message.length}/1000</Text>
          </View>

          {/* Email (Optional) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Email (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="Your email for follow-up"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.helperText}>
              We'll use this to follow up on your feedback
            </Text>
          </View>

          {/* Tips Section */}
          <View style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="information-circle-outline" size={20} color="#3B82F6" />
              <Text style={styles.tipsTitle}>Tips for Better Feedback</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Be specific about what you experienced</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Include steps to reproduce issues</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Mention your device and app version</Text>
            </View>
            <View style={styles.tip}>
              <Text style={styles.tipBullet}>•</Text>
              <Text style={styles.tipText}>Suggest how we can improve</Text>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[styles.submitButton, isSubmitting && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Submitting...</Text>
            ) : (
              <>
                <Ionicons name="send-outline" size={20} color="white" />
                <Text style={styles.submitButtonText}>Submit Feedback</Text>
              </>
            )}
          </TouchableOpacity>

          {/* Privacy Note */}
          <View style={styles.privacyNote}>
            <Ionicons name="lock-closed-outline" size={16} color="#999" />
            <Text style={styles.privacyText}>
              Your feedback is confidential and will be used only to improve FlowPay
            </Text>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

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
  clearButton: {
    padding: 5,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 20,
    marginBottom: 15,
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 15,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    lineHeight: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  feedbackTypes: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  feedbackTypeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    width: '31%',
    borderWidth: 2,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  feedbackTypeCardActive: {
    borderWidth: 2,
    backgroundColor: '#F0FDF9',
  },
  feedbackTypeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  feedbackTypeLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },
  feedbackTypeLabelActive: {
    color: '#179C7D',
    fontWeight: '600',
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  starButton: {
    padding: 5,
  },
  ratingText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 5,
  },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  textArea: {
    height: 150,
    paddingTop: 15,
  },
  charCounter: {
    fontSize: 12,
    color: '#999',
    textAlign: 'right',
    marginTop: 5,
  },
  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
  },
  tipsCard: {
    backgroundColor: '#EFF6FF',
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3B82F6',
  },
  tip: {
    flexDirection: 'row',
    marginBottom: 5,
    paddingLeft: 5,
  },
  tipBullet: {
    fontSize: 14,
    color: '#3B82F6',
    marginRight: 8,
    fontWeight: 'bold',
  },
  tipText: {
    fontSize: 13,
    color: '#1E40AF',
    flex: 1,
  },
  submitButton: {
    backgroundColor: '#179C7D',
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  submitButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 15,
    paddingHorizontal: 30,
    gap: 8,
  },
  privacyText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    flex: 1,
  },
});
