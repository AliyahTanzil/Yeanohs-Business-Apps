
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { getSalesData, getCustomers, getProducts } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';

export default function Dashboard() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [salesData, setSalesData] = useState({
    totalTransactions: 0,
    totalSales: 0,
    totalCredits: 0,
    totalDebits: 0
  });
  const [customerCount, setCustomerCount] = useState(0);
  const [productCount, setProductCount] = useState(0);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [sales, customers, products] = await Promise.all([
        getSalesData(),
        getCustomers(),
        getProducts()
      ]);
      
      setSalesData(sales);
      setCustomerCount(customers.length);
      setProductCount(products.length);
    } catch (error) {
      Alert.alert('Error', 'Failed to load dashboard data');
    }
  };

  const StatCard = ({ title, value, color = colors.text }) => (
    <View style={[styles.statCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <Text style={[styles.statTitle, { color: colors.text }]}>{title}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Sales Dashboard</Text>
      </View>

      <View style={styles.statsGrid}>
        <StatCard 
          title="Total Sales" 
          value={`$${salesData.totalSales?.toFixed(2) || '0.00'}`}
          color="#4CAF50"
        />
        <StatCard 
          title="Transactions" 
          value={salesData.totalTransactions?.toString() || '0'}
          color="#2196F3"
        />
        <StatCard 
          title="Credits" 
          value={`$${salesData.totalCredits?.toFixed(2) || '0.00'}`}
          color="#FF9800"
        />
        <StatCard 
          title="Debits" 
          value={`$${salesData.totalDebits?.toFixed(2) || '0.00'}`}
          color="#F44336"
        />
        <StatCard 
          title="Customers" 
          value={customerCount.toString()}
          color="#9C27B0"
        />
        <StatCard 
          title="Products" 
          value={productCount.toString()}
          color="#607D8B"
        />
      </View>

      <TouchableOpacity 
        style={[styles.refreshButton, { backgroundColor: colors.tint }]}
        onPress={loadDashboardData}
      >
        <Text style={styles.refreshButtonText}>Refresh Data</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
    paddingTop: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  refreshButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
