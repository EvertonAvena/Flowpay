import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Linking
} from 'react-native';

export default function HelpScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const helpCategories = [
    {
      title: 'Getting Started',
      icon: 'rocket-outline',
      color: '#3B82F6',
      action: 'gettingStarted'
    },
    {
      title: 'Account & Security',
      icon: 'shield-checkmark-outline',
      color: '#10B981',
      action: 'accountSecurity'
    },
    {
      title: 'Transactions',
      icon: 'swap-horizontal-outline',
      color: '#8B5CF6',
      action: 'transactions'
    },
    {
      title: 'Troubleshooting',
      icon: 'build-outline',
      color: '#F59E0B',
      action: 'troubleshooting'
    }
  ];

  const faqs = [
    {
      category: 'Getting Started',
      question: 'How do I create a FlowPay account?',
      answer: `To create a FlowPay account:
1. Download and open the FlowPay app
2. Tap "Sign Up"
3. Enter your email and create a password
4. Verify your email address
5. Complete your profile information
6. Verify your phone number
7. Set up your 6-digit MPIN
8. Start using FlowPay!

You must be at least 18 years old to create an account.`
    },
    {
      category: 'Getting Started',
      question: 'How do I verify my account?',
      answer: `Account verification steps:
1. Go to Profile > Settings
2. Tap "Verify Account"
3. Upload a valid government-issued ID
4. Take a selfie for identity verification
5. Wait for verification (usually 24-48 hours)
6. You'll receive a notification when verified

Verified accounts have higher transaction limits and additional features.`
    },
    {
      category: 'Account & Security',
      question: 'How do I reset my password?',
      answer: `To reset your password:
1. On the login screen, tap "Forgot Password"
2. Enter your registered email
3. Check your email for a reset link
4. Click the link and create a new password
5. Your password must be at least 8 characters with uppercase, lowercase, number, and special character

You can also change your password in Settings > Change Password.`
    },
    {
      category: 'Account & Security',
      question: 'How do I reset my MPIN?',
      answer: `To reset your MPIN:
1. Go to Profile > Settings > Security Options
2. Tap "Reset MPIN"
3. Enter your password to verify
4. Create a new 6-digit MPIN
5. Confirm your new MPIN

Never share your MPIN with anyone. FlowPay will never ask for your MPIN via email or phone.`
    },
    {
      category: 'Account & Security',
      question: 'How do I enable biometric login?',
      answer: `To enable fingerprint/face login:
1. Go to Profile > Settings
2. Scroll to "Security Options"
3. Toggle on "Biometric Login"
4. Verify your identity with your MPIN
5. Follow the prompts to set up biometric authentication

Note: Your device must support biometric authentication.`
    },
    {
      category: 'Transactions',
      question: 'How do I send money to another FlowPay user?',
      answer: `To send money:
1. Tap "Transfer" on the home screen
2. Enter the recipient's account number, email, or phone
3. Enter the amount you want to send
4. Add an optional message
5. Review the transaction details
6. Enter your MPIN to confirm
7. Transaction complete!

You can also send money by scanning a QR code.`
    },
    {
      category: 'Transactions',
      question: 'How do I receive money?',
      answer: `To receive money:
1. Share your FlowPay account number with the sender
2. Or generate and share your QR code:
   - Go to Profile > My QR Codes
   - Share your QR code with the sender
3. You'll receive a notification when money is received
4. Funds are instantly available in your account

You can view all received transactions in the Transactions tab.`
    },
    {
      category: 'Transactions',
      question: 'How long do transactions take?',
      answer: `Transaction processing times:
• FlowPay to FlowPay: Instant
• Bank transfers: 1-3 business days
• Bill payments: Within 24 hours
• Cash pickup: Instant to 1 hour

You'll receive notifications at each step of the transaction process.`
    },
    {
      category: 'Transactions',
      question: 'What are the transaction limits?',
      answer: `Transaction limits vary by verification level:

Unverified Account:
• Daily limit: ₱5,000
• Per transaction: ₱2,000

Verified Account:
• Daily limit: ₱50,000
• Per transaction: ₱25,000

Premium Account:
• Daily limit: ₱500,000
• Per transaction: ₱100,000

Contact support to upgrade your account.`
    },
    {
      category: 'Transactions',
      question: 'How do I pay bills using FlowPay?',
      answer: `To pay bills:
1. Tap "Pay Bills" on the home screen
2. Select the biller category
3. Choose your biller
4. Enter your account number
5. Enter the amount to pay
6. Review the details
7. Enter your MPIN to confirm
8. Save the biller for future payments

You'll receive a receipt via email and in-app notification.`
    },
    {
      category: 'Troubleshooting',
      question: 'My transaction failed. What should I do?',
      answer: `If your transaction failed:
1. Check your internet connection
2. Verify you have sufficient balance
3. Ensure recipient details are correct
4. Check if you've reached your daily limit
5. Try again after a few minutes

If the problem persists:
• Check Transaction History for error details
• Contact support with the transaction reference number
• Funds will be automatically refunded if debited`
    },
    {
      category: 'Troubleshooting',
      question: 'I forgot my password and MPIN',
      answer: `If you forgot both:
1. Use "Forgot Password" on the login screen
2. Reset your password via email
3. Log in with new password
4. Go to Settings > Reset MPIN
5. Verify with password
6. Create new MPIN

If you can't access your email, contact support for account recovery.`
    },
    {
      category: 'Troubleshooting',
      question: 'The app is not working properly',
      answer: `Try these troubleshooting steps:
1. Update to the latest app version
2. Clear app cache (Settings > Clear Cache)
3. Check your internet connection
4. Restart your device
5. Uninstall and reinstall the app
6. Ensure your device OS is updated

If issues persist, contact support with:
• Your device model
• OS version
• App version
• Description of the issue`
    },
    {
      category: 'Troubleshooting',
      question: 'How do I report a suspicious transaction?',
      answer: `To report suspicious activity:
1. Go to Transactions tab
2. Tap on the suspicious transaction
3. Tap "Report Issue"
4. Select "Suspicious Activity"
5. Provide details
6. Submit the report

Immediate action:
• Call our 24/7 security hotline
• Change your password and MPIN
• Enable two-factor authentication

We'll investigate and respond within 24 hours.`
    }
  ];

  const supportChannels = [
    {
      title: 'Call Us',
      icon: 'call-outline',
      color: '#10B981',
      description: '24/7 Customer Support',
      value: '+63 XXX XXXX XXX',
      action: () => {
        Alert.alert(
          'Call Support',
          '24/7 Customer Support Hotline:\n+63 XXX XXXX XXX\n\nAverage wait time: 2-5 minutes',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Call Now', onPress: () => Linking.openURL('tel:+63XXXXXXXXX') }
          ]
        );
      }
    },
    {
      title: 'Email Us',
      icon: 'mail-outline',
      color: '#3B82F6',
      description: 'Response within 24 hours',
      value: 'support@flowpay.com',
      action: () => {
        Linking.openURL('mailto:support@flowpay.com?subject=FlowPay Support Request').catch(() => {
          Alert.alert('Error', 'Could not open email app');
        });
      }
    },
    {
      title: 'Live Chat',
      icon: 'chatbubbles-outline',
      color: '#8B5CF6',
      description: 'Chat with an agent',
      value: 'Available 24/7',
      action: () => {
        Alert.alert('Live Chat', 'Live chat feature coming soon!\n\nFor now, please use email or phone support.');
      }
    },
    {
      title: 'Visit Us',
      icon: 'location-outline',
      color: '#F59E0B',
      description: 'Find a FlowPay center',
      value: 'Multiple locations',
      action: () => {
        Alert.alert(
          'FlowPay Centers',
          'Find the nearest FlowPay service center:\n\n• Manila - SM Megamall\n• Quezon City - SM North EDSA\n• Cebu - SM City Cebu\n• Davao - SM Lanang Premier\n\nHours: Mon-Sat 10AM-8PM',
          [
            { text: 'OK' }
          ]
        );
      }
    }
  ];

  const handleCategoryPress = (action) => {
    const categoryFaqs = faqs.filter(faq => 
      faq.category.toLowerCase().replace(/ & /g, '').replace(/ /g, '') === 
      action.toLowerCase().replace(/([A-Z])/g, ' $1').trim().replace(/ & /g, '').replace(/ /g, '')
    );
    
    Alert.alert(
      helpCategories.find(cat => cat.action === action)?.title,
      `Found ${categoryFaqs.length} articles in this category. Scroll down to view all FAQs.`,
      [{ text: 'OK' }]
    );
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmergency = () => {
    Alert.alert(
      '🚨 Emergency Support',
      'For urgent security issues:\n\n• Lost/Stolen device\n• Unauthorized transactions\n• Account compromise\n\nCall our 24/7 Security Hotline:\n+63 XXX XXXX XXX',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Emergency Line', 
          style: 'destructive',
          onPress: () => Linking.openURL('tel:+63XXXXXXXXX')
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
            <Text style={styles.headerTitle}>Help & Support</Text>
            <TouchableOpacity 
              style={styles.emergencyButton}
              onPress={handleEmergency}
            >
              <Ionicons name="alert-circle" size={24} color="#FF4444" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View style={styles.welcomeIcon}>
            <Ionicons name="help-circle" size={40} color="#179C7D" />
          </View>
          <Text style={styles.welcomeTitle}>How can we help you?</Text>
          <Text style={styles.welcomeText}>
            Find answers to common questions or contact our support team
          </Text>
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for help..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Help Categories */}
        {searchQuery.length === 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Browse by Category</Text>
            <View style={styles.categoriesGrid}>
              {helpCategories.map((category, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.categoryCard}
                  onPress={() => handleCategoryPress(category.action)}
                >
                  <View style={[styles.categoryIcon, { backgroundColor: `${category.color}20` }]}>
                    <Ionicons name={category.icon} size={28} color={category.color} />
                  </View>
                  <Text style={styles.categoryTitle}>{category.title}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Contact Support */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Support</Text>
          {supportChannels.map((channel, index) => (
            <TouchableOpacity
              key={index}
              style={styles.supportCard}
              onPress={channel.action}
            >
              <View style={[styles.supportIcon, { backgroundColor: `${channel.color}20` }]}>
                <Ionicons name={channel.icon} size={24} color={channel.color} />
              </View>
              <View style={styles.supportInfo}>
                <Text style={styles.supportTitle}>{channel.title}</Text>
                <Text style={styles.supportDescription}>{channel.description}</Text>
                <Text style={styles.supportValue}>{channel.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={22} color="#999" />
            </TouchableOpacity>
          ))}
        </View>

        {/* FAQs */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {searchQuery.length > 0 ? `Search Results (${filteredFaqs.length})` : 'Frequently Asked Questions'}
          </Text>
          {filteredFaqs.length === 0 ? (
            <View style={styles.noResults}>
              <Ionicons name="search-outline" size={48} color="#ccc" />
              <Text style={styles.noResultsText}>No results found</Text>
              <Text style={styles.noResultsSubtext}>Try different keywords or contact support</Text>
            </View>
          ) : (
            filteredFaqs.map((faq, index) => (
              <View key={index} style={styles.faqCard}>
                <TouchableOpacity
                  style={styles.faqHeader}
                  onPress={() => toggleFaq(index)}
                >
                  <View style={styles.faqQuestion}>
                    <Text style={styles.faqCategory}>{faq.category}</Text>
                    <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  </View>
                  <Ionicons
                    name={expandedFaq === index ? 'chevron-up' : 'chevron-down'}
                    size={24}
                    color="#179C7D"
                  />
                </TouchableOpacity>
                {expandedFaq === index && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                  </View>
                )}
              </View>
            ))
          )}
        </View>

        {/* Additional Resources */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Additional Resources</Text>
          
          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => navigation.navigate('TermsAndConditions')}
          >
            <Ionicons name="document-text-outline" size={24} color="#179C7D" />
            <Text style={styles.resourceText}>Terms & Conditions</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Ionicons name="shield-checkmark-outline" size={24} color="#179C7D" />
            <Text style={styles.resourceText}>Privacy Policy</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.resourceCard}
            onPress={() => Alert.alert('Video Tutorials', 'Video tutorials coming soon!')}
          >
            <Ionicons name="play-circle-outline" size={24} color="#179C7D" />
            <Text style={styles.resourceText}>Video Tutorials</Text>
            <Ionicons name="chevron-forward" size={20} color="#999" />
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Still need help?</Text>
          <TouchableOpacity
            style={styles.feedbackButton}
            onPress={() => navigation.navigate('SendFeedback')}
          >
            <Ionicons name="chatbox-outline" size={20} color="white" />
            <Text style={styles.feedbackButtonText}>Send Feedback</Text>
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
  emergencyButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  welcomeCard: {
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
  welcomeIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  section: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 15,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  categoryCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  categoryIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  supportCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  supportIcon: {
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  supportInfo: {
    flex: 1,
  },
  supportTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  supportDescription: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  supportValue: {
    fontSize: 13,
    color: '#179C7D',
    fontWeight: '500',
  },
  faqCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
  },
  faqQuestion: {
    flex: 1,
  },
  faqCategory: {
    fontSize: 11,
    color: '#179C7D',
    fontWeight: '600',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  faqQuestionText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  faqAnswer: {
    padding: 15,
    paddingTop: 0,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  faqAnswerText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 22,
  },
  noResults: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noResultsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
    marginTop: 15,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    marginTop: 5,
  },
  resourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  resourceText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 15,
  },
  feedbackButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#179C7D',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
    gap: 8,
  },
  feedbackButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});
