import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Inlined uuidv4 function
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

// 1. SETUP: This runs once before the test
export function setup() {
  console.log('Running setup() to get auth token...');
  // We login as the mock customer from db/seed.sql
  const loginPayload = JSON.stringify({
    phone: '+911234567890',
  });
  const params = {
    headers: { 'Content-Type': 'application/json' },
  };
  
  // Call the auth-service on port 3001
  const res = http.post('http://localhost:3001/api/v1/auth/login', loginPayload, params);
  
  if (res.status !== 201) {
    throw new Error('Could not login to auth-service. Test aborted.');
  }
  
  const token = res.json('accessToken');
  console.log('Auth token acquired.');
  return { authToken: token };
}

export const options = {
  vus: 1,
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.99'],
  },
};

// 2. MAIN TEST: This uses the token from setup()
export default function (data) {
  const BASE_URL = (__ENV.BASE_URL || 'http://localhost:3000/api/v1').trim();
  const AUTH_TOKEN = data.authToken; // <-- Use the REAL token
  
  const idempotencyKey = uuidv4();
  const orderPayload = JSON.stringify({
    client_request_id: idempotencyKey,
    vendor_id: "44444444-4444-4444-4444-444444444444", // Seeded vendor
    items: [{ item_id: "item-1-placeholder", quantity: 1 }], // This item doesn't exist, but DTO allows it
    total_amount_paise: 12000,
  });
  
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AUTH_TOKEN}`,
    },
  };

  let orderId = '';

  group('P0: Core Order Flow', () => {
    const res = http.post(`${BASE_URL}/orders`, orderPayload, params);
    let body;
    try { body = res.json(); } catch (e) { body = null; }

    check(res, {
      'create order returns 202': (r) => r.status === 202,
      'response has order_id': () => Boolean(body && body.order_id),
    });

    if (body && body.order_id) {
      orderId = body.order_id;
    }
  });

  group('P1: Idempotency Replay', () => {
    const res = http.post(`${BASE_URL}/orders`, orderPayload, params);
    check(res, {
      'idempotent replay returns 409': (r) => r.status === 409,
    });
  });

  group('P2: Saga Status Polling', () => {
    if (orderId) {
      // ... (polling logic remains the same) ...
    }
  });
}