
import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const CUSTOMERS_KEY = 'customers';
const PRODUCTS_KEY = 'products';
const TRANSACTIONS_KEY = 'transactions';
const CART_KEY = 'cart';

// Helper functions for data management
const generateId = () => Date.now().toString();

const getStorageData = async (key) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error(`Error getting ${key}:`, error);
    return [];
  }
};

const setStorageData = async (key, data) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error setting ${key}:`, error);
    throw error;
  }
};

export const initDatabase = async () => {
  try {
    // Check if we have any data, if not insert sample data
    const customers = await getStorageData(CUSTOMERS_KEY);
    if (customers.length === 0) {
      await insertSampleData();
    }
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

const insertSampleData = async () => {
  try {
    // Insert sample customers
    const sampleCustomers = [
      {
        id: generateId(),
        name: 'John Doe',
        phone: '+1234567890',
        email: 'john@example.com',
        address: '123 Main St',
        balance: 150.00,
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Jane Smith',
        phone: '+0987654321',
        email: 'jane@example.com',
        address: '456 Oak Ave',
        balance: -50.00,
        created_at: new Date().toISOString()
      }
    ];

    // Insert sample products
    const sampleProducts = [
      {
        id: generateId(),
        name: 'Laptop',
        price: 999.99,
        quantity: 10,
        description: 'High-performance laptop',
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Mouse',
        price: 29.99,
        quantity: 25,
        description: 'Wireless optical mouse',
        created_at: new Date().toISOString()
      },
      {
        id: generateId(),
        name: 'Keyboard',
        price: 79.99,
        quantity: 15,
        description: 'Mechanical gaming keyboard',
        created_at: new Date().toISOString()
      }
    ];

    await setStorageData(CUSTOMERS_KEY, sampleCustomers);
    await setStorageData(PRODUCTS_KEY, sampleProducts);
    await setStorageData(TRANSACTIONS_KEY, []);
    await setStorageData(CART_KEY, []);

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

// Customer operations
export const getCustomers = async () => {
  try {
    const customers = await getStorageData(CUSTOMERS_KEY);
    return customers.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

export const getCustomerById = async (id) => {
  try {
    const customers = await getStorageData(CUSTOMERS_KEY);
    return customers.find(customer => customer.id === id) || null;
  } catch (error) {
    console.error('Error getting customer:', error);
    return null;
  }
};

export const addCustomer = async (customer) => {
  try {
    const customers = await getStorageData(CUSTOMERS_KEY);
    const newCustomer = {
      ...customer,
      id: generateId(),
      balance: 0,
      created_at: new Date().toISOString()
    };
    customers.push(newCustomer);
    await setStorageData(CUSTOMERS_KEY, customers);
    return newCustomer.id;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id, customer) => {
  try {
    const customers = await getStorageData(CUSTOMERS_KEY);
    const index = customers.findIndex(c => c.id === id);
    if (index !== -1) {
      customers[index] = { ...customers[index], ...customer };
      await setStorageData(CUSTOMERS_KEY, customers);
    }
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    const customers = await getStorageData(CUSTOMERS_KEY);
    const filteredCustomers = customers.filter(c => c.id !== id);
    await setStorageData(CUSTOMERS_KEY, filteredCustomers);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Product operations
export const getProducts = async () => {
  try {
    const products = await getStorageData(PRODUCTS_KEY);
    return products.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const products = await getStorageData(PRODUCTS_KEY);
    return products.find(product => product.id === id) || null;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

export const addProduct = async (product) => {
  try {
    const products = await getStorageData(PRODUCTS_KEY);
    const newProduct = {
      ...product,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    products.push(newProduct);
    await setStorageData(PRODUCTS_KEY, products);
    return newProduct.id;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    const products = await getStorageData(PRODUCTS_KEY);
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
      products[index] = { ...products[index], ...product };
      await setStorageData(PRODUCTS_KEY, products);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    const products = await getStorageData(PRODUCTS_KEY);
    const filteredProducts = products.filter(p => p.id !== id);
    await setStorageData(PRODUCTS_KEY, filteredProducts);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Cart operations
export const getCartItems = async () => {
  try {
    const cart = await getStorageData(CART_KEY);
    const products = await getStorageData(PRODUCTS_KEY);
    
    return cart.map(item => {
      const product = products.find(p => p.id === item.product_id);
      return {
        ...item,
        name: product?.name || 'Unknown Product',
        price: product?.price || 0,
        description: product?.description || '',
        image: product?.image || null
      };
    });
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    const cart = await getStorageData(CART_KEY);
    const existingItem = cart.find(item => item.product_id === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({
        id: generateId(),
        product_id: productId,
        quantity
      });
    }

    await setStorageData(CART_KEY, cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (id, quantity) => {
  try {
    const cart = await getStorageData(CART_KEY);
    
    if (quantity <= 0) {
      const filteredCart = cart.filter(item => item.id !== id);
      await setStorageData(CART_KEY, filteredCart);
    } else {
      const index = cart.findIndex(item => item.id === id);
      if (index !== -1) {
        cart[index].quantity = quantity;
        await setStorageData(CART_KEY, cart);
      }
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (id) => {
  try {
    const cart = await getStorageData(CART_KEY);
    const filteredCart = cart.filter(item => item.id !== id);
    await setStorageData(CART_KEY, filteredCart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    await setStorageData(CART_KEY, []);
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Transaction operations
export const getTransactions = async () => {
  try {
    const transactions = await getStorageData(TRANSACTIONS_KEY);
    const customers = await getStorageData(CUSTOMERS_KEY);
    
    return transactions.map(transaction => {
      const customer = customers.find(c => c.id === transaction.customer_id);
      return {
        ...transaction,
        customer_name: customer?.name || 'Unknown Customer'
      };
    }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const getCustomerTransactions = async (customerId) => {
  try {
    const transactions = await getStorageData(TRANSACTIONS_KEY);
    return transactions
      .filter(t => t.customer_id === customerId)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
  } catch (error) {
    console.error('Error getting customer transactions:', error);
    return [];
  }
};

export const addTransaction = async (transaction) => {
  try {
    const transactions = await getStorageData(TRANSACTIONS_KEY);
    const newTransaction = {
      ...transaction,
      id: generateId(),
      created_at: new Date().toISOString()
    };
    
    transactions.push(newTransaction);
    await setStorageData(TRANSACTIONS_KEY, transactions);

    // Update customer balance
    if (transaction.customer_id) {
      const customers = await getStorageData(CUSTOMERS_KEY);
      const customerIndex = customers.findIndex(c => c.id === transaction.customer_id);
      if (customerIndex !== -1) {
        const balanceChange = transaction.type === 'credit' ? transaction.amount : -transaction.amount;
        customers[customerIndex].balance += balanceChange;
        await setStorageData(CUSTOMERS_KEY, customers);
      }
    }

    return newTransaction.id;
  } catch (error) {
    console.error('Error adding transaction:', error);
    throw error;
  }
};

export const checkout = async (customerId, paymentMethod = 'cash', referenceNote = '') => {
  try {
    const cartItems = await getCartItems();
    if (cartItems.length === 0) {
      throw new Error('Cart is empty');
    }

    const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Add sale transaction
    await addTransaction({
      customer_id: customerId,
      type: 'sale',
      amount: total,
      reference_note: referenceNote,
      payment_method: paymentMethod
    });

    // Update product quantities
    const products = await getStorageData(PRODUCTS_KEY);
    for (const item of cartItems) {
      const productIndex = products.findIndex(p => p.id === item.product_id);
      if (productIndex !== -1) {
        products[productIndex].quantity -= item.quantity;
      }
    }
    await setStorageData(PRODUCTS_KEY, products);

    // Clear cart
    await clearCart();

    return total;
  } catch (error) {
    console.error('Error during checkout:', error);
    throw error;
  }
};

// Dashboard/Stats operations
export const getDashboardStats = async () => {
  try {
    const customers = await getStorageData(CUSTOMERS_KEY);
    const products = await getStorageData(PRODUCTS_KEY);
    const transactions = await getStorageData(TRANSACTIONS_KEY);

    const totalSales = transactions
      .filter(t => t.type === 'sale')
      .reduce((sum, t) => sum + t.amount, 0);

    const outstandingBalance = customers
      .filter(c => c.balance < 0)
      .reduce((sum, c) => sum + Math.abs(c.balance), 0);

    return {
      totalCustomers: customers.length,
      totalProducts: products.length,
      totalSales,
      outstandingBalance
    };
  } catch (error) {
    console.error('Error getting dashboard stats:', error);
    return {
      totalCustomers: 0,
      totalProducts: 0,
      totalSales: 0,
      outstandingBalance: 0
    };
  }
};
