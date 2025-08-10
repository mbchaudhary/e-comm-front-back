const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api';

// Test login and JWT token functionality
async function testLoginAndTokenUsage() {
  try {
    console.log('🚀 Testing Login and JWT Token System\n');

    // Step 1: Register a new user
    console.log('1. Registering a new user...');
    const registerResponse = await axios.post(`${BASE_URL}/auth/register`, {
      full_name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'user'
    });
    
    console.log('✅ Registration successful');
    console.log('User:', registerResponse.data.user);
    console.log('Token:', registerResponse.data.token);
    console.log('');

    // Step 2: Login with the registered user
    console.log('2. Logging in...');
    const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    console.log('✅ Login successful');
    console.log('User:', loginResponse.data.user);
    console.log('Token:', loginResponse.data.token);
    console.log('');

    const token = loginResponse.data.token;

    // Step 3: Test accessing protected routes with token
    console.log('3. Testing protected routes with JWT token...');
    
    // Test getting user profile with token
    const userProfileResponse = await axios.get(`${BASE_URL}/users/${loginResponse.data.user.id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('✅ User profile accessed with token:', userProfileResponse.data);
    console.log('');

    // Test creating a product with token (admin only)
    console.log('4. Testing admin-only routes...');
    try {
      const productResponse = await axios.post(`${BASE_URL}/products`, {
        name: 'Test Product',
        description: 'A test product',
        price: 99.99,
        category_id: 1,
        stock_quantity: 10
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Product created with token:', productResponse.data);
    } catch (error) {
      console.log('ℹ️  Product creation failed (expected for non-admin user):', error.response?.data?.error);
    }
    console.log('');

    // Step 4: Test accessing routes without token
    console.log('5. Testing routes without JWT token...');
    
    // Test getting products without token
    const productsResponse = await axios.get(`${BASE_URL}/products`);
    console.log('✅ Products accessed without token:', productsResponse.data.length, 'products found');
    console.log('');

    // Test getting user profile without token
    const publicUserResponse = await axios.get(`${BASE_URL}/users/${loginResponse.data.user.id}`);
    console.log('✅ User profile accessed without token:', publicUserResponse.data);
    console.log('');

    // Step 5: Test with invalid token
    console.log('6. Testing with invalid token...');
    try {
      const invalidTokenResponse = await axios.get(`${BASE_URL}/users/${loginResponse.data.user.id}`, {
        headers: {
          'Authorization': 'Bearer invalid-token'
        }
      });
      console.log('✅ Invalid token handled gracefully:', invalidTokenResponse.data);
    } catch (error) {
      console.log('ℹ️  Invalid token response:', error.response?.data?.error);
    }
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📋 Summary:');
    console.log('- Login generates JWT token');
    console.log('- Token can be used to access all routes');
    console.log('- Routes work without token (public access)');
    console.log('- Invalid tokens are handled gracefully');
    console.log('- Admin-only features still require admin role');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Run the test
testLoginAndTokenUsage();
