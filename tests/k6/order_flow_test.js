import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// --- Environment Variables ---
const AUTH_URL = __ENV.K6_AUTH_URL || 'http://localhost:3001/api/v1/auth/login';
const ORDER_URL = __ENV.K6_ORDER_URL || 'http://localhost:3000/api/v1/orders';

// --- Credentials from seed.sql ---
const PHONE = '+911234567890';
const PIN = '1234'; // The auth-service mock validates this

// --- UUIDs from seed.sql ---
const VENDOR_ID = '22222222-2222-2222-2222-222222222222';
const ITEM_ID = '33333333-3333-3333-3333-333333333333';

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
  // 1. Handle auth failure from setup()
  if (!data.token) {
    console.log('No auth token from setup(), aborting VU.');
    return;
  }
  const token = data.token;

  //
  // --- FIX 1: client_request_id MUST be a valid UUID ---
  //
  const clientRequestId = uuidv4(); // Use a real UUID
  
  const createOrderPayload = JSON.stringify({
    client_request_id: clientRequestId,
    //
    // --- FIX 2: Use the valid UUIDs from seed.sql ---
    //
    vendor_id: VENDOR_ID,
    items: [
      { item_id: ITEM_ID, quantity: 2 },
    ],
    total_amount_paise: 20000, // 2 * 10000
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  // 3. --- Test 1: Create Order ---
  const createRes = http.post(ORDER_URL, createOrderPayload, params);
  
  console.log(`Order response status: ${createRes.status}`);
  console.log(`Order response body: ${createRes.body}`);

  const createOrderCheck = check(createRes, {
    'status is 202': (r) => r.status === 202,
    'has order_id': (r) => r.json('order_id') !== null && r.json('order_id') !== undefined,
  });
  
  if (!createOrderCheck) {
    // If creation failed (e.g., 400), don't attempt the replay
    return; 
  }

  // 4. --- Test 2: Idempotent Replay ---
  // Send the *exact same request* again.
  const replayRes = http.post(ORDER_URL, createOrderPayload, params);
  
  console.log(`Idempotent replay status: ${replayRes.status}`);

  check(replayRes, {
    'idempotent replay returns 409': (r) => r.status === 409,
  });

  sleep(1);
}