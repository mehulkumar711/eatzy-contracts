-- 1. Customers
INSERT INTO users (id, phone_number, role) VALUES 
('11111111-1111-1111-1111-111111111111', '+911234567890', 'customer')
ON CONFLICT (phone_number) DO NOTHING;

-- 2. Vendor User
INSERT INTO users (id, phone_number, role) VALUES 
('22222222-2222-2222-2222-222222222222', '+919876543210', 'vendor')
ON CONFLICT (phone_number) DO NOTHING;

-- 3. Vendor Profile (Only if User exists)
INSERT INTO vendors (id, user_id, shop_name, owner_name, latitude, longitude) 
SELECT '44444444-4444-4444-4444-444444444444', 
       '22222222-2222-2222-2222-222222222222',
       'Raju Pav Bhaji', 'Raju Bhai', 21.7051, 72.9959
WHERE EXISTS (SELECT 1 FROM users WHERE id = '22222222-2222-2222-2222-222222222222')
ON CONFLICT (id) DO NOTHING;

-- 4. Riders
INSERT INTO users (id, phone_number, role) VALUES 
('33333333-3333-3333-3333-333333333333', '+911122334455', 'rider')
ON CONFLICT (phone_number) DO NOTHING;