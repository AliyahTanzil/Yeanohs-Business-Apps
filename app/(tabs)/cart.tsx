import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image, TextInput } from 'react-native';
import { getCart, updateCartQuantity, removeFromCart, clearCart, createTransaction, getCustomers } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function Cart() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [cartItems, setCartItems] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [referenceNote, setReferenceNote] = useState('');

  useEffect(() => {
    loadCart();
    loadCustomers();
  }, []);

  const loadCart = async () => {
    try {
      const data = await getCart();
      setCartItems(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load cart');
    }
  };

  const loadCustomers = async () => {
    try {
      const data = await getCustomers();
      setCustomers(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load customers');
    }
  };

  const updateQuantity = async (id, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(id);
      return;
    }

    try {
      await updateCartQuantity(id, newQuantity);
      loadCart();
    } catch (error) {
      Alert.alert('Error', 'Failed to update quantity');
    }
  };

  const removeItem = async (id) => {
    try {
      await removeFromCart(id);
      loadCart();
    } catch (error) {
      Alert.alert('Error', 'Failed to remove item');
    }
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) {
      Alert.alert('Error', 'Cart is empty');
      return;
    }

    if (!selectedCustomer) {
      Alert.alert('Error', 'Please select a customer');
      return;
    }

    try {
      const transaction = {
        customerId: selectedCustomer.id,
        type: 'sale',
        amount: getTotalPrice(),
        referenceNote,
        paymentMethod
      };

      await createTransaction(transaction, cartItems);
      await clearCart();

      setCartItems([]);
      setSelectedCustomer(null);
      setReferenceNote('');

      Alert.alert('Success', 'Transaction completed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to complete transaction');
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={[styles.cartItem, { backgroundColor: colors.background, borderColor: colors.border }]}>
      {item.image ? (
        <Image source={{ uri: item.image }} style={styles.itemImage} />
      ) : (
        <View style={[styles.imagePlaceholder, { backgroundColor: colors.tabIconDefault }]}>
          <IconSymbol name="photo" size={20} color={colors.background} />
        </View>
      )}

      <View style={styles.itemDetails}>
        <Text style={[styles.itemName, { color: colors.text }]}>{item.name}</Text>
        <Text style={[styles.itemPrice, { color: colors.tint }]}>${item.price.toFixed(2)}</Text>
      </View>

      <View style={styles.quantityContainer}>
        <TouchableOpacity
          style={[styles.quantityButton, { borderColor: colors.border }]}
          onPress={() => updateQuantity(item.id, item.quantity - 1)}
        >
          <Text style={[styles.quantityButtonText, { color: colors.text }]}>-</Text>
        </TouchableOpacity>
        <Text style={[styles.quantity, { color: colors.text }]}>{item.quantity}</Text>
        <TouchableOpacity
          style={[styles.quantityButton, { borderColor: colors.border }]}
          onPress={() => updateQuantity(item.id, item.quantity + 1)}
        >
          <Text style={[styles.quantityButtonText, { color: colors.text }]}>+</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeItem(item.id)}
      >
        <IconSymbol name="trash" size={20} color="#F44336" />
      </TouchableOpacity>
    </View>
  );

  const renderCustomerOption = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.customerOption,
        { 
          backgroundColor: selectedCustomer?.id === item.id ? colors.tint : colors.background,
          borderColor: colors.border 
        }
      ]}
      onPress={() => setSelectedCustomer(item)}
    >
      <Text style={[
        styles.customerOptionText,
        { color: selectedCustomer?.id === item.id ? 'white' : colors.text }
      ]}>
        {item.fullName}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Shopping Cart</Text>
        {cartItems.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => {
              Alert.alert(
                'Clear Cart',
                'Are you sure you want to clear the cart?',
                [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Clear', style: 'destructive', onPress: async () => {
                    await clearCart();
                    loadCart();
                  }},
                ]
              );
            }}
          >
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>
        )}
      </View>

      {cartItems.length === 0 ? (
        <View style={styles.emptyCart}>
          <IconSymbol name="cart" size={64} color={colors.tabIconDefault} />
          <Text style={[styles.emptyCartText, { color: colors.tabIconDefault }]}>Your cart is empty</Text>
        </View>
      ) : (
        <>
          <FlatList
            data={cartItems}
            renderItem={renderCartItem}
            keyExtractor={(item) => item.id.toString()}
            style={styles.cartList}
          />

          <View style={styles.checkoutSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Select Customer:</Text>
            <FlatList
              data={customers}
              renderItem={renderCustomerOption}
              keyExtractor={(item) => item.id.toString()}
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.customerList}
            />

            <Text style={[styles.sectionTitle, { color: colors.text }]}>Payment Method:</Text>
            <View style={styles.paymentMethods}>
              {['cash', 'card', 'bank_transfer'].map((method) => (
                <TouchableOpacity
                  key={method}
                  style={[
                    styles.paymentMethod,
                    { 
                      backgroundColor: paymentMethod === method ? colors.tint : colors.background,
                      borderColor: colors.border 
                    }
                  ]}
                  onPress={() => setPaymentMethod(method)}
                >
                  <Text style={[
                    styles.paymentMethodText,
                    { color: paymentMethod === method ? 'white' : colors.text }
                  ]}>
                    {method.replace('_', ' ').toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.referenceInput, { 
                borderColor: colors.border, 
                color: colors.text,
                backgroundColor: colors.background 
              }]}
              placeholder="Reference note (optional)"
              placeholderTextColor={colors.tabIconDefault}
              value={referenceNote}
              onChangeText={setReferenceNote}
            />

            <View style={styles.totalSection}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>Total:</Text>
              <Text style={[styles.totalAmount, { color: colors.tint }]}>
                ${getTotalPrice().toFixed(2)}
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.checkoutButton, { backgroundColor: colors.tint }]}
              onPress={handleCheckout}
            >
              <Text style={styles.checkoutButtonText}>Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
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
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#F44336',
    fontWeight: 'bold',
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyCartText: {
    fontSize: 18,
    marginTop: 16,
  },
  cartList: {
    flex: 1,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.1)',
    elevation: 3,
  },
  itemImage: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 4,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemPrice: {
    fontSize: 14,
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  quantity: {
    fontSize: 16,
    marginHorizontal: 12,
    minWidth: 20,
    textAlign: 'center',
  },
  removeButton: {
    padding: 4,
  },
  checkoutSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  customerList: {
    marginBottom: 16,
  },
  customerOption: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  customerOptionText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  paymentMethods: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  paymentMethod: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  paymentMethodText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  referenceInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  totalSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  checkoutButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});