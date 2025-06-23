
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createProduct, updateProduct, getProducts } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function ProductForm() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { productId, mode } = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    quantity: '',
    description: '',
    image: ''
  });

  useEffect(() => {
    if (mode === 'edit' && productId) {
      loadProduct();
    }
  }, [productId, mode]);

  const loadProduct = async () => {
    try {
      const products = await getProducts();
      const product = products.find(p => p.id.toString() === productId);
      if (product) {
        setFormData({
          name: product.name || '',
          price: product.price.toString() || '',
          quantity: product.quantity.toString() || '',
          description: product.description || '',
          image: product.image || ''
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load product data');
    }
  };

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
      });

      if (!result.canceled) {
        setFormData({ ...formData, image: result.assets[0].uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const handleImageSelection = () => {
    Alert.alert(
      'Select Image',
      'Choose an option',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Camera', onPress: takePhoto },
        { text: 'Gallery', onPress: pickImage },
      ]
    );
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      Alert.alert('Error', 'Please enter product name');
      return;
    }

    if (!formData.price.trim() || isNaN(parseFloat(formData.price))) {
      Alert.alert('Error', 'Please enter a valid price');
      return;
    }

    if (!formData.quantity.trim() || isNaN(parseInt(formData.quantity))) {
      Alert.alert('Error', 'Please enter a valid quantity');
      return;
    }

    try {
      const productData = {
        name: formData.name.trim(),
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        description: formData.description.trim(),
        image: formData.image
      };

      if (mode === 'edit' && productId) {
        await updateProduct(parseInt(productId), productData);
        Alert.alert('Success', 'Product updated successfully');
      } else {
        await createProduct(productData);
        Alert.alert('Success', 'Product created successfully');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save product');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageSection}>
        <TouchableOpacity onPress={handleImageSelection} style={styles.imageContainer}>
          {formData.image ? (
            <Image source={{ uri: formData.image }} style={styles.productImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.tabIconDefault }]}>
              <IconSymbol name="photo" size={40} color={colors.background} />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleImageSelection} style={styles.changeImageButton}>
          <Text style={[styles.changeImageText, { color: colors.tint }]}>
            {formData.image ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.text }]}>Product Name *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter product name"
          placeholderTextColor={colors.tabIconDefault}
        />

        <Text style={[styles.label, { color: colors.text }]}>Price *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          placeholder="Enter price"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="decimal-pad"
        />

        <Text style={[styles.label, { color: colors.text }]}>Quantity *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          value={formData.quantity}
          onChangeText={(text) => setFormData({ ...formData, quantity: text })}
          placeholder="Enter quantity"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="number-pad"
        />

        <Text style={[styles.label, { color: colors.text }]}>Description</Text>
        <TextInput
          style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Enter product description"
          placeholderTextColor={colors.tabIconDefault}
          multiline
          numberOfLines={4}
        />
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {mode === 'edit' ? 'Update Product' : 'Create Product'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: colors.border }]}
          onPress={() => router.back()}
        >
          <Text style={[styles.cancelButtonText, { color: colors.text }]}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  imageSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  imageContainer: {
    marginBottom: 12,
  },
  productImage: {
    width: 150,
    height: 150,
    borderRadius: 12,
  },
  imagePlaceholder: {
    width: 150,
    height: 150,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  changeImageButton: {
    padding: 8,
  },
  changeImageText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  formSection: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    textAlignVertical: 'top',
  },
  buttonSection: {
    gap: 12,
    marginBottom: 32,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
