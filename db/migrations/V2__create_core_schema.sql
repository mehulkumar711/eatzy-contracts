/*
  V2: Core Domain Schema
*/

CREATE TYPE user_role AS ENUM ('customer', 'vendor', 'rider', 'admin');
CREATE TYPE order_status AS ENUM ('pending', 'paid', 'accepted', 'preparing', 'ready', 'picked_up', 'delivered', 'cancelled');

CREATE TABLE users (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number varchar(20) NOT NULL UNIQUE,
    role user_role NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE vendors (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(id),
    shop_name varchar(100) NOT NULL,
    owner_name varchar(100) NOT NULL,
    latitude double precision NOT NULL,
    longitude double precision NOT NULL,
    is_online boolean DEFAULT false,
    fssai_license varchar(50),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE TABLE orders (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id uuid NOT NULL REFERENCES users(id),
    vendor_id uuid NOT NULL REFERENCES vendors(id),
    rider_id uuid REFERENCES users(id),
    status order_status NOT NULL DEFAULT 'pending',
    total_amount_paise bigint NOT NULL,
    client_request_id uuid UNIQUE NOT NULL,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_vendors_geo ON vendors(latitude, longitude);
CREATE INDEX idx_orders_customer ON orders(customer_id);