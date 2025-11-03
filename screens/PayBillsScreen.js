import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  SafeAreaView,
  Modal,
  Animated,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../supabase';

const BILL_CATEGORIES = [
  { 
    id: 'electricity', 
    name: 'Electricity', 
    icon: 'flash',
    providers: [
      { id: 'batelec2-balayan', name: 'BATELEC II - Balayan' },
      { id: 'batelec2-nasugbu', name: 'BATELEC II - Nasugbu' }
    ]
  },
  { 
    id: 'water', 
    name: 'Water', 
    icon: 'water',
    providers: [
      { id: 'balayan-water', name: 'Balayan Water District' },
      { id: 'prime-water-nasugbu', name: 'Prime Water Nasugbu' },
      { id: 'lian-water', name: 'Lian Water District' }
    ]
  },
  { 
    id: 'internet', 
    name: 'Internet', 
    icon: 'wifi',
    providers: [
      { id: 'pldt', name: 'PLDT' },
      { id: 'globe-home', name: 'Globe At Home' },
      { id: 'converge', name: 'Converge ICT' },
      { id: 'sky-cable', name: 'Sky Cable' },
      { id: 'dito-fiber', name: 'DITO Fiber' },
      { id: 'streamtech', name: 'Streamtech' }
    ]
  },
  { 
    id: 'phone', 
    name: 'Phone', 
    icon: 'phone-portrait',
    providers: [
      { id: 'globe', name: 'Globe Telecom' },
      { id: 'smart', name: 'Smart Communications' },
      { id: 'dito', name: 'DITO Telecommunity' },
      { id: 'sun', name: 'Sun Cellular' }
    ]
  },
  { 
    id: 'cable', 
    name: 'Cable TV', 
    icon: 'tv',
    providers: [
      { id: 'sky-cable-tv', name: 'Sky Cable' },
      { id: 'cignal', name: 'Cignal TV' },
      { id: 'gsat', name: 'G Sat' },
      { id: 'destiny-cable', name: 'Destiny Cable' }
    ]
  },
  { 
    id: 'others', 
    name: 'Others', 
    icon: 'receipt',
    providers: [
      { id: 'sss', name: 'SSS Contribution/Loan' },
      { id: 'pagibig', name: 'Pag-IBIG Fund' },
      { id: 'philhealth', name: 'PhilHealth' },
      { id: 'insurance', name: 'Insurance Companies' },
      { id: 'credit-card', name: 'Credit Card Bills' },
      { id: 'government', name: 'Government Services' }
    ]
  },
];

export default function PayBillsScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [billerReference, setBillerReference] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState('');
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showProviderModal, setShowProviderModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredProviders, setFilteredProviders] = useState([]);
  
  // Use refs for animations to prevent state updates during render
  const modalAnimation = useRef(new Animated.Value(0)).current;
  const providerModalAnimation = useRef(new Animated.Value(0)).current;

  // Function to reset all form fields
  const resetForm = () => {
    setBillerReference('');
    setFullName('');
    setEmail('');
    setAmount('');
    setSelectedProvider(null);
    setSelectedCategory(null);
    setSearchQuery('');
  };

  // Filter providers based on search query
  useEffect(() => {
    if (selectedCategory && selectedCategory.providers) {
      if (searchQuery.trim() === '') {
        setFilteredProviders(selectedCategory.providers);
      } else {
        const filtered = selectedCategory.providers.filter(provider =>
          provider.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setFilteredProviders(filtered);
      }
    }
  }, [searchQuery, selectedCategory]);

  const openConfirmationModal = () => {
    // Safety check
    if (!selectedCategory || !selectedProvider) {
      Alert.alert('Error', 'Please select a category and provider');
      return;
    }

    setShowConfirmation(true);
    // Use setTimeout to ensure state is updated before animation
    setTimeout(() => {
      Animated.spring(modalAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }, 10);
  };

  const closeConfirmationModal = () => {
    Animated.timing(modalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowConfirmation(false);
      }
    });
  };

  const openProviderModal = (category) => {
    setSelectedCategory(category);
    setFilteredProviders(category.providers);
    setSearchQuery('');
    setShowProviderModal(true);
    // Use setTimeout to ensure state is updated before animation
    setTimeout(() => {
      Animated.spring(providerModalAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    }, 10);
  };

  const closeProviderModal = () => {
    Animated.timing(providerModalAnimation, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShowProviderModal(false);
        setSearchQuery('');
      }
    });
  };

  const handleProviderSelect = (provider) => {
    setSelectedProvider(provider);
    closeProviderModal();
  };

  const handlePayBill = async () => {
    if (!selectedCategory) {
      Alert.alert('Error', 'Please select a bill category');
      return;
    }

    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!selectedProvider) {
      Alert.alert('Error', 'Please select a provider');
      return;
    }

    if (selectedCategory.id === 'phone') {
      if (!billerReference) {
        Alert.alert('Error', 'Please enter the mobile number');
        return;
      }
      if (billerReference.length !== 11) {
        Alert.alert('Error', 'Please enter a valid 11-digit mobile number');
        return;
      }
    } else {
      if (!billerReference) {
        Alert.alert('Error', 'Please enter your Biller Reference Number');
        return;
      }

      if (!fullName && selectedCategory.id !== 'phone') {
        Alert.alert('Error', 'Please enter your full name');
        return;
      }

      if (!email && selectedCategory.id !== 'phone' && selectedCategory.id !== 'cable' && selectedCategory.id !== 'others') {
        Alert.alert('Error', 'Please enter your email');
        return;
      }

      // Basic email validation
      if (email && selectedCategory.id !== 'phone' && selectedCategory.id !== 'cable' && selectedCategory.id !== 'others') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          Alert.alert('Error', 'Please enter a valid email address');
          return;
        }
      }
    }

    openConfirmationModal();
  };

  const handleConfirmPayment = async () => {
    setIsProcessing(true);
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'Please log in again');
        setIsProcessing(false);
        return;
      }

      // Get user's profile to check balance
      const { data: profile, error: profileError } = await supabase
        .from('profile')
        .select('balance')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      const paymentAmount = parseFloat(amount);
      if (profile.balance < paymentAmount) {
        Alert.alert('Error', 'Insufficient balance');
        setIsProcessing(false);
        return;
      }

      // 1. Insert into BILLS table (bill-specific information)
      const { error: billError } = await supabase
        .from('bills')
        .insert([
          {
            user_id: user.id,
            bill_type: selectedCategory?.name,
            amount: paymentAmount,
            due_date: new Date().toISOString().split('T')[0], // Today's date
            status: 'paid',
          }
        ]);

      if (billError) {
        throw billError;
      }

      // 2. Insert into TRANSACTIONS table (financial transaction record)
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert([
          {
            user_id: user.id,
            type: 'bill',
            amount: -paymentAmount, // Negative for payment outflow
            description: `Paid ${selectedProvider?.name} bill - ${fullName} (Ref: ${billerReference})`,
            status: 'completed',
            counterparty: selectedProvider?.name,
            recipient_name: fullName || 'Customer',
          }
        ]);

      if (transactionError) {
        throw transactionError;
      }

      // 3. Update user balance in profile table
      const { error: updateError } = await supabase
        .from('profile')
        .update({ balance: profile.balance - paymentAmount })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      closeConfirmationModal();
      setIsProcessing(false);
      
      // Use setTimeout to ensure modal is fully closed
      setTimeout(() => {
        Alert.alert(
          '✅ Success',
          'Bill payment successful!',
          [{ 
            text: 'OK', 
            onPress: () => {
              resetForm();
              navigation.goBack();
            }
          }]
        );
      }, 300);

    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
      Alert.alert('Error', 'Failed to process payment. Please try again.');
    }
  };

  const renderProviderModal = () => {
    const modalTranslateY = providerModalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [600, 0],
    });

    return (
      <Modal
        visible={showProviderModal}
        transparent={true}
        animationType="none"
        onRequestClose={closeProviderModal}
      >
        <View style={styles.providerModalOverlay}>
          <Animated.View 
            style={[
              styles.providerModalContainer,
              {
                transform: [{ translateY: modalTranslateY }]
              }
            ]}
          >
            {/* Header */}
            <LinearGradient
              colors={['#0D7A5F', '#179C7D']}
              style={styles.providerModalHeader}
            >
              <View style={styles.providerModalHeaderContent}>
                <TouchableOpacity
                  style={styles.providerModalBackButton}
                  onPress={closeProviderModal}
                >
                  <Ionicons name="arrow-back" size={24} color="white" />
                </TouchableOpacity>
                <Text style={styles.providerModalTitle}>
                  Select {selectedCategory?.name} Provider
                </Text>
              </View>
              
              {/* Search Bar */}
              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder={`Search ${selectedCategory?.name} providers...`}
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCapitalize="none"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery('')}
                    style={styles.clearSearchButton}
                  >
                    <Ionicons name="close-circle" size={20} color="#999" />
                  </TouchableOpacity>
                )}
              </View>
            </LinearGradient>

            {/* Providers List */}
            <View style={styles.providersListContainer}>
              <FlatList
                data={filteredProviders}
                keyExtractor={(item) => item.id}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.providersListContent}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.providerItem,
                      selectedProvider?.id === item.id && styles.selectedProviderItem,
                    ]}
                    onPress={() => handleProviderSelect(item)}
                  >
                    <View style={styles.providerItemIcon}>
                      <Ionicons 
                        name={
                          selectedCategory?.id === 'electricity' ? 'flash' :
                          selectedCategory?.id === 'water' ? 'water' :
                          selectedCategory?.id === 'internet' ? 'wifi' :
                          selectedCategory?.id === 'phone' ? 'phone-portrait' :
                          selectedCategory?.id === 'cable' ? 'tv' : 'receipt'
                        } 
                        size={24} 
                        color="#4A90A4" 
                      />
                    </View>
                    <Text style={styles.providerItemName}>{item.name}</Text>
                    <Ionicons 
                      name="chevron-forward" 
                      size={20} 
                      color="#CCC" 
                    />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={styles.noResultsContainer}>
                    <Ionicons name="search-outline" size={48} color="#CCC" />
                    <Text style={styles.noResultsText}>No providers found</Text>
                    <Text style={styles.noResultsSubtext}>
                      Try searching with different keywords
                    </Text>
                  </View>
                }
              />
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const renderConfirmationModal = () => {
    const modalTranslateY = modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [500, 0],
    });

    const modalScale = modalAnimation.interpolate({
      inputRange: [0, 1],
      outputRange: [0.8, 1],
    });

    // Safety check - don't render if required data is missing
    if (!selectedCategory || !selectedProvider) {
      return null;
    }

    return (
      <Modal
        visible={showConfirmation}
        transparent={true}
        animationType="none"
        onRequestClose={closeConfirmationModal}
      >
        <View style={styles.modalOverlay}>
          <Animated.View 
            style={[
              styles.modalContainer,
              {
                transform: [
                  { translateY: modalTranslateY },
                  { scale: modalScale }
                ]
              }
            ]}
          >
            {/* Header */}
            <LinearGradient
              colors={['#0D7A5F', '#179C7D']}
              style={styles.modalHeader}
            >
              <View style={styles.modalHeaderContent}>
                <View style={styles.modalIconContainer}>
                  <Ionicons name="checkmark-circle" size={32} color="white" />
                </View>
                <Text style={styles.modalTitle}>Confirm Payment</Text>
                <Text style={styles.modalSubtitle}>Review your payment details</Text>
              </View>
            </LinearGradient>

            {/* Amount Section */}
            <View style={styles.amountSection}>
              <Text style={styles.amountLabel}>Amount to Pay</Text>
              <Text style={styles.amountValue}>
                ₱{Number(amount).toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </Text>
            </View>

            {/* Details Section */}
            <View style={styles.detailsSection}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Provider</Text>
                <Text style={styles.detailValue}>{selectedProvider.name}</Text>
              </View>

              {selectedCategory.id === 'phone' ? (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Mobile Number</Text>
                  <Text style={styles.detailValue}>{billerReference}</Text>
                </View>
              ) : selectedCategory.id === 'cable' ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Subscriber Number</Text>
                    <Text style={styles.detailValue}>{billerReference}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Subscriber Name</Text>
                    <Text style={styles.detailValue}>{fullName}</Text>
                  </View>
                </>
              ) : selectedCategory.id === 'internet' ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Number</Text>
                    <Text style={styles.detailValue}>{billerReference}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Name</Text>
                    <Text style={styles.detailValue}>{fullName}</Text>
                  </View>
                  {email && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{email}</Text>
                    </View>
                  )}
                </>
              ) : selectedCategory.id === 'others' ? (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Reference Number</Text>
                    <Text style={styles.detailValue}>{billerReference}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Account Name</Text>
                    <Text style={styles.detailValue}>{fullName}</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Biller Reference</Text>
                    <Text style={styles.detailValue}>{billerReference}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Full Name</Text>
                    <Text style={styles.detailValue}>{fullName}</Text>
                  </View>
                  {email && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Email</Text>
                      <Text style={styles.detailValue}>{email}</Text>
                    </View>
                  )}
                </>
              )}

              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Category</Text>
                <Text style={styles.detailValue}>{selectedCategory.name}</Text>
              </View>
            </View>

            {/* Footer Buttons */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={closeConfirmationModal}
                disabled={isProcessing}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.confirmButton]}
                onPress={handleConfirmPayment}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" size="small" />
                ) : (
                  <Text style={styles.confirmButtonText}>Confirm Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    );
  };

  const renderDetailsPage = () => {
    // Safety check
    if (!selectedProvider || !selectedCategory) {
      return renderCategorySelection();
    }

    return (
      <>
        <LinearGradient
          colors={['#0D7A5F', '#179C7D', '#20B890']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedProvider(null);
              // Reset form fields when going back
              setBillerReference('');
              setFullName('');
              setEmail('');
              setAmount('');
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedProvider.name}</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <View style={styles.inputSection}>
            {selectedCategory.id === 'phone' ? (
              // Phone/Telecom fields
              <>
                <Text style={styles.inputLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.input}
                  value={billerReference}
                  onChangeText={setBillerReference}
                  placeholder="Enter mobile number (e.g., 09XX XXX XXXX)"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                  maxLength={11}
                />
              </>
            ) : selectedCategory.id === 'cable' ? (
              // Cable TV fields
              <>
                <Text style={styles.inputLabel}>Subscriber/Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={billerReference}
                  onChangeText={setBillerReference}
                  placeholder="Enter subscriber/account number"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Subscriber Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter subscriber name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </>
            ) : selectedCategory.id === 'others' ? (
              // Others fields
              <>
                <Text style={styles.inputLabel}>Reference/Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={billerReference}
                  onChangeText={setBillerReference}
                  placeholder="Enter reference/account number"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Account Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter account name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />
              </>
            ) : selectedCategory.id === 'internet' ? (
              // Internet provider fields
              <>
                <Text style={styles.inputLabel}>Account Number</Text>
                <TextInput
                  style={styles.input}
                  value={billerReference}
                  onChangeText={setBillerReference}
                  placeholder="Enter account number"
                  placeholderTextColor="#999"
                  keyboardType="numeric"
                />

                <Text style={styles.inputLabel}>Account Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter account name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            ) : (
              // Other providers fields (electricity and water)
              <>
                <Text style={styles.inputLabel}>Biller Reference Number</Text>
                <TextInput
                  style={styles.input}
                  value={billerReference}
                  onChangeText={setBillerReference}
                  placeholder="Enter biller reference number"
                  placeholderTextColor="#999"
                />

                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#999"
                  autoCapitalize="words"
                />

                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  placeholderTextColor="#999"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </>
            )}

            <Text style={styles.inputLabel}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="₱0.00"
              placeholderTextColor="#999"
              keyboardType="decimal-pad"
            />

            <TouchableOpacity
              style={styles.payButton}
              onPress={handlePayBill}
            >
              <Text style={styles.payButtonText}>Pay Bill</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {renderConfirmationModal()}
      </>
    );
  };

  const renderCategorySelection = () => {
    return (
      <>
        <LinearGradient
          colors={['#0D7A5F', '#179C7D', '#20B890']}
          style={styles.header}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              resetForm();
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Pay Bills</Text>
        </LinearGradient>

        <ScrollView style={styles.content}>
          <Text style={styles.sectionTitle}>Select Bill Category</Text>
          <View style={styles.categoriesGrid}>
            {BILL_CATEGORIES.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() => openProviderModal(category)}
              >
                <View style={styles.categoryIcon}>
                  <Ionicons name={category.icon} size={24} color="#4A90A4" />
                </View>
                <Text style={styles.categoryText}>{category.name}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Selected Provider Display */}
          {selectedProvider && selectedCategory && (
            <View style={styles.selectedProviderSection}>
              <Text style={styles.sectionTitle}>Selected Provider</Text>
              <View style={styles.selectedProviderCard}>
                <View style={styles.selectedProviderIcon}>
                  <Ionicons 
                    name={
                      selectedCategory.id === 'electricity' ? 'flash' :
                      selectedCategory.id === 'water' ? 'water' :
                      selectedCategory.id === 'internet' ? 'wifi' :
                      selectedCategory.id === 'phone' ? 'phone-portrait' :
                      selectedCategory.id === 'cable' ? 'tv' : 'receipt'
                    } 
                    size={24} 
                    color="#4A90A4" 
                  />
                </View>
                <View style={styles.selectedProviderInfo}>
                  <Text style={styles.selectedProviderName}>{selectedProvider.name}</Text>
                  <Text style={styles.selectedProviderCategory}>{selectedCategory.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.changeProviderButton}
                  onPress={() => openProviderModal(selectedCategory)}
                >
                  <Text style={styles.changeProviderText}>Change</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </ScrollView>

        {renderProviderModal()}
      </>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {selectedProvider ? renderDetailsPage() : renderCategorySelection()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    paddingTop: 40,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  headerTitle: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  categoryCard: {
    width: '30%',
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  categoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryText: {
    fontSize: 12,
    color: '#333',
    textAlign: 'center',
    fontWeight: '500',
  },
  // Selected Provider Section
  selectedProviderSection: {
    marginBottom: 20,
  },
  selectedProviderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedProviderIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  selectedProviderInfo: {
    flex: 1,
  },
  selectedProviderName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  selectedProviderCategory: {
    fontSize: 14,
    color: '#666',
  },
  changeProviderButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#4A90A4',
    borderRadius: 8,
  },
  changeProviderText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
  },
  // Provider Modal Styles
  providerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  providerModalContainer: {
    flex: 1,
    backgroundColor: 'white',
    marginTop: 60,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    overflow: 'hidden',
  },
  providerModalHeader: {
    paddingTop: 20,
    paddingBottom: 15,
  },
  providerModalHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  providerModalBackButton: {
    marginRight: 15,
  },
  providerModalTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    borderRadius: 12,
    paddingHorizontal: 15,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  clearSearchButton: {
    padding: 4,
  },
  providersListContainer: {
    flex: 1,
  },
  providersListContent: {
    padding: 20,
  },
  providerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f8f8',
    padding: 15,
    borderRadius: 12,
    marginBottom: 10,
  },
  selectedProviderItem: {
    backgroundColor: '#E8F5F8',
    borderColor: '#4A90A4',
    borderWidth: 2,
  },
  providerItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F9FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  providerItemName: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noResultsText: {
    fontSize: 18,
    color: '#666',
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 8,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  // Input Section Styles
  inputSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 10,
    fontSize: 16,
    marginBottom: 20,
    color: '#333',
  },
  payButton: {
    backgroundColor: '#4A90A4',
    padding: 18,
    borderRadius: 15,
    alignItems: 'center',
    marginTop: 10,
  },
  payButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  // Confirmation Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginHorizontal: 10,
    marginBottom: 10,
    maxHeight: '85%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 25,
    paddingBottom: 20,
  },
  modalHeaderContent: {
    alignItems: 'center',
  },
  modalIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  modalTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  modalSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  amountSection: {
    alignItems: 'center',
    padding: 25,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
  },
  amountValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0D7A5F',
  },
  detailsSection: {
    padding: 25,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  detailLabel: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    paddingTop: 10,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelButton: {
    backgroundColor: '#f8f8f8',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  confirmButton: {
    backgroundColor: '#0D7A5F',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});