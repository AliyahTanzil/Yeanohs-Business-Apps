
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { getCustomers, deleteCustomer } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function Customers() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customers');
    }
  };

  const handleDeleteCustomer = (id, name) => {
    Alert.alert(
      'Delete Customer',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteCustomer(id);
              loadCustomers();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete customer');
            }
          },
        },
      ]
    );
  };

  const renderCustomer = ({ item }) => (
    <TouchableOpacity
      style={[styles.customerCard, { backgroundColor: colors.background, borderColor: colors.border }]}
      onPress={() => router.push({
        pathname: '/customer-details',
        params: { customerId: item.id }
      })}
    >
      <View style={styles.customerInfo}>
        {item.profileImage ? (
          <Image source={{ uri: item.profileImage }} style={styles.avatar} />
        ) : (
          <View style={[styles.avatarPlaceholder, { backgroundColor: colors.tabIconDefault }]}>
            <IconSymbol name="person.fill" size={24} color={colors.background} />
          </View>
        )}
        <View style={styles.customerDetails}>
          <Text style={[styles.customerName, { color: colors.text }]}>{item.fullName}</Text>
          <Text style={[styles.customerPhone, { color: colors.tabIconDefault }]}>{item.phoneNumber}</Text>
          <Text style={[styles.customerEmail, { color: colors.tabIconDefault }]}>{item.email}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => handleDeleteCustomer(item.id, item.fullName)}
      >
        <IconSymbol name="trash" size={20} color="#F44336" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Customers</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/customer-form')}
        >
          <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={customers}
        renderItem={renderCustomer}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
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
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    paddingBottom: 20,
  },
  customerCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  customerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  customerDetails: {
    flex: 1,
  },
  customerName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  customerPhone: {
    fontSize: 14,
    marginBottom: 2,
  },
  customerEmail: {
    fontSize: 14,
  },
  deleteButton: {
    padding: 8,
  },
});
