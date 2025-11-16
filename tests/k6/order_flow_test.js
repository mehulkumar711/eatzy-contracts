import http from 'k6/http';
import { check, sleep } from 'k6';

export default function () {
  const BASE = __ENV.BASE_URL || 'http://127.0.0.1:3000';
  
  // Get auth token
  const loginRes = http.post('http://127.0.0.1:3001/api/v1/auth/login', JSON.stringify({
    email: 'customer@example.com',
    password: 'password123'
  }), { headers: { 'Content-Type': 'application/json' } });
  
  const token = loginRes.json('accessToken');
  console.log('Auth token acquired:', token);

  // Create order
  const payload = JSON.stringify({
    client_request_id: `req-${Math.floor(Math.random()*1e6)}`,
    vendor_id: "vendor-uuid-placeholder",
    items: [{ item_id: "item_1", quantity: 1 }],
    total_amount_paise: 1000
  });
  
  const params = { 
    headers: { 
      'Content-Type': 'application/json', 
      Authorization: `Bearer ${token}` 
    } 
  };
  
  const res = http.post(`${BASE}/api/v1/orders`, payload, params);
  
  // 🔍 Show actual status code in test output
  console.log('Order response status:', res.status);
  console.log('Order response body:', res.body);
  
  check(res, { 
    'status is 202': (r) => r.status === 202,
    'has order_id': (r) => JSON.parse(r.body).order_id !== undefined
  });
  
  sleep(1);
}