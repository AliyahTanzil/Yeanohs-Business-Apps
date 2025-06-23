
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, Image } from 'react-native';
import { router } from 'expo-router';
import { getProducts, deleteProduct, addToCart } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function Products() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [products, setProducts] = useState([]);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load products');
    }
  };

  const handleDeleteProduct = (id, name) => {
    Alert.alert(
      'Delete Product',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteProduct(id);
              loadProducts();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete product');
            }
          },
        },
      ]
    );
  };

  const handleAddToCart = async (productId, productName) => {
    try {
      await addToCart(productId, 1);
      Alert.alert('Success', `${productName} added to cart`);
    } catch (error) {
      Alert.alert('Error', 'Failed to add product to cart');
    }
  };

  const renderProduct = ({ item }) => (
    <View style={[styles.productCard, { backgroundColor: colors.background, borderColor: colors.border }]}>
      <TouchableOpacity
        style={styles.productInfo}
        onPress={() => router.push({
          pathname: '/product-form',
          params: { productId: item.id, mode: 'edit' }
        })}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.productImage} />
        ) : (
          <View style={[styles.imagePlaceholder, { backgroundColor: colors.tabIconDefault }]}>
            <IconSymbol name="photo" size={24} color={colors.background} />
          </View>
        )}
        <View style={styles.productDetails}>
          <Text style={[styles.productName, { color: colors.text }]}>{item.name}</Text>
          <Text style={[styles.productPrice, { color: colors.tint }]}>${item.price.toFixed(2)}</Text>
          <Text style={[styles.productQuantity, { color: colors.tabIconDefault }]}>Stock: {item.quantity}</Text>
          {item.description && (
            <Text style={[styles.productDescription, { color: colors.tabIconDefault }]} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>
      
      <View style={styles.productActions}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.tint }]}
          onPress={() => handleAddToCart(item.id, item.name)}
          disabled={item.quantity === 0}
        >
          <IconSymbol name="cart.badge.plus" size={20} color="white" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteProduct(item.id, item.name)}
        >
          <IconSymbol name="trash" size={20} color="#F44336" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Products</Text>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push({
            pathname: '/product-form',
            params: { mode: 'create' }
          })}
        >
          <IconSymbol name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        renderItem={renderProduct}
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
  productCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  productInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  productImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  imagePlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  productQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  productDescription: {
    fontSize: 14,
  },
  productActions: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
});
