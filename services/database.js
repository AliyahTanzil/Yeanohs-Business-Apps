
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabase('sales_calculator.db');

// Initialize database tables
export const initDatabase = () => {
  db.transaction(tx => {
    // Customers table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        fullName TEXT NOT NULL,
        phoneNumber TEXT,
        email TEXT,
        address TEXT,
        profileImage TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Products table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price REAL NOT NULL,
        quantity INTEGER NOT NULL,
        description TEXT,
        image TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      );`
    );

    // Transactions table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customerId INTEGER,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        date DATETIME DEFAULT CURRENT_TIMESTAMP,
        referenceNote TEXT,
        paymentMethod TEXT,
        FOREIGN KEY (customerId) REFERENCES customers (id)
      );`
    );

    // Cart table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        productId INTEGER,
        quantity INTEGER NOT NULL,
        FOREIGN KEY (productId) REFERENCES products (id)
      );`
    );

    // Transaction items table (for detailed breakdown)
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS transaction_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transactionId INTEGER,
        productId INTEGER,
        quantity INTEGER NOT NULL,
        unitPrice REAL NOT NULL,
        FOREIGN KEY (transactionId) REFERENCES transactions (id),
        FOREIGN KEY (productId) REFERENCES products (id)
      );`
    );

    // Insert sample data
    insertSampleData();
  });
};

const insertSampleData = () => {
  // Sample customers
  db.transaction(tx => {
    tx.executeSql(
      'INSERT OR IGNORE INTO customers (id, fullName, phoneNumber, email, address) VALUES (?, ?, ?, ?, ?)',
      [1, 'John Doe', '+1234567890', 'john@example.com', '123 Main St, City']
    );
    tx.executeSql(
      'INSERT OR IGNORE INTO customers (id, fullName, phoneNumber, email, address) VALUES (?, ?, ?, ?, ?)',
      [2, 'Jane Smith', '+0987654321', 'jane@example.com', '456 Oak Ave, Town']
    );
  });

  // Sample products
  db.transaction(tx => {
    tx.executeSql(
      'INSERT OR IGNORE INTO products (id, name, price, quantity, description) VALUES (?, ?, ?, ?, ?)',
      [1, 'Laptop', 999.99, 10, 'High-performance laptop']
    );
    tx.executeSql(
      'INSERT OR IGNORE INTO products (id, name, price, quantity, description) VALUES (?, ?, ?, ?, ?)',
      [2, 'Mouse', 29.99, 50, 'Wireless optical mouse']
    );
    tx.executeSql(
      'INSERT OR IGNORE INTO products (id, name, price, quantity, description) VALUES (?, ?, ?, ?, ?)',
      [3, 'Keyboard', 79.99, 25, 'Mechanical keyboard']
    );
  });
};

// Customer operations
export const createCustomer = (customer) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO customers (fullName, phoneNumber, email, address, profileImage) VALUES (?, ?, ?, ?, ?)',
        [customer.fullName, customer.phoneNumber, customer.email, customer.address, customer.profileImage],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getCustomers = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM customers ORDER BY createdAt DESC',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateCustomer = (id, customer) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE customers SET fullName = ?, phoneNumber = ?, email = ?, address = ?, profileImage = ? WHERE id = ?',
        [customer.fullName, customer.phoneNumber, customer.email, customer.address, customer.profileImage, id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteCustomer = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM customers WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// Product operations
export const createProduct = (product) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO products (name, price, quantity, description, image) VALUES (?, ?, ?, ?, ?)',
        [product.name, product.price, product.quantity, product.description, product.image],
        (_, result) => resolve(result.insertId),
        (_, error) => reject(error)
      );
    });
  });
};

export const getProducts = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM products ORDER BY createdAt DESC',
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateProduct = (id, product) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE products SET name = ?, price = ?, quantity = ?, description = ?, image = ? WHERE id = ?',
        [product.name, product.price, product.quantity, product.description, product.image, id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const deleteProduct = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM products WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// Cart operations
export const addToCart = (productId, quantity) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM cart WHERE productId = ?',
        [productId],
        (_, result) => {
          if (result.rows.length > 0) {
            // Update existing cart item
            const newQuantity = result.rows._array[0].quantity + quantity;
            tx.executeSql(
              'UPDATE cart SET quantity = ? WHERE productId = ?',
              [newQuantity, productId],
              (_, updateResult) => resolve(updateResult),
              (_, error) => reject(error)
            );
          } else {
            // Insert new cart item
            tx.executeSql(
              'INSERT INTO cart (productId, quantity) VALUES (?, ?)',
              [productId, quantity],
              (_, insertResult) => resolve(insertResult.insertId),
              (_, error) => reject(error)
            );
          }
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getCart = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT c.*, p.name, p.price, p.image 
         FROM cart c 
         JOIN products p ON c.productId = p.id`,
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const updateCartQuantity = (id, quantity) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'UPDATE cart SET quantity = ? WHERE id = ?',
        [quantity, id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const removeFromCart = (id) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM cart WHERE id = ?',
        [id],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

export const clearCart = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'DELETE FROM cart',
        [],
        (_, result) => resolve(result),
        (_, error) => reject(error)
      );
    });
  });
};

// Transaction operations
export const createTransaction = (transaction, cartItems) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      // Insert transaction
      tx.executeSql(
        'INSERT INTO transactions (customerId, type, amount, referenceNote, paymentMethod) VALUES (?, ?, ?, ?, ?)',
        [transaction.customerId, transaction.type, transaction.amount, transaction.referenceNote, transaction.paymentMethod],
        (_, result) => {
          const transactionId = result.insertId;
          
          // Insert transaction items and update product quantities
          cartItems.forEach(item => {
            tx.executeSql(
              'INSERT INTO transaction_items (transactionId, productId, quantity, unitPrice) VALUES (?, ?, ?, ?)',
              [transactionId, item.productId, item.quantity, item.price]
            );
            
            // Update product quantity
            tx.executeSql(
              'UPDATE products SET quantity = quantity - ? WHERE id = ?',
              [item.quantity, item.productId]
            );
          });
          
          resolve(transactionId);
        },
        (_, error) => reject(error)
      );
    });
  });
};

export const getTransactions = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT t.*, c.fullName as customerName 
         FROM transactions t 
         LEFT JOIN customers c ON t.customerId = c.id 
         ORDER BY t.date DESC`,
        [],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getCustomerTransactions = (customerId) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'SELECT * FROM transactions WHERE customerId = ? ORDER BY date DESC',
        [customerId],
        (_, result) => resolve(result.rows._array),
        (_, error) => reject(error)
      );
    });
  });
};

export const getSalesData = () => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `SELECT 
           COUNT(*) as totalTransactions,
           SUM(CASE WHEN type = 'sale' THEN amount ELSE 0 END) as totalSales,
           SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END) as totalCredits,
           SUM(CASE WHEN type = 'debit' THEN amount ELSE 0 END) as totalDebits
         FROM transactions`,
        [],
        (_, result) => resolve(result.rows._array[0]),
        (_, error) => reject(error)
      );
    });
  });
};
