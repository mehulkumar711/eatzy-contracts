import http from 'k6/http';
import { check, sleep } from 'k6';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

const AUTH_URL = 'http://localhost:3001/api/v1/auth/login';
const ORDER_URL = 'http://localhost:3000/api/v1/orders';
const PHONE = '+911234567890';
const PIN = '1234';

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
  console.log(`Auth token acquired.`);
  return { token: token };
}

export default function (data) {
  if (!data.token) {
    console.log('No auth token from setup(), aborting VU.');
    return;
  }
  const token = data.token;
  const clientRequestId = `k6-${uuidv4()}`;
  const createOrderPayload = JSON.stringify({
    client_request_id: clientRequestId,
    vendor_id: 'vendor-1-uuid',
    items: [ { item_id: 'vendor-1-item-1-uuid', quantity: 2 }, ],
    total_amount_paise: 20000,
  });
  const params = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  };

  const createRes = http.post(ORDER_URL, createOrderPayload, params);
  
  console.log(`Order response status: ${createRes.status}`);
  console.log(`Order response body: ${createRes.body}`);

  const createOrderCheck = check(createRes, {
    'status is 202': (r) => r.status === 202,
    'has order_id': (r) => r.json('order_id') !== null,
  });
  
  if (!createOrderCheck) { return; }

  const replayRes = http.post(ORDER_URL, createOrderPayload, params);
  console.log(`Idempotent replay status: ${replayRes.status}`);
  check(replayRes, {
    'idempotent replay returns 409': (r) => r.status === 409,
  });
  sleep(1);
}