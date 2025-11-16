-- Seed Users (v1.34 - with real UUIDs and real hash)
-- PIN: '1234'
INSERT INTO "users" (id, phone, role, pin_hash, created_at, updated_at)
VALUES
('11111111-1111-1111-1111-111111111111', '+911234567890', 'customer', '$2b$12$NxDGfTVvoSs7dl1RVYVXH.e9lJVb0NFnkpwIZP.yY8314zlAd2AkG', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Vendors (v1.34)
INSERT INTO "vendors" (id, name, created_at, updated_at)
VALUES
('22222222-2222-2222-2222-222222222222', 'Bharuchi Vadapav', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Menu Items (v1.34)
INSERT INTO "menu_items" (id, vendor_id, name, price_paise, created_at, updated_at)
VALUES
('33333333-3333-3333-3333-333333333333', '22222222-2222-2222-2222-222222222222', 'Butter Vada Pav', 10000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Riders (v1.34)
INSERT INTO "riders" (id, phone, name, created_at, updated_at)
VALUES
('44444444-4444-4444-4444-444444444444', '+919998887776', 'Rider Rajesh', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;