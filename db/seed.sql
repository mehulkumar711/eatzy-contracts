-- db/seed.sql

-- Seed ADMIN User (Mehul)
-- ID: 999...999
-- Username: 'admin', Password: 'admin123' (Hashed: $2b$12$NxDGfTVvoSs7dl1RVYVXH.e9lJVb0NFnkpwIZP.yY8314zlAd2AkG)
INSERT INTO "users" (id, username, role, pin_hash, is_active, created_at, updated_at)
VALUES ('99999999-9999-9999-9999-999999999999', 'admin', 'admin', '$2b$12$de2xJGvLE6rCJo2BOw4GLupJuvWOZP/BbA4JoL0cWJQHjOQ60wvSG', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- (Keep existing customer/vendor seeds below...)
INSERT INTO "users" (id, phone, role, pin_hash, is_active, created_at, updated_at)
VALUES ('11111111-1111-1111-1111-111111111111', '+911234567890', 'customer', '$2b$12$NxDGfTVvoSs7dl1RVYVXH.e9lJVb0NFnkpwIZP.yY8314zlAd2AkG', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

INSERT INTO "vendors" (id, name, created_at, updated_at) VALUES ('a8a1b2c3-1b1a-4b0f-8c0a-3f1f1b9f1b9f', 'Bharuchi Vadapav', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO "menu_items" (id, vendor_id, name, price_paise, created_at, updated_at) VALUES ('b9b2c3d4-1b1a-4b0f-8c0a-3f1f1b9f1b9f', 'a8a1b2c3-1b1a-4b0f-8c0a-3f1f1b9f1b9f', 'Butter Vada Pav', 10000, NOW(), NOW()) ON CONFLICT (id) DO NOTHING;
INSERT INTO "riders" (id, phone, name, created_at, updated_at) VALUES ('c1c2d3e4-1b1a-4b0f-8c0a-3f1f1b9f1b9f', '+919998887776', 'Rider Rajesh', NOW(), NOW()) ON CONFLICT (id) DO NOTHING;