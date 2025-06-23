
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Image, FlatList } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { getCustomers, getCustomerTransactions } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function CustomerDetails() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { customerId } = useLocalSearchParams();
  
  const [customer, setCustomer] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (customerId) {
      loadCustomerData();
    }
  }, [customerId]);

  const loadCustomerData = async () => {
    try {
      const [customers, customerTransactions] = await Promise.all([
        getCustomers(),
        getCustomerTransactions(parseInt(customerId))
      ]);
      
      const customerData = customers.find(c => c.id.toString() === customerId);
      setCustomer(customerData);
      setTransactions(customerTransactions);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer data');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionIcon = (type) => {
    switch (type) {
      case 'sale':
        return 'cart.fill';
      case 'credit':
        return 'plus.circle.fill';
      case 'debit':
        return 'minus.circle.fill';
      default:
        return 'doc.text.fill';
    }
  };

  const getTransactionColor = (type) => {
    switch (type) {
      case 'sale':
        return '#4CAF50';
      case 'credit':
        return '#2196F3';
      case 'debit':
        return '#F44336';
      default:
        return colors.text;
    }
  };

  const calculateBalance = () => {
    return transactions.reduce((balance, transaction) => {
      switch (transaction.type) {
        case 'credit':
          return balance + transaction.amount;
        case 'debit':
          return balance - transaction.amount;
        default:
          return balance;
      }
    }, 0);
  };

  const renderTransaction = ({ item }) => (
    <View style={[styles.transactionItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={styles.transactionTitleRow}>
            <IconSymbol 
              name={getTransactionIcon(item.type)} 
              size={18} 
              color={getTransactionColor(item.type)} 
            />
            <Text style={[styles.transactionType, { color: colors.text }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.transactionDate, { color: colors.tabIconDefault }]}>
            {formatDate(item.date)}
          </Text>
        </View>
        <Text style={[styles.transactionAmount, { color: getTransactionColor(item.type) }]}>
          ${item.amount.toFixed(2)}
        </Text>
      </View>
      
      {item.referenceNote && (
        <Text style={[styles.referenceNote, { color: colors.tabIconDefault }]}>
          {item.referenceNote}
        </Text>
      )}
    </View>
  );

  if (!customer) {
    return (
      <View style={[styles.container, styles.centered, { backgroundColor: colors.background }]}>
        <Text style={[styles.loadingText, { color: colors.text }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.editButton}
          onPress={() => router.push({
            pathname: '/customer-form',
            params: { customerId: customer.id, mode: 'edit' }
          })}
        >
          <IconSymbol name="pencil" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      <View style={styles.profileSection}>
        {customer.profileImage ? (
          <Image source={{ uri: customer.profileImage }} style={styles.profileImage} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.tabIconDefault }]}>
            <IconSymbol name="person.fill" size={40} color={colors.background} />
          </View>
        )}
        
        <Text style={[styles.customerName, { color: colors.text }]}>{customer.fullName}</Text>
        
        <View style={styles.contactInfo}>
          {customer.phoneNumber && (
            <View style={styles.contactItem}>
              <IconSymbol name="phone.fill" size={16} color={colors.tabIconDefault} />
              <Text style={[styles.contactText, { color: colors.text }]}>{customer.phoneNumber}</Text>
            </View>
          )}
          {customer.email && (
            <View style={styles.contactItem}>
              <IconSymbol name="envelope.fill" size={16} color={colors.tabIconDefault} />
              <Text style={[styles.contactText, { color: colors.text }]}>{customer.email}</Text>
            </View>
          )}
          {customer.address && (
            <View style={styles.contactItem}>
              <IconSymbol name="location.fill" size={16} color={colors.tabIconDefault} />
              <Text style={[styles.contactText, { color: colors.text }]}>{customer.address}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.balanceSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Account Balance</Text>
        <Text style={[styles.balanceAmount, { color: calculateBalance() >= 0 ? '#4CAF50' : '#F44336' }]}>
          ${Math.abs(calculateBalance()).toFixed(2)} {calculateBalance() >= 0 ? 'Credit' : 'Debit'}
        </Text>
      </View>

      <View style={styles.transactionsSection}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Transaction History</Text>
        {transactions.length === 0 ? (
          <View style={styles.emptyTransactions}>
            <IconSymbol name="doc.text" size={32} color={colors.tabIconDefault} />
            <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>No transactions found</Text>
          </View>
        ) : (
          <FlatList
            data={transactions}
            renderItem={renderTransaction}
            keyExtractor={(item) => item.id.toString()}
            scrollEnabled={false}
            contentContainerStyle={styles.transactionsList}
          />
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  editButton: {
    padding: 8,
  },
  profileSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  contactInfo: {
    alignItems: 'center',
    gap: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 16,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 32,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  transactionsSection: {
    marginBottom: 32,
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: 32,
  },
  emptyText: {
    fontSize: 16,
    marginTop: 8,
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  transactionType: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  transactionDate: {
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  referenceNote: {
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
});
