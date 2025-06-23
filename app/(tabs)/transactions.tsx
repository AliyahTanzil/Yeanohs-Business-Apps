
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { getTransactions } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function Transactions() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [transactions, setTransactions] = useState<any[]>([]);

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      const data = await getTransactions();
      setTransactions(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load transactions');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getTransactionIcon = (type: string) => {
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

  const getTransactionColor = (type: string) => {
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

  const renderTransaction = ({ item }: { item: any }) => (
    <View style={[styles.transactionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionInfo}>
          <View style={styles.transactionTitleRow}>
            <IconSymbol 
              name={getTransactionIcon(item.type)} 
              size={20} 
              color={getTransactionColor(item.type)} 
            />
            <Text style={[styles.transactionType, { color: colors.text }]}>
              {item.type.toUpperCase()}
            </Text>
          </View>
          {item.customer_name && (
            <Text style={[styles.customerName, { color: colors.tabIconDefault }]}>
              Customer: {item.customer_name}
            </Text>
          )}
          <Text style={[styles.transactionDate, { color: colors.tabIconDefault }]}>
            {formatDate(item.created_at || item.date)}
          </Text>
        </View>
        <View style={styles.amountContainer}>
          <Text style={[styles.amount, { color: getTransactionColor(item.type) }]}>
            ${item.amount.toFixed(2)}
          </Text>
        </View>
      </View>

      {(item.reference_note || item.referenceNote) && (
        <Text style={[styles.referenceNote, { color: colors.tabIconDefault }]}>
          Note: {item.reference_note || item.referenceNote}
        </Text>
      )}

      {(item.payment_method || item.paymentMethod) && (
        <Text style={[styles.paymentMethod, { color: colors.tabIconDefault }]}>
          Payment: {(item.payment_method || item.paymentMethod).replace('_', ' ').toUpperCase()}
        </Text>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Transactions</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadTransactions}
        >
          <IconSymbol name="arrow.clockwise" size={24} color={colors.tint} />
        </TouchableOpacity>
      </View>

      {transactions.length === 0 ? (
        <View style={styles.emptyState}>
          <IconSymbol name="doc.text" size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyStateText, { color: colors.tabIconDefault }]}>
            No transactions found
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          renderItem={renderTransaction}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  refreshButton: {
    padding: 8,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyStateText: {
    fontSize: 18,
    marginTop: 16,
  },
  list: {
    paddingBottom: 20,
  },
  transactionCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
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
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  customerName: {
    fontSize: 14,
    marginBottom: 4,
  },
  transactionDate: {
    fontSize: 12,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  referenceNote: {
    fontSize: 14,
    marginTop: 8,
    fontStyle: 'italic',
  },
  paymentMethod: {
    fontSize: 12,
    marginTop: 4,
  },
});
