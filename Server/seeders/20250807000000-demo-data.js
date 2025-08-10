'use strict';
const bcrypt = require('bcrypt');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const adminPassword = await bcrypt.hash('admin123', 10);
    const userPassword = await bcrypt.hash('user123', 10);

    await queryInterface.bulkInsert('Users', [
      {
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Admin User',
        email: 'admin@example.com',
        password: adminPassword,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'Regular User',
        email: 'user@example.com',
        password: userPassword,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    await queryInterface.bulkInsert('Categories', [
      {
        id: '550e8400-e29b-41d4-a716-446655440002',
        name: 'Electronics',
        description: 'Electronic devices and accessories',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440003',
        name: 'Clothing',
        description: 'Fashion and apparel',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);

    return queryInterface.bulkInsert('Products', [
      {
        id: '550e8400-e29b-41d4-a716-446655440004',
        name: 'Smartphone',
        description: 'Latest smartphone with amazing features',
        price: 999.99,
        stock: 50,
        categoryId: '550e8400-e29b-41d4-a716-446655440002',
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: '550e8400-e29b-41d4-a716-446655440005',
        name: 'T-Shirt',
        description: 'Comfortable cotton t-shirt',
        price: 29.99,
        stock: 100,
        categoryId: '550e8400-e29b-41d4-a716-446655440003',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Products', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    return queryInterface.bulkDelete('Users', null, {});
  }
};
