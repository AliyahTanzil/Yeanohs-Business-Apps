
import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Image, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { createCustomer, updateCustomer, getCustomers } from '@/services/database';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Colors } from '@/constants/Colors';
import { IconSymbol } from '@/components/ui/IconSymbol';

export default function CustomerForm() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { customerId, mode } = useLocalSearchParams();
  
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    address: '',
    profileImage: ''
  });

  useEffect(() => {
    if (mode === 'edit' && customerId) {
      loadCustomer();
    }
  }, [customerId, mode]);

  const loadCustomer = async () => {
    try {
      const customers = await getCustomers();
      const customer = customers.find(c => c.id.toString() === customerId);
      if (customer) {
        setFormData({
          fullName: customer.fullName || '',
          phoneNumber: customer.phoneNumber || '',
          email: customer.email || '',
          address: customer.address || '',
          profileImage: customer.profileImage || ''
        });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load customer data');
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
        setFormData({ ...formData, profileImage: result.assets[0].uri });
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
        setFormData({ ...formData, profileImage: result.assets[0].uri });
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
    if (!formData.fullName.trim()) {
      Alert.alert('Error', 'Please enter customer name');
      return;
    }

    try {
      if (mode === 'edit' && customerId) {
        await updateCustomer(parseInt(customerId), formData);
        Alert.alert('Success', 'Customer updated successfully');
      } else {
        await createCustomer(formData);
        Alert.alert('Success', 'Customer created successfully');
      }
      router.back();
    } catch (error) {
      Alert.alert('Error', 'Failed to save customer');
    }
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.imageSection}>
        <TouchableOpacity onPress={handleImageSelection} style={styles.imageContainer}>
          {formData.profileImage ? (
            <Image source={{ uri: formData.profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.imagePlaceholder, { backgroundColor: colors.tabIconDefault }]}>
              <IconSymbol name="person.fill" size={40} color={colors.background} />
            </View>
          )}
        </TouchableOpacity>
        <TouchableOpacity onPress={handleImageSelection} style={styles.changeImageButton}>
          <Text style={[styles.changeImageText, { color: colors.tint }]}>
            {formData.profileImage ? 'Change Photo' : 'Add Photo'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formSection}>
        <Text style={[styles.label, { color: colors.text }]}>Full Name *</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          value={formData.fullName}
          onChangeText={(text) => setFormData({ ...formData, fullName: text })}
          placeholder="Enter full name"
          placeholderTextColor={colors.tabIconDefault}
        />

        <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          value={formData.phoneNumber}
          onChangeText={(text) => setFormData({ ...formData, phoneNumber: text })}
          placeholder="Enter phone number"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="phone-pad"
        />

        <Text style={[styles.label, { color: colors.text }]}>Email</Text>
        <TextInput
          style={[styles.input, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          value={formData.email}
          onChangeText={(text) => setFormData({ ...formData, email: text })}
          placeholder="Enter email address"
          placeholderTextColor={colors.tabIconDefault}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={[styles.label, { color: colors.text }]}>Address</Text>
        <TextInput
          style={[styles.textArea, { borderColor: colors.border, color: colors.text, backgroundColor: colors.background }]}
          value={formData.address}
          onChangeText={(text) => setFormData({ ...formData, address: text })}
          placeholder="Enter address"
          placeholderTextColor={colors.tabIconDefault}
          multiline
          numberOfLines={3}
        />
      </View>

      <View style={styles.buttonSection}>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: colors.tint }]}
          onPress={handleSave}
        >
          <Text style={styles.saveButtonText}>
            {mode === 'edit' ? 'Update Customer' : 'Create Customer'}
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
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  imagePlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
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
