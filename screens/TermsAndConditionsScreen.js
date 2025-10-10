import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking
} from 'react-native';

export default function TermsAndConditionsScreen({ navigation }) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const sections = [
    {
      title: '1. Introduction',
      icon: 'information-circle-outline',
      color: '#3B82F6',
      content: `Welcome to FlowPay. These Terms and Conditions ("Terms") govern your use of the FlowPay mobile application and services. By creating an account and using FlowPay, you agree to be bound by these Terms.

FlowPay is a digital payment platform that enables users to send and receive money, pay bills, and conduct various financial transactions securely and conveniently.`
    },
    {
      title: '2. Account Registration',
      icon: 'person-add-outline',
      color: '#10B981',
      content: `2.1. Eligibility
You must be at least 18 years old and legally capable of entering into binding contracts to use FlowPay.

2.2. Account Information
You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate, current, and complete.

2.3. Account Security
You are responsible for maintaining the confidentiality of your account credentials, including your password and MPIN. You agree to notify FlowPay immediately of any unauthorized use of your account.

2.4. One Account Per User
Each user may maintain only one FlowPay account. Multiple accounts by the same user may be suspended or terminated.`
    },
    {
      title: '3. Services Provided',
      icon: 'apps-outline',
      color: '#8B5CF6',
      content: `FlowPay provides the following services:

3.1. Money Transfers
• Send money to other FlowPay users
• Receive money from other FlowPay users
• Transfer funds using QR codes

3.2. Bill Payments
• Pay utility bills
• Mobile phone top-ups
• Other merchant payments

3.3. Transaction History
• View detailed transaction records
• Download transaction statements
• Monitor account activity

3.4. Account Management
• Manage profile information
• Set up security features
• Configure notification preferences`
    },
    {
      title: '4. Fees and Charges',
      icon: 'cash-outline',
      color: '#F59E0B',
      content: `4.1. Service Fees
FlowPay may charge fees for certain transactions and services. All applicable fees will be clearly disclosed before you complete a transaction.

4.2. Transaction Limits
Your account may be subject to daily, weekly, or monthly transaction limits based on your account verification level and history.

4.3. Currency Conversion
For international transactions, currency conversion rates and fees will apply and will be disclosed at the time of the transaction.

4.4. Fee Changes
FlowPay reserves the right to modify fees with 30 days' advance notice to users.`
    },
    {
      title: '5. User Responsibilities',
      icon: 'shield-checkmark-outline',
      color: '#EF4444',
      content: `5.1. Lawful Use
You agree to use FlowPay only for lawful purposes and in accordance with these Terms.

5.2. Prohibited Activities
You shall NOT:
• Use the service for illegal activities
• Engage in fraudulent transactions
• Violate any laws or regulations
• Interfere with the service's operation
• Attempt to gain unauthorized access
• Use the service to harass or harm others

5.3. Transaction Verification
You are responsible for verifying the accuracy of all transaction details before confirming any payment.

5.4. Dispute Resolution
You agree to cooperate with FlowPay in resolving any disputes or suspected fraudulent activity.`
    },
    {
      title: '6. Privacy and Data Protection',
      icon: 'lock-closed-outline',
      color: '#06B6D4',
      content: `6.1. Data Collection
FlowPay collects and processes personal information in accordance with our Privacy Policy.

6.2. Data Usage
We use your data to:
• Process transactions
• Verify your identity
• Prevent fraud and money laundering
• Improve our services
• Comply with legal obligations

6.3. Data Security
We implement industry-standard security measures to protect your personal and financial information.

6.4. Third-Party Sharing
We do not sell your personal information. We may share data with service providers and regulatory authorities as required by law.`
    },
    {
      title: '7. Transaction Processing',
      icon: 'swap-horizontal-outline',
      color: '#EC4899',
      content: `7.1. Transaction Authorization
By confirming a transaction, you authorize FlowPay to process the payment from your account.

7.2. Processing Time
Most transactions are processed instantly. Some transactions may take up to 24 hours depending on the recipient's bank or payment method.

7.3. Failed Transactions
If a transaction fails, funds will be returned to your account. You will be notified of the failure reason.

7.4. Transaction Disputes
For disputed transactions, contact FlowPay support within 60 days of the transaction date.

7.5. Refunds
Refunds are processed according to our refund policy and may take 5-10 business days.`
    },
    {
      title: '8. Account Suspension and Termination',
      icon: 'ban-outline',
      color: '#DC2626',
      content: `8.1. Suspension Reasons
FlowPay may suspend or terminate your account if:
• You violate these Terms
• Suspicious or fraudulent activity is detected
• Required verification documents are not provided
• Your account is inactive for an extended period

8.2. Account Closure
You may close your account at any time through the app settings. Outstanding balances must be settled before closure.

8.3. Data Retention
After account closure, we may retain certain information as required by law or for legitimate business purposes.`
    },
    {
      title: '9. Liability and Disclaimers',
      icon: 'alert-circle-outline',
      color: '#F97316',
      content: `9.1. Service Availability
FlowPay strives to provide uninterrupted service but does not guarantee that the service will be available at all times.

9.2. Limitation of Liability
FlowPay shall not be liable for:
• Indirect, incidental, or consequential damages
• Loss of profits or business opportunities
• Service interruptions beyond our control
• Errors or delays in transaction processing

9.3. Force Majeure
FlowPay is not liable for failures caused by circumstances beyond our reasonable control.

9.4. Maximum Liability
Our total liability shall not exceed the fees paid by you in the 12 months preceding the claim.`
    },
    {
      title: '10. Intellectual Property',
      icon: 'copy-outline',
      color: '#14B8A6',
      content: `10.1. Ownership
All content, trademarks, logos, and intellectual property on FlowPay are owned by or licensed to FlowPay.

10.2. License
We grant you a limited, non-exclusive, non-transferable license to use the FlowPay app for personal, non-commercial purposes.

10.3. Restrictions
You may not:
• Copy, modify, or distribute our content
• Reverse engineer the application
• Use our trademarks without permission
• Create derivative works`
    },
    {
      title: '11. Modifications to Terms',
      icon: 'document-text-outline',
      color: '#6366F1',
      content: `11.1. Changes
FlowPay reserves the right to modify these Terms at any time. We will notify users of significant changes via email or in-app notification.

11.2. Acceptance
Continued use of FlowPay after changes constitutes acceptance of the modified Terms.

11.3. Notification Period
Users will be given at least 30 days' notice for material changes to these Terms.`
    },
    {
      title: '12. Contact Information',
      icon: 'mail-outline',
      color: '#84CC16',
      content: `For questions or concerns about these Terms:

Email: support@flowpay.com
Phone: +63 XXX XXXX XXX
Address: FlowPay Inc., Philippines

Customer Support Hours:
Monday - Friday: 9:00 AM - 6:00 PM
Saturday: 10:00 AM - 4:00 PM
Sunday: Closed

24/7 Emergency Support for account security issues.`
    },
    {
      title: '13. Governing Law',
      icon: 'scale-outline',
      color: '#A855F7',
      content: `13.1. Jurisdiction
These Terms shall be governed by and construed in accordance with the laws of the Republic of the Philippines.

13.2. Dispute Resolution
Any disputes arising from these Terms shall be resolved through:
1. Good faith negotiation
2. Mediation
3. Arbitration in the Philippines
4. Courts of the Philippines (if arbitration fails)

13.3. Class Action Waiver
You agree to resolve disputes individually and waive the right to participate in class action lawsuits.`
    },
    {
      title: '14. Additional Provisions',
      icon: 'list-outline',
      color: '#78716C',
      content: `14.1. Severability
If any provision of these Terms is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.

14.2. Entire Agreement
These Terms constitute the entire agreement between you and FlowPay regarding the use of our services.

14.3. Assignment
You may not assign or transfer your rights under these Terms without our written consent.

14.4. Waiver
Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.

Last Updated: October 10, 2025
Version: 1.0`
    }
  ];

  const handleContactSupport = () => {
    Alert.alert(
      'Contact Support',
      'Choose how you would like to contact us:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:support@flowpay.com').catch(() => {
              Alert.alert('Error', 'Could not open email app');
            });
          }
        },
        {
          text: 'Call',
          onPress: () => {
            Alert.alert('Phone Support', '+63 XXX XXXX XXX\n\nMon-Fri: 9AM-6PM\nSat: 10AM-4PM');
          }
        }
      ]
    );
  };

  const handlePrintTerms = () => {
    Alert.alert(
      'Download Terms',
      'Terms and Conditions will be sent to your registered email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Success', 'Terms and Conditions have been sent to your email.');
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
            <Text style={styles.headerTitle}>Terms & Conditions</Text>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handlePrintTerms}
            >
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.introCard}>
          <Text style={styles.introTitle}>FlowPay Terms of Service</Text>
          <Text style={styles.introVersion}>Version 1.0 • Last Updated: October 10, 2025</Text>
          <Text style={styles.introText}>
            Please read these terms carefully before using FlowPay. By using our services, you agree to be bound by these terms and conditions.
          </Text>
        </View>

        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: `${section.color}20` }]}>
                <Ionicons name={section.icon} size={24} color={section.color} />
              </View>
              <Text style={styles.sectionTitle}>{section.title}</Text>
            </View>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        <View style={styles.acknowledgmentCard}>
          <View style={styles.acknowledgmentHeader}>
            <Ionicons name="checkbox-outline" size={28} color="#179C7D" />
            <Text style={styles.acknowledgmentTitle}>Acknowledgment</Text>
          </View>
          <Text style={styles.acknowledgmentText}>
            By using FlowPay, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions and our Privacy Policy.
          </Text>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.supportButton}
            onPress={handleContactSupport}
          >
            <Ionicons name="headset-outline" size={22} color="#179C7D" />
            <Text style={styles.supportButtonText}>Contact Support</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.privacyButton}
            onPress={() => navigation.navigate('PrivacyPolicy')}
          >
            <Ionicons name="shield-checkmark-outline" size={22} color="white" />
            <Text style={styles.privacyButtonText}>Privacy Policy</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 FlowPay Inc. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>
            FlowPay is a registered digital payment service provider in the Philippines.
          </Text>
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
  downloadButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  introCard: {
    backgroundColor: 'white',
    margin: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#179C7D',
    marginBottom: 8,
  },
  introVersion: {
    fontSize: 12,
    color: '#999',
    marginBottom: 12,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  section: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 10,
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    gap: 12,
  },
  sectionIcon: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    flex: 1,
  },
  sectionContent: {
    fontSize: 14,
    color: '#555',
    lineHeight: 22,
  },
  acknowledgmentCard: {
    backgroundColor: '#E8F8F5',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#179C7D',
  },
  acknowledgmentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  acknowledgmentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#179C7D',
  },
  acknowledgmentText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  supportButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 12,
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#179C7D',
  },
  supportButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#179C7D',
  },
  privacyButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#179C7D',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  privacyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 20,
  },
  footerText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    marginBottom: 5,
  },
  footerSubtext: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
  },
});
