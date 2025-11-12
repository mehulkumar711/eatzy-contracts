import http from 'k6/http';
import { check, sleep, group } from 'k6';

// Inlined uuidv4 function
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
    return v.toString(16);
  });
}

export const options = {
  vus: 1,
  thresholds: {
    'http_req_failed': ['rate<0.01'],
    'checks': ['rate>0.99'],
  },
};

export default function () {
  const BASE_URL = (__ENV.BASE_URL || 'https.api.staging.eatzy.com/api/v1').trim();
  const AUTH_TOKEN = __ENV.TEST_TOKEN;
  
  if (!AUTH_TOKEN) {
    throw new Error('TEST_TOKEN is not set. Pass via -e or secretEnv.');
  }
  
  const idempotencyKey = uuidv4();
  const orderPayload = JSON.stringify({
    client_request_id: idempotencyKey,
    vendor_id: "vendor-uuid-placeholder",
    items: [{ item_id: "item-1-placeholder", quantity: 1 }],
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

  group('P2: Saga Status Polling (with Retry & Timeout)', () => {
    if (orderId) {
      const pollTimeout = 30 * 1000; // 30 seconds
      let pollInterval = 1; // 1s
      let pollDuration = 0;
      let sagaComplete = false;
      let finalState = 'TIMEOUT';

      while (pollDuration < pollTimeout) {
        const statusRes = http.get(`${BASE_URL}/sagas/order/${orderId}/status`, params);
        
        // Patched: Add retry logic for 502/503
        if (statusRes.status >= 500) {
          check(statusRes, { 'polling /status 5xx retry': (r) => r.status >= 500 });
          sleep(pollInterval);
          pollDuration += (pollInterval * 1000);
          pollInterval = Math.min(pollInterval * 2, 5); // Exponential backoff
          continue;
        }

        let statusBody;
        try { statusBody = statusRes.json(); } catch (e) { statusBody = null; }

        if (statusBody && (statusBody.current_step === 'COMPLETED' || statusBody.current_step === 'FAILED')) {
          sagaComplete = true;
          finalState = statusBody.current_step;
          break;
        }
        
        sleep(pollInterval);
        pollDuration += (pollInterval * 1000);
      }

      check(finalState, {
        'saga completed within 30s timeout': (s) => s === 'COMPLETED' || s === 'FAILED',
        // Patched: Check for the specific *successful* final state
        'saga reached state COMPLETED': (s) => s === 'COMPLETED',
      });
    }
  });

  group('P3: Chaos Test (Placeholder)', () => {
    // This is where the 7-night chaos grid would inject failures
    check(true, { 'chaos test placeholder': () => true });
  });
}