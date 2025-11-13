const express = require('express');
const app = express();
app.use(express.json());

// Mock: Create Order (Matches k6 assertion)
app.post('/api/v1/orders', (req, res) => {
  console.log('Received Order:', req.body);
  res.status(202).json({ 
    order_id: 'mock-order-id-123',
    // k6 expects order_id at root level
  });
});

// ... previous code ...

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.listen(8080, () => console.log('Mock API running on port 8080'));