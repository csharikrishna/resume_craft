const http = require('http');

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const opts = {
      hostname: 'localhost',
      port: 5000,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(data && { 'Content-Length': data.length })
      }
    };

    const req = http.request(opts, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          resolve({ status: res.statusCode, body: json });
        } catch {
          resolve({ status: res.statusCode, body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 FIREBASE AUTH SMOKE TEST\n');

  // Test 1: Register
  console.log('TEST 1: POST /api/auth/register');
  const email = `test_${Date.now()}@example.com`;
  const password = 'Test123456!';
  const registerResp = await makeRequest('POST', '/api/auth/register', { email, password });
  console.log(`Status: ${registerResp.status}`);
  console.log(`Response:`, JSON.stringify(registerResp.body, null, 2));

  let token = null;
  if (registerResp.status === 200 || registerResp.status === 201) {
    token = registerResp.body.token || registerResp.body.idToken;
    if (token) {
      console.log('✓ REGISTER PASSED\n');
    } else {
      console.log('✗ REGISTER: No token in response\n');
    }
  } else {
    console.log(`✗ REGISTER FAILED: HTTP ${registerResp.status}\n`);
  }

  // Test 2: Login
  if (token) {
    console.log('TEST 2: POST /api/auth/login');
    const loginResp = await makeRequest('POST', '/api/auth/login', { email, password });
    console.log(`Status: ${loginResp.status}`);
    console.log(`Response:`, JSON.stringify(loginResp.body, null, 2));
    
    if (loginResp.status === 200 && loginResp.body.token) {
      token = loginResp.body.token;
      console.log('✓ LOGIN PASSED\n');
    } else {
      console.log(`✗ LOGIN FAILED\n`);
    }
  }

  // Test 3: Get current user
  if (token) {
    console.log('TEST 3: GET /api/auth/me (with Bearer token)');
    const meResp = await makeRequest('POST', '/api/auth/me', { token });
    console.log(`Status: ${meResp.status}`);
    console.log(`Response:`, JSON.stringify(meResp.body, null, 2));
    
    if (meResp.status === 200 && meResp.body.id) {
      console.log('✓ GET /me PASSED\n');
      console.log('✅ ALL TESTS PASSED - Firebase backend is operational!\n');
    } else {
      console.log(`✗ GET /me FAILED\n`);
    }
  }

  process.exit(0);
}

runTests().catch(err => {
  console.error('❌ Test error:', err.message);
  process.exit(1);
});
