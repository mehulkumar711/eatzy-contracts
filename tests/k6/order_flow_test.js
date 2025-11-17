/*
 * Filename: tests/k6/order_flow_test.js
 * Version: 1.35 (Production-Ready)
 *
 * This test script is now deterministic.
 * 1. It logs in as the seeded user (from db/seed.sql).
 * 2. It sends an order using the *exact* UUIDs from db/seed.sql.
 * 3. It points to the correct service ports (Auth: 3001, Order: 3002).
 */
import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

// --- Environment Variables ---
const AUTH_URL = __ENV.K6_AUTH_URL || 'http://localhost:3001/api/v1/auth/login';

//
// THE FIX:
// Points to the correct port 3002, where your order-service is running.
//
const ORDER_URL = __ENV.K6_ORDER_URL || 'http://localhost:3002/api/v1/orders';

// --- Credentials from v1.34 seed.sql ---
const PHONE = '+911234567890';
const PIN = '1234'; // The plaintext PIN

// --- UUIDs from v1.34 seed.sql ---
// THE FIX: These are the real UUIDs your database now contains.
const VENDOR_ID = '22222222-2222-2222-2222-222222222222';
const ITEM_ID = '33333333-3333-3333-3333-333333333333';

// --- k6 setup() function ---
// Runs once at the start of the test.
export function setup() {
  console.log('Running setup() to get auth token...');
  const payload = JSON.stringify({
    phone: PHONE,
    pin: PIN,
  });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };

  // Your log shows auth service is on port 3001
  const res = http.post(AUTH_URL, payload, params);

  // Your auth-service returns 201 on success
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
// Runs in a loop for each Virtual User (VU).
export default function (data) {
  if (!data.token) {
    console.log('No auth token from setup(), aborting VU.');
    return;
  }
  const token = data.token;
  const clientRequestId = uuidv4(); // Generate a unique idempotency key

  const createOrderPayload = JSON.stringify({
    client_request_id: clientRequestId,
    vendor_id: VENDOR_ID, // Use the real UUID from seed.sql
    items: [
      { item_id: ITEM_ID, quantity: 2 }, // Use the real UUID from seed.sql
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
  console.log(`Sending CREATE_ORDER request to ${ORDER_URL}...`);
  const createRes = http.post(ORDER_URL, createOrderPayload, params);
  console.log(`Order response status: ${createRes.status}`);
  console.log(`Order response body: ${createRes.body}`);

  const createOrderCheck = check(createRes, {
    'status is 202 (Accepted)': (r) => r.status === 202,
    'body has order_id': (r) => {
      if (r.status !== 202) return false;
      const body = r.json();
      return body && typeof body.order_id === 'string' && body.order_id.length > 0;
    },
  });

  // If the first check fails, stop this iteration
  if (!createOrderCheck) {
    console.error('Create Order check failed.');
    return;
  }

  // --- Test 2: Idempotent Replay ---
  console.log(`Sending IDEMPOTENT replay for ${clientRequestId}...`);
  const replayRes = http.post(ORDER_URL, createOrderPayload, params);
  console.log(`Idempotent replay status: ${replayRes.status}`);

  check(replayRes, {
    'idempotent replay returns 409 (Conflict)': (r) => r.status === 409,
  });

  sleep(1);
}