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

async function testAddAndDelete() {
  console.log('--- Creating Platinum 950 ---');
  const addRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/admin/shop/rates',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    metal: 'platinum',
    purity: '950',
    ratePerGram: 3450,
    makingChargePerGram: 850,
    notes: 'Pt 950 Pure Platinum Jewellery'
  });
  console.log('Add status:', addRes.status, addRes.data);

  const ratesRes = await makeRequest({
    hostname: 'localhost',
    port: 3000,
    path: '/api/v1/shop/rates',
    method: 'GET'
  });
  const allRates = ratesRes.data?.data || ratesRes.data;
  console.log('Total rates after add:', allRates.length);
  const plat = allRates.find(r => r.metal === 'platinum');
  console.log('Found platinum:', plat);

  if (plat) {
    console.log('--- Deleting Platinum ---');
    const delRes = await makeRequest({
      hostname: 'localhost',
      port: 3000,
      path: `/api/v1/admin/shop/rates/${plat.id}`,
      method: 'DELETE'
    });
    console.log('Delete status:', delRes.status, delRes.data);
  }
}

testAddAndDelete().catch(console.error);
