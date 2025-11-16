-- Seed Users (with real UUIDs)
INSERT INTO "users" (id, phone, role, pin_hash, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111', '+911234567890', 'customer', 'TBD_HASHED_PIN', NOW(), NOW());

-- Seed Vendors (with real UUIDs)
INSERT INTO "vendors" (id, name, created_at, updated_at)
VALUES
('22222222-2222-2222-2222-222222222222', 'Bharuchi Vadapav', NOW(), NOW());

-- Seed Menu Items (with real UUIDs)
INSERT INTO "menu_items" (id, vendor_id, name, price_paise, created_at, updated_at)
VALUES
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Butter Vada Pav', 10000, NOW(), NOW());

-- Seed Riders (with real UUIDs)
INSERT INTO "riders" (id, phone, name, created_at, updated_at)
VALUES
('44444444-4444-4444-4444-444444444444', '+919998887776', 'Rider Rajesh', NOW(), NOW());