import * as SQLite from 'expo-sqlite';

let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync('sales_calculator.db');

    // Create customers table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        phone TEXT,
        email TEXT,
        address TEXT,
        image TEXT,
        balance REAL DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create products table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 0,
        description TEXT,
        image TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create transactions table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        reference_note TEXT,
        payment_method TEXT DEFAULT 'cash',
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (customer_id) REFERENCES customers (id)
      );
    `);

    // Create cart table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (product_id) REFERENCES products (id)
      );
    `);

    // Insert sample data if tables are empty
    await insertSampleData();

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

const insertSampleData = async () => {
  try {
    // Check if we already have data
    const customerCount = await db.getFirstAsync('SELECT COUNT(*) as count FROM customers');
    if (customerCount.count > 0) return;

    // Insert sample customers
    await db.runAsync(
      'INSERT INTO customers (name, phone, email, address, balance) VALUES (?, ?, ?, ?, ?)',
      ['John Doe', '+1234567890', 'john@example.com', '123 Main St', 150.00]
    );

    await db.runAsync(
      'INSERT INTO customers (name, phone, email, address, balance) VALUES (?, ?, ?, ?, ?)',
      ['Jane Smith', '+0987654321', 'jane@example.com', '456 Oak Ave', -50.00]
    );

    // Insert sample products
    await db.runAsync(
      'INSERT INTO products (name, price, quantity, description) VALUES (?, ?, ?, ?)',
      ['Laptop', 999.99, 10, 'High-performance laptop']
    );

    await db.runAsync(
      'INSERT INTO products (name, price, quantity, description) VALUES (?, ?, ?, ?)',
      ['Mouse', 29.99, 25, 'Wireless optical mouse']
    );

    await db.runAsync(
      'INSERT INTO products (name, price, quantity, description) VALUES (?, ?, ?, ?)',
      ['Keyboard', 79.99, 15, 'Mechanical gaming keyboard']
    );

    console.log('Sample data inserted successfully');
  } catch (error) {
    console.error('Error inserting sample data:', error);
  }
};

// Customer operations
export const getCustomers = async () => {
  try {
    const customers = await db.getAllAsync('SELECT * FROM customers ORDER BY created_at DESC');
    return customers;
  } catch (error) {
    console.error('Error getting customers:', error);
    return [];
  }
};

export const getCustomerById = async (id) => {
  try {
    const customer = await db.getFirstAsync('SELECT * FROM customers WHERE id = ?', [id]);
    return customer;
  } catch (error) {
    console.error('Error getting customer:', error);
    return null;
  }
};

export const addCustomer = async (customer) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO customers (name, phone, email, address, image) VALUES (?, ?, ?, ?, ?)',
      [customer.name, customer.phone, customer.email, customer.address, customer.image]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding customer:', error);
    throw error;
  }
};

export const updateCustomer = async (id, customer) => {
  try {
    await db.runAsync(
      'UPDATE customers SET name = ?, phone = ?, email = ?, address = ?, image = ? WHERE id = ?',
      [customer.name, customer.phone, customer.email, customer.address, customer.image, id]
    );
  } catch (error) {
    console.error('Error updating customer:', error);
    throw error;
  }
};

export const deleteCustomer = async (id) => {
  try {
    await db.runAsync('DELETE FROM customers WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting customer:', error);
    throw error;
  }
};

// Product operations
export const getProducts = async () => {
  try {
    const products = await db.getAllAsync('SELECT * FROM products ORDER BY created_at DESC');
    return products;
  } catch (error) {
    console.error('Error getting products:', error);
    return [];
  }
};

export const getProductById = async (id) => {
  try {
    const product = await db.getFirstAsync('SELECT * FROM products WHERE id = ?', [id]);
    return product;
  } catch (error) {
    console.error('Error getting product:', error);
    return null;
  }
};

export const addProduct = async (product) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO products (name, price, quantity, description, image) VALUES (?, ?, ?, ?, ?)',
      [product.name, product.price, product.quantity, product.description, product.image]
    );
    return result.lastInsertRowId;
  } catch (error) {
    console.error('Error adding product:', error);
    throw error;
  }
};

export const updateProduct = async (id, product) => {
  try {
    await db.runAsync(
      'UPDATE products SET name = ?, price = ?, quantity = ?, description = ?, image = ? WHERE id = ?',
      [product.name, product.price, product.quantity, product.description, product.image, id]
    );
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (id) => {
  try {
    await db.runAsync('DELETE FROM products WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// Cart operations
export const getCartItems = async () => {
  try {
    const items = await db.getAllAsync(`
      SELECT c.*, p.name, p.price, p.description, p.image 
      FROM cart c 
      JOIN products p ON c.product_id = p.id
    `);
    return items;
  } catch (error) {
    console.error('Error getting cart items:', error);
    return [];
  }
};

export const addToCart = async (productId, quantity = 1) => {
  try {
    // Check if item already exists in cart
    const existingItem = await db.getFirstAsync('SELECT * FROM cart WHERE product_id = ?', [productId]);

    if (existingItem) {
      await db.runAsync(
        'UPDATE cart SET quantity = quantity + ? WHERE product_id = ?',
        [quantity, productId]
      );
    } else {
      await db.runAsync(
        'INSERT INTO cart (product_id, quantity) VALUES (?, ?)',
        [productId, quantity]
      );
    }
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

export const updateCartItem = async (id, quantity) => {
  try {
    if (quantity <= 0) {
      await db.runAsync('DELETE FROM cart WHERE id = ?', [id]);
    } else {
      await db.runAsync('UPDATE cart SET quantity = ? WHERE id = ?', [quantity, id]);
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

export const removeFromCart = async (id) => {
  try {
    await db.runAsync('DELETE FROM cart WHERE id = ?', [id]);
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

export const clearCart = async () => {
  try {
    await db.runAsync('DELETE FROM cart');
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

// Transaction operations
export const getTransactions = async () => {
  try {
    const transactions = await db.getAllAsync(`
      SELECT t.*, c.name as customer_name 
      FROM transactions t 
      LEFT JOIN customers c ON t.customer_id = c.id 
      ORDER BY t.created_at DESC
    `);
    return transactions;
  } catch (error) {
    console.error('Error getting transactions:', error);
    return [];
  }
};

export const getCustomerTransactions = async (customerId) => {
  try {
    const transactions = await db.getAllAsync(
      'SELECT * FROM transactions WHERE customer_id = ? ORDER BY created_at DESC',
      [customerId]
    );
    return transactions;
  } catch (error) {
    console.error('Error getting customer transactions:', error);
    return [];
  }
};

export const addTransaction = async (transaction) => {
  try {
    const result = await db.runAsync(
      'INSERT INTO transactions (customer_id, type, amount, reference_note, payment_method) VALUES (?, ?, ?, ?, ?)',
      [transaction.customer_id, transaction.type, transaction.amount, transaction.reference_note, transaction.payment_method]
    );

    // Update customer balance
    if (transaction.customer_id) {
      const balanceChange = transaction.type === 'credit' ? transaction.amount : -transaction.amount;
      await db.runAsync(
        'UPDATE customers SET balance = balance + ? WHERE id = ?',
        [balanceChange, transaction.customer_id]
      );
    }

    return result.lastInsertRowId;
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
    for (const item of cartItems) {
      await db.runAsync(
        'UPDATE products SET quantity = quantity - ? WHERE id = ?',
        [item.quantity, item.product_id]
      );
    }

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
    const totalCustomers = await db.getFirstAsync('SELECT COUNT(*) as count FROM customers');
    const totalProducts = await db.getFirstAsync('SELECT COUNT(*) as count FROM products');

    const totalSales = await db.getFirstAsync(`
      SELECT COALESCE(SUM(amount), 0) as total 
      FROM transactions 
      WHERE type = 'sale'
    `);

    const outstandingBalance = await db.getFirstAsync(`
      SELECT COALESCE(SUM(ABS(balance)), 0) as total 
      FROM customers 
      WHERE balance < 0
    `);

    return {
      totalCustomers: totalCustomers.count,
      totalProducts: totalProducts.count,
      totalSales: totalSales.total,
      outstandingBalance: outstandingBalance.total
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