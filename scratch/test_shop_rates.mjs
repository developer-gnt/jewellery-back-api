import http from 'http';

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (_) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- 1. Testing GET /shop/rates ---');
  const ratesRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/shop/rates',
    method: 'GET'
  });
  console.log('Status:', ratesRes.status);
  console.log('Rates Count:', ratesRes.data?.data?.length || ratesRes.data?.length);

  const rates = ratesRes.data?.data || ratesRes.data;
  console.log('Sample rate:', rates[0]);

  console.log('\n--- 2. Testing GET /shop/rates/meta ---');
  const metaRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/shop/rates/meta',
    method: 'GET'
  });
  console.log('Status:', metaRes.status, 'Metals:', metaRes.data?.metals?.map(m => m.name));

  console.log('\n--- 3. Testing GET /shop/rates/sync-status ---');
  const syncStatusRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/shop/rates/sync-status',
    method: 'GET'
  });
  console.log('Status:', syncStatusRes.status, 'Sync Info:', syncStatusRes.data);

  console.log('\n--- 4. Testing GET /shop/rates/sync ---');
  const syncRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/shop/rates/sync',
    method: 'GET'
  });
  console.log('Status:', syncRes.status, 'Sync Result:', syncRes.data?.message);

  console.log('\n--- 5. Testing Duplicate Validation in POST /admin/shop/rates ---');
  // First login as admin or call endpoint to test duplicate rejection
  // Let's get an auth token if needed
  const loginRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/auth/admin/login',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { email: 'admin@zewarmahal.com', password: 'AdminPassword123!' });

  let token = loginRes.data?.accessToken || loginRes.data?.data?.accessToken;
  if (!token) {
    // Try master login or whatever default credentials exist
    console.log('Login response:', loginRes.data);
  }

  const authHeaders = token ? {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  } : { 'Content-Type': 'application/json' };

  // Try creating an existing metal/purity: Gold 24K
  const duplicateRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/admin/shop/rates',
    method: 'POST',
    headers: authHeaders
  }, {
    metal: 'gold',
    purity: '24K',
    ratePerGram: 7520,
    makingChargePerGram: 500
  });
  console.log('Duplicate test status (expected 409 Conflict):', duplicateRes.status, duplicateRes.data?.message);

  // Test updating a rate
  if (rates.length > 0) {
    const target = rates[0];
    console.log(`\n--- 6. Testing PUT /admin/shop/rates/${target.id} ---`);
    const updateRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1/admin/shop/rates/${target.id}`,
      method: 'PUT',
      headers: authHeaders
    }, {
      metal: target.metal,
      purity: target.purity,
      ratePerGram: target.ratePerGram,
      makingChargePerGram: 520,
      notes: target.notes
    });
    console.log('Update status:', updateRes.status, 'Updated making charge:', updateRes.data?.rate?.makingChargePerGram || updateRes.data);
  }

  console.log('\n--- 7. Testing Share Card GET /shop/rates/share ---');
  const shareRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/shop/rates/share',
    method: 'GET'
  });
  console.log('Share status:', shareRes.status, 'Store:', shareRes.data?.storeName, 'Preview:\n', shareRes.data?.shareText);
}

runTests().catch(console.error);
