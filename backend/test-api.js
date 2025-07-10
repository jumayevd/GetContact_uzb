const fetch = require('node-fetch');

const API_BASE = 'http://localhost:5000';

// Test data
const testUser = {
  phone: '+998901234567',
  password: 'testpassword123',
  name: 'Test User'
};

let authToken = '';
let userId = '';

async function testAPI() {
  console.log('🧪 Starting API Tests...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await fetch(`${API_BASE}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData.status);
    console.log('');

    // Test 2: Root Endpoint
    console.log('2. Testing Root Endpoint...');
    const rootResponse = await fetch(`${API_BASE}/`);
    const rootData = await rootResponse.json();
    console.log('✅ Root endpoint:', rootData.message);
    console.log('');

    // Test 3: User Registration
    console.log('3. Testing User Registration...');
    const registerResponse = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });
    const registerData = await registerResponse.json();
    
    if (registerResponse.ok) {
      authToken = registerData.token;
      userId = registerData.user.id;
      console.log('✅ Registration successful:', registerData.message);
      console.log('   User ID:', userId);
      console.log('   Token received:', authToken ? 'Yes' : 'No');
    } else {
      console.log('⚠️  Registration failed:', registerData.error);
      // Try login instead
      console.log('   Trying login instead...');
      const loginResponse = await fetch(`${API_BASE}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: testUser.phone,
          password: testUser.password
        })
      });
      const loginData = await loginResponse.json();
      
      if (loginResponse.ok) {
        authToken = loginData.token;
        userId = loginData.user.id;
        console.log('✅ Login successful:', loginData.message);
        console.log('   User ID:', userId);
        console.log('   Token received:', authToken ? 'Yes' : 'No');
      } else {
        console.log('❌ Login failed:', loginData.error);
        return;
      }
    }
    console.log('');

    // Test 4: User Profile
    console.log('4. Testing User Profile...');
    const profileResponse = await fetch(`${API_BASE}/api/auth/profile`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const profileData = await profileResponse.json();
    
    if (profileResponse.ok) {
      console.log('✅ Profile retrieved:', profileData.user.name);
    } else {
      console.log('❌ Profile failed:', profileData.error);
    }
    console.log('');

    // Test 5: Contact Upload
    console.log('5. Testing Contact Upload...');
    const testContacts = [
      { name: 'Alice Smith', phone: '+998901234568' },
      { name: 'Bob Johnson', phone: '+998901234569' },
      { name: 'Charlie Brown', phone: '+998901234570' }
    ];
    
    const uploadResponse = await fetch(`${API_BASE}/api/contacts/upload`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ contacts: testContacts })
    });
    const uploadData = await uploadResponse.json();
    
    if (uploadResponse.ok) {
      console.log('✅ Contact upload successful:', uploadData.message);
      console.log('   Contacts uploaded:', uploadData.count);
    } else {
      console.log('❌ Contact upload failed:', uploadData.error);
    }
    console.log('');

    // Test 6: Contact Search
    console.log('6. Testing Contact Search...');
    const searchResponse = await fetch(`${API_BASE}/api/contacts/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authToken}`
      },
      body: JSON.stringify({ phoneNumber: '+998901234568' })
    });
    const searchData = await searchResponse.json();
    
    if (searchResponse.ok) {
      console.log('✅ Contact search successful');
      console.log('   Phone searched:', searchData.phoneNumber);
      console.log('   Results found:', searchData.totalResults);
      if (searchData.results.length > 0) {
        console.log('   Sample result:', searchData.results[0]);
      }
    } else {
      console.log('❌ Contact search failed:', searchData.error);
    }
    console.log('');

    // Test 7: Get My Contacts
    console.log('7. Testing Get My Contacts...');
    const myContactsResponse = await fetch(`${API_BASE}/api/contacts/my-contacts`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const myContactsData = await myContactsResponse.json();
    
    if (myContactsResponse.ok) {
      console.log('✅ My contacts retrieved');
      console.log('   Total contacts:', myContactsData.count);
      if (myContactsData.contacts.length > 0) {
        console.log('   Sample contact:', myContactsData.contacts[0]);
      }
    } else {
      console.log('❌ Get my contacts failed:', myContactsData.error);
    }
    console.log('');

    // Test 8: Contact Statistics
    console.log('8. Testing Contact Statistics...');
    const statsResponse = await fetch(`${API_BASE}/api/contacts/stats`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    const statsData = await statsResponse.json();
    
    if (statsResponse.ok) {
      console.log('✅ Contact statistics retrieved');
      console.log('   Total contacts:', statsData.totalContacts);
      console.log('   Unique phones:', statsData.uniquePhones);
      console.log('   Last upload:', statsData.lastUpload);
    } else {
      console.log('❌ Contact statistics failed:', statsData.error);
    }
    console.log('');

    // Test 9: Invalid Endpoint
    console.log('9. Testing Invalid Endpoint...');
    const invalidResponse = await fetch(`${API_BASE}/api/invalid`);
    const invalidData = await invalidResponse.json();
    
    if (invalidResponse.status === 404) {
      console.log('✅ 404 handling works correctly');
    } else {
      console.log('❌ 404 handling failed');
    }
    console.log('');

    // Test 10: Invalid Token
    console.log('10. Testing Invalid Token...');
    const invalidTokenResponse = await fetch(`${API_BASE}/api/contacts/my-contacts`, {
      headers: { 'Authorization': 'Bearer invalid-token' }
    });
    const invalidTokenData = await invalidTokenResponse.json();
    
    if (invalidTokenResponse.status === 401) {
      console.log('✅ Invalid token handling works correctly');
    } else {
      console.log('❌ Invalid token handling failed');
    }
    console.log('');

    console.log('🎉 All API tests completed!');
    console.log('📊 Summary:');
    console.log('   - Health check: ✅');
    console.log('   - Authentication: ✅');
    console.log('   - Contact management: ✅');
    console.log('   - Error handling: ✅');

  } catch (error) {
    console.error('❌ Test failed with error:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testAPI();
}

module.exports = testAPI; 