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

export default function PrivacyPolicyScreen({ navigation }) {
  const sections = [
    {
      title: '1. Information We Collect',
      icon: 'document-text-outline',
      color: '#3B82F6',
      content: `1.1. Personal Information
When you register for FlowPay, we collect:
• Full name
• Email address
• Phone number
• Date of birth
• Physical address
• Government-issued ID information
• Biometric data (fingerprint for authentication)

1.2. Financial Information
• Bank account details
• Transaction history
• Payment card information (encrypted)
• Account balance
• Credit/debit records

1.3. Device Information
• Device type and model
• Operating system version
• IP address
• Device identifiers (UDID, IMEI)
• Mobile network information

1.4. Usage Data
• App usage patterns
• Transaction timestamps
• Login history
• Feature interactions
• Error logs and crash reports`
    },
    {
      title: '2. How We Use Your Information',
      icon: 'cog-outline',
      color: '#10B981',
      content: `We use your information to:

2.1. Provide Services
• Process transactions and payments
• Verify your identity
• Maintain your account
• Send transaction confirmations
• Provide customer support

2.2. Security and Fraud Prevention
• Detect and prevent fraudulent activities
• Monitor suspicious transactions
• Verify account authenticity
• Protect against unauthorized access
• Comply with anti-money laundering regulations

2.3. Communication
• Send important service updates
• Notify you of transactions
• Provide promotional offers (with consent)
• Respond to your inquiries
• Send security alerts

2.4. Improvement and Analytics
• Analyze usage patterns
• Improve app performance
• Develop new features
• Conduct research and analysis
• Personalize user experience`
    },
    {
      title: '3. Data Sharing and Disclosure',
      icon: 'share-social-outline',
      color: '#8B5CF6',
      content: `3.1. We DO NOT Sell Your Data
FlowPay does not sell, rent, or trade your personal information to third parties for marketing purposes.

3.2. Service Providers
We may share data with:
• Payment processors
• Cloud service providers
• Customer support platforms
• Analytics services
• Security and fraud prevention services

3.3. Legal Requirements
We may disclose information when required by:
• Court orders or subpoenas
• Government authorities
• Law enforcement agencies
• Regulatory compliance
• Protection of legal rights

3.4. Business Transfers
In case of merger, acquisition, or sale, your information may be transferred to the new entity.

3.5. Consent
We will share information with third parties only when you have given explicit consent.`
    },
    {
      title: '4. Data Security',
      icon: 'shield-checkmark-outline',
      color: '#EF4444',
      content: `4.1. Security Measures
We implement industry-standard security practices:
• 256-bit SSL/TLS encryption
• Encrypted data storage
• Secure authentication protocols
• Regular security audits
• Penetration testing
• Multi-factor authentication
• Biometric security options

4.2. Access Controls
• Role-based access restrictions
• Employee data access monitoring
• Secure API endpoints
• Regular access reviews

4.3. Data Protection
• Automatic session timeouts
• Encrypted database storage
• Secure backup systems
• Disaster recovery procedures

4.4. Incident Response
• 24/7 security monitoring
• Immediate breach notification
• Incident investigation procedures
• Remediation processes`
    },
    {
      title: '5. Your Privacy Rights',
      icon: 'key-outline',
      color: '#F59E0B',
      content: `5.1. Access Rights
You have the right to:
• Access your personal data
• Request a copy of your data
• View your transaction history
• Download your information

5.2. Correction and Update
You may:
• Update your profile information
• Correct inaccurate data
• Modify your preferences
• Update contact details

5.3. Data Portability
You can:
• Export your data in a standard format
• Transfer data to another service
• Request data in machine-readable format

5.4. Deletion Rights
You may request:
• Account deletion
• Removal of specific data
• Erasure of personal information
(Subject to legal retention requirements)

5.5. Opt-Out Rights
You can opt-out of:
• Marketing communications
• Promotional emails
• Push notifications
• Data analytics (where applicable)

5.6. Complaint Rights
• File complaints with data protection authorities
• Contact our privacy officer
• Seek legal remedies`
    },
    {
      title: '6. Data Retention',
      icon: 'time-outline',
      color: '#06B6D4',
      content: `6.1. Retention Period
We retain your data for:
• Active accounts: Duration of account existence
• Transaction records: 7 years (regulatory requirement)
• Communication logs: 3 years
• Marketing data: Until opt-out or 2 years
• Security logs: 1 year

6.2. Retention Purposes
Data is retained to:
• Comply with legal obligations
• Resolve disputes
• Prevent fraud
• Enforce agreements
• Maintain business records

6.3. Data Deletion
After retention periods:
• Personal data is securely deleted
• Backups are purged
• Third-party data is requested for removal
• Anonymized data may be retained for analytics`
    },
    {
      title: '7. Cookies and Tracking',
      icon: 'analytics-outline',
      color: '#EC4899',
      content: `7.1. Cookies We Use
• Essential cookies: Required for app functionality
• Performance cookies: Analyze app usage
• Functionality cookies: Remember preferences
• Analytics cookies: Understand user behavior

7.2. Tracking Technologies
• Session identifiers
• Device fingerprinting
• Location services
• Analytics SDKs

7.3. Managing Cookies
You can:
• Control cookie preferences in settings
• Disable non-essential cookies
• Clear cookie data
• Opt-out of analytics tracking

7.4. Third-Party Cookies
Some services may use their own cookies:
• Payment gateways
• Social media integrations
• Analytics platforms`
    },
    {
      title: '8. Children\'s Privacy',
      icon: 'people-outline',
      color: '#14B8A6',
      content: `8.1. Age Restrictions
FlowPay is not intended for users under 18 years of age.

8.2. No Children Data Collection
We do not knowingly collect information from:
• Children under 13 years
• Minors under 18 years (without parental consent)

8.3. Parent/Guardian Rights
If you believe a minor has provided information:
• Contact us immediately
• We will delete the data promptly
• Account will be terminated

8.4. Verification
We implement age verification during registration to prevent minor access.`
    },
    {
      title: '9. International Data Transfers',
      icon: 'globe-outline',
      color: '#6366F1',
      content: `9.1. Data Location
Your data may be stored and processed in:
• Philippines (primary data center)
• Cloud servers in multiple regions
• Secure international facilities

9.2. Transfer Safeguards
For international transfers, we ensure:
• Standard contractual clauses
• Adequate data protection measures
• Compliance with local laws
• Encryption during transfer

9.3. Cross-Border Compliance
We comply with:
• Philippine Data Privacy Act
• International data protection standards
• Regional privacy regulations`
    },
    {
      title: '10. Third-Party Links',
      icon: 'link-outline',
      color: '#84CC16',
      content: `10.1. External Services
FlowPay may contain links to:
• Partner websites
• Merchant sites
• Social media platforms
• Third-party services

10.2. Third-Party Privacy Policies
We are not responsible for:
• Privacy practices of external sites
• Data collection by third parties
• Security of other platforms
• Content on linked websites

10.3. User Responsibility
When using third-party services:
• Review their privacy policies
• Understand their data practices
• Make informed decisions
• Protect your personal information`
    },
    {
      title: '11. Updates to Privacy Policy',
      icon: 'refresh-outline',
      color: '#A855F7',
      content: `11.1. Policy Changes
We may update this Privacy Policy to reflect:
• Changes in our practices
• Legal or regulatory requirements
• New features or services
• User feedback

11.2. Notification
We will notify you of changes via:
• Email to registered address
• In-app notifications
• Banner on login screen
• Updated date on privacy policy

11.3. Acceptance
Continued use after changes indicates acceptance of the updated policy.

11.4. Review Period
Material changes will have a 30-day review period before taking effect.`
    },
    {
      title: '12. Contact Information',
      icon: 'mail-outline',
      color: '#F97316',
      content: `For privacy-related inquiries:

Data Protection Officer:
Email: privacy@flowpay.com
Phone: +63 XXX XXXX XXX

Privacy Department:
Address: FlowPay Inc.
Privacy Office
Philippines

Response Time:
• General inquiries: 5 business days
• Data requests: 30 days
• Security issues: 24 hours
• Complaints: 10 business days

Office Hours:
Monday - Friday: 9:00 AM - 6:00 PM
Saturday: 10:00 AM - 4:00 PM

Emergency Contact:
For immediate security concerns, contact our 24/7 security hotline.`
    }
  ];

  const handleContactPrivacy = () => {
    Alert.alert(
      'Contact Privacy Office',
      'Choose how you would like to contact our Data Protection Officer:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Email',
          onPress: () => {
            Linking.openURL('mailto:privacy@flowpay.com').catch(() => {
              Alert.alert('Error', 'Could not open email app');
            });
          }
        },
        {
          text: 'Call',
          onPress: () => {
            Alert.alert('Privacy Office', '+63 XXX XXXX XXX\n\nMon-Fri: 9AM-6PM\nSat: 10AM-4PM');
          }
        }
      ]
    );
  };

  const handleDownloadPolicy = () => {
    Alert.alert(
      'Download Privacy Policy',
      'Privacy Policy will be sent to your registered email address.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: () => {
            Alert.alert('Success', 'Privacy Policy has been sent to your email.');
          }
        }
      ]
    );
  };

  const handleManageData = () => {
    Alert.alert(
      'Manage Your Data',
      'Choose an action:',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Download My Data', onPress: () => Alert.alert('Data Export', 'Your data export request has been submitted. You will receive a download link via email within 48 hours.') },
        { text: 'Delete My Data', style: 'destructive', onPress: () => Alert.alert('Data Deletion', 'To delete your data, please contact our Privacy Office at privacy@flowpay.com') }
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
            <Text style={styles.headerTitle}>Privacy Policy</Text>
            <TouchableOpacity 
              style={styles.downloadButton}
              onPress={handleDownloadPolicy}
            >
              <Ionicons name="download-outline" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      <ScrollView style={styles.content}>
        <View style={styles.introCard}>
          <View style={styles.introIcon}>
            <Ionicons name="shield-checkmark" size={40} color="#179C7D" />
          </View>
          <Text style={styles.introTitle}>Your Privacy Matters</Text>
          <Text style={styles.introVersion}>Effective Date: October 10, 2025</Text>
          <Text style={styles.introText}>
            At FlowPay, we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, share, and protect your data.
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

        <View style={styles.dataRightsCard}>
          <View style={styles.dataRightsHeader}>
            <Ionicons name="finger-print" size={28} color="#179C7D" />
            <Text style={styles.dataRightsTitle}>Manage Your Privacy</Text>
          </View>
          <Text style={styles.dataRightsText}>
            You have control over your personal data. Exercise your privacy rights at any time.
          </Text>
          <TouchableOpacity 
            style={styles.manageDataButton}
            onPress={handleManageData}
          >
            <Text style={styles.manageDataButtonText}>Manage My Data</Text>
            <Ionicons name="arrow-forward" size={20} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={styles.contactButton}
            onPress={handleContactPrivacy}
          >
            <Ionicons name="mail-outline" size={22} color="#179C7D" />
            <Text style={styles.contactButtonText}>Contact Privacy Office</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.termsButton}
            onPress={() => navigation.navigate('TermsAndConditions')}
          >
            <Ionicons name="document-text-outline" size={22} color="#179C7D" />
            <Text style={styles.termsButtonText}>Terms & Conditions</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2025 FlowPay Inc. All rights reserved.</Text>
          <Text style={styles.footerSubtext}>
            Compliant with Philippine Data Privacy Act of 2012 and international privacy standards.
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
    padding: 25,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  introIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#E8F8F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
    marginBottom: 15,
  },
  introText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    textAlign: 'center',
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
  dataRightsCard: {
    backgroundColor: '#E8F8F5',
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 20,
    padding: 20,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#179C7D',
  },
  dataRightsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 10,
  },
  dataRightsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#179C7D',
  },
  dataRightsText: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
    marginBottom: 15,
  },
  manageDataButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#179C7D',
    padding: 15,
    borderRadius: 12,
    gap: 8,
  },
  manageDataButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  actionButtons: {
    flexDirection: 'row',
    marginHorizontal: 20,
    gap: 10,
    marginBottom: 20,
  },
  contactButton: {
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
  contactButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#179C7D',
  },
  termsButton: {
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
  termsButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#179C7D',
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
    lineHeight: 16,
  },
});
