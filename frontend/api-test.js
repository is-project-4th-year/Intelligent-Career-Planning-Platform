// Save this as api-test.js and run with Node.js
// First install axios: npm install axios

import axios from "axios";

const API_URL = 'http://127.0.0.1:8000'; // Update with your actual backend URL

async function testRegister() {
  console.log('Testing registration endpoint...');
  try {
    const response = await axios.post(`${API_URL}/api/register/`, {
      first_name: 'Test',
      last_name: 'User',
      email: 'testuser@example.com',
      password: 'Password123!',
      phone: '1234567890',
      role: 'KenSAP'
    });
    console.log('Registration successful:', response.data);
  } catch (error) {
    console.error('Registration failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
  }
}

async function testLogin() {
  console.log('\nTesting login endpoint...');
  try {
    const response = await axios.post(`${API_URL}/api/token/`, {
      email: 'testuser@example.com',
      password: 'Password123!'
    });
    console.log('Login successful:', {
      access: response.data.access ? 'Token received' : 'No token',
      refresh: response.data.refresh ? 'Token received' : 'No token'
    });
  } catch (error) {
    console.error('Login failed:', error.response?.data || error.message);
    console.log('Status:', error.response?.status);
    console.log('Headers:', error.response?.headers);
  }
}

// Run the tests
(async () => {
  await testRegister();
  await testLogin();
})();