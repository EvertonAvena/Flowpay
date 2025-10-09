import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, TextInput, TouchableOpacity } from 'react-native';
import { supabase } from '../supabase';

export default function PayBillsScreen({ navigation }) {
  const [billType, setBillType] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');

  const handlePayBill = async () => {
    if (!billType || !amount || !dueDate) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Error', 'No user found.');
        return;
      }
      // Insert bill
      const { error } = await supabase.from('bills').insert([{
        user_id: user.id,
        bill_type: billType,
        amount: Number(amount),
        due_date: dueDate,
        status: 'paid'
      }]);
      if (error) throw error;
      Alert.alert('Success', 'Bill paid!', [
        { text: 'OK', onPress: () => navigation.goBack() }
      ]);
    } catch (err) {
      Alert.alert('Error', err.message || 'Payment failed.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Pay Bills</Text>
      <TextInput
        style={styles.input}
        placeholder="Bill Type (e.g. Electricity)"
        value={billType}
        onChangeText={setBillType}
      />
      <TextInput
        style={styles.input}
        placeholder="Amount"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <TextInput
        style={styles.input}
        placeholder="Due Date (YYYY-MM-DD)"
        value={dueDate}
        onChangeText={setDueDate}
      />
      <TouchableOpacity style={styles.button} onPress={handlePayBill}>
        <Text style={styles.buttonText}>Pay</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#179C7D', marginBottom: 30, alignSelf: 'center' },
  input: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#e0e0e0'
  },
  button: {
    backgroundColor: '#179C7D',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 10
  },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});