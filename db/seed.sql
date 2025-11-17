-- Seed Users (v1.37 - with REAL UUIDs and REAL hash)
-- PIN: '1234'
INSERT INTO "users" (id, phone, role, pin_hash, created_at, updated_at)
VALUES
('e4f2f5c2-1b1a-4b0f-8c0a-3f1f1b9f1b9f', '+911234567890', 'customer', '$2b$12$NxDGfTVvoSs7dl1RVYVXH.e9lJVb0NFnkpwIZP.yY8314zlAd2AkG', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Vendors (v1.37)
INSERT INTO "vendors" (id, name, created_at, updated_at)
VALUES
('a8a1b2c3-1b1a-4b0f-8c0a-3f1f1b9f1b9f', 'Bharuchi Vadapav', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Menu Items (v1.37)
INSERT INTO "menu_items" (id, vendor_id, name, price_paise, created_at, updated_at)
VALUES
('b9b2c3d4-1b1a-4b0f-8c0a-3f1f1b9f1b9f', 'a8a1b2c3-1b1a-4b0f-8c0a-3f1f1b9f1b9f', 'Butter Vada Pav', 10000, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Seed Riders (v1.37)
INSERT INTO "riders" (id, phone, name, created_at, updated_at)
VALUES
('c1c2d3e4-1b1a-4b0f-8c0a-3f1f1b9f1b9f', '+919998887776', 'Rider Rajesh', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;