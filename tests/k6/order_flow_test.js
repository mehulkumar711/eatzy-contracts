import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// --- Environment Variables ---
const AUTH_URL = __ENV.K6_AUTH_URL || 'http://localhost:3001/api/v1/auth/login';
const ORDER_URL = __ENV.K6_ORDER_URL || 'http://localhost:3000/api/v1/orders';

// --- Credentials from v1.38 seed.sql ---
const PHONE = '+911234567890';
const PIN = '1234'; 

// --- UUIDs from v1.38 seed.sql ---
const VENDOR_ID = 'a8a1b2c3-1b1a-4b0f-8c0a-3f1f1b9f1b9f';
const ITEM_ID = 'b9b2c3d4-1b1a-4b0f-8c0a-3f1f1b9f1b9f';

// --- k6 setup() function ---
export function setup() {
  console.log('Running setup() to get auth token...');
  const payload = JSON.stringify({
    phone: PHONE,
    pin: PIN,
  });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  const res = http.post(AUTH_URL, payload, params);

  if (res.status !== 201) {
    console.error(`Auth service login failed. Status: ${res.status}, Body: ${res.body}`);
    return { token: null }; 
  }
  
  const token = res.json('access_token');
  if (!token) {
    console.error(`Auth service did not return an 'access_token'. Body: ${res.body}`);
    return { token: null };
  }
  
  console.log(`Auth token acquired.`);
  return { token: token };
}

// --- k6 default function (Main Test) ---
export default function (data) {
  if (!data.token) {
    console.log('No auth token from setup(), aborting VU.');
    return;
  }
  const token = data.token;
  
  const clientRequestId = uuidv4(); // Use a real UUID
  
  const createOrderPayload = JSON.stringify({
    client_request_id: clientRequestId,
    vendor_id: VENDOR_ID, // Use the real UUID
    items: [
      { item_id: ITEM_ID, quantity: 2 }, // Use the real UUID
    ],
    total_amount_paise: 20000,
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // --- Test 1: Create Order ---
  const createRes = http.post(ORDER_URL, createOrderPayload, params);
  
  console.log(`Order response status: ${createRes.status}`);
  console.log(`Order response body: ${createRes.body}`);

  const createOrderCheck = check(createRes, {
    'status is 202': (r) => r.status === 202,
    'has order_id': (r) => {
      if (r.status !== 202) return false;
      const body = r.json();
      return body && typeof body.order_id === 'string' && body.order_id.length > 0;
    },
  });
  
  if (!createOrderCheck) { return; }

  // --- Test 2: Idempotent Replay ---
  const replayRes = http.post(ORDER_URL, createOrderPayload, params);
  
  console.log(`Idempotent replay status: ${replayRes.status}`);

  check(replayRes, {
    'idempotent replay returns 409': (r) => r.status === 409,
  });

  sleep(1);
}