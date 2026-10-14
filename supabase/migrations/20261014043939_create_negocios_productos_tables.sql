/*
# Create negocios and productos tables, update pedidos, seed data for Vuelti

## Description
Upgrades Vuelti from a simple delivery app to a full commercial directory platform.
Creates tables for businesses (negocios) and their products (productos), updates
the pedidos table to store cart/order details, and seeds two sample businesses
in Tihuatlán with full menus.

## New Tables

### negocios (businesses/comercios)
- id: uuid, PK
- nombre: text NOT NULL — business name
- logo_url: text — logo/photo URL
- categoria: text NOT NULL CHECK ('comida'|'antojos'|'farmacia'|'abarrotes')
- direccion: text — address
- horario: text — operating hours (e.g. "Lun-Dom 8:00 AM - 10:00 PM")
- whatsapp: text — WhatsApp number for orders
- pago_status: text NOT NULL DEFAULT 'pendiente' CHECK ('pagado'|'pendiente') — weekly membership payment
- created_at: timestamptz

### productos (menu items for each business)
- id: uuid, PK
- negocio_id: uuid FK -> negocios.id ON DELETE CASCADE
- nombre: text NOT NULL — product/dish name
- descripcion: text — description
- precio: numeric(10,2) NOT NULL — price
- foto_url: text — photo URL
- created_at: timestamptz

## Modified Tables

### pedidos
- Added columns: negocio_id (FK), items_json (jsonb for cart items), total (numeric), tipo (text: 'negocio'|'mandadito')
- Original columns kept intact

## Security
- RLS enabled on all tables
- All tables allow anon+authenticated CRUD (the admin login is client-side)
- Real-time publication enabled for negocios and productos

## Seed Data
- Taquería El Tío: 6 menu items (tacos, quesadillas, gringas, refrescos)
- Abarrotes Doña Mary: 6 menu items (tortillas, refrescos, arroz, frijoles, aceite, leche)
*/

CREATE TABLE IF NOT EXISTS negocios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  logo_url text NOT NULL DEFAULT '',
  categoria text NOT NULL DEFAULT 'comida' CHECK (categoria IN ('comida','antojos','farmacia','abarrotes')),
  direccion text NOT NULL DEFAULT '',
  horario text NOT NULL DEFAULT '',
  whatsapp text NOT NULL DEFAULT '',
  pago_status text NOT NULL DEFAULT 'pendiente' CHECK (pago_status IN ('pagado','pendiente')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE negocios ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_negocios" ON negocios;
CREATE POLICY "anon_select_negocios"
  ON negocios FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_negocios" ON negocios;
CREATE POLICY "anon_insert_negocios"
  ON negocios FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_negocios" ON negocios;
CREATE POLICY "anon_update_negocios"
  ON negocios FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_negocios" ON negocios;
CREATE POLICY "anon_delete_negocios"
  ON negocios FOR DELETE TO anon, authenticated USING (true);

CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  negocio_id uuid NOT NULL REFERENCES negocios(id) ON DELETE CASCADE,
  nombre text NOT NULL,
  descripcion text NOT NULL DEFAULT '',
  precio numeric(10,2) NOT NULL DEFAULT 0,
  foto_url text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE productos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_productos" ON productos;
CREATE POLICY "anon_select_productos"
  ON productos FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_productos" ON productos;
CREATE POLICY "anon_insert_productos"
  ON productos FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_productos" ON productos;
CREATE POLICY "anon_update_productos"
  ON productos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_productos" ON productos;
CREATE POLICY "anon_delete_productos"
  ON productos FOR DELETE TO anon, authenticated USING (true);

-- Add new columns to pedidos if they don't exist
DO $$ BEGIN
  ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS negocio_id uuid REFERENCES negocios(id) ON DELETE SET NULL;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS items_json jsonb;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS total numeric(10,2) DEFAULT 0;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE pedidos ADD COLUMN IF NOT EXISTS tipo text NOT NULL DEFAULT 'mandadito' CHECK (tipo IN ('negocio','mandadito'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE negocios;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE productos;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed businesses
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM negocios LIMIT 1) THEN
    INSERT INTO negocios (nombre, logo_url, categoria, direccion, horario, whatsapp, pago_status) VALUES
      ('Taquería El Tío',
       'https://images.pexels.com/photos/5454019/pexels-photo-5454019.jpeg?auto=compress&cs=tinysrgb&h=400&w=400&fit=crop',
       'comida',
       'Av. Hidalgo #45, Centro, Tihuatlán, Veracruz',
       'Lun - Dom · 5:00 PM - 11:30 PM',
       '522711234567',
       'pagado'),
      ('Abarrotes Doña Mary',
       'https://images.pexels.com/photos/33703902/pexels-photo-33703902.jpeg?auto=compress&cs=tinysrgb&h=400&w=400&fit=crop',
       'abarrotes',
       'Calle Juárez #12, Col. Las Palmas, Tihuatlán, Veracruz',
       'Lun - Sáb · 7:00 AM - 9:00 PM · Dom cerrado',
       '522711234568',
       'pendiente');

    -- Taquería El Tío menu
    INSERT INTO productos (negocio_id, nombre, descripcion, precio, foto_url) VALUES
      ((SELECT id FROM negocios WHERE nombre = 'Taquería El Tío'),
       'Tacos al Pastor', 'Tacos de pastor con cilantro, cebolla y salsa de la casa', 18.00,
       'https://images.pexels.com/photos/28959271/pexels-photo-28959271.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Taquería El Tío'),
       'Orden de Tacos (5 pzs)', 'Cinco tacos de su elección con todo', 80.00,
       'https://images.pexels.com/photos/9258712/pexels-photo-9258712.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Taquería El Tío'),
       'Quesadilla con queso', 'Quesadilla gigante rellena de queso Oaxaca y carne al gusto', 35.00,
       'https://images.pexels.com/photos/9026623/pexels-photo-9026623.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Taquería El Tío'),
       'Gringa de Pastor', 'Tortilla de harina con pastor, queso y piña', 30.00,
       'https://images.pexels.com/photos/25585184/pexels-photo-25585184.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Taquería El Tío'),
       'Enchiladas Rojas', 'Tres enchiladas rellenas de pollo, bañadas en salsa roja', 65.00,
       'https://images.pexels.com/photos/29530030/pexels-photo-29530030.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Taquería El Tío'),
       'Refresco 600ml', 'Coca-Cola, Sprite o Fanta 600ml', 22.00,
       'https://images.pexels.com/photos/5869812/pexels-photo-5869812.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop');

    -- Abarrotes Doña Mary menu
    INSERT INTO productos (negocio_id, nombre, descripcion, precio, foto_url) VALUES
      ((SELECT id FROM negocios WHERE nombre = 'Abarrotes Doña Mary'),
       'Tortillas de maíz (1 kg)', 'Tortillas recién hechas, paquete de 1 kilo', 25.00,
       'https://images.pexels.com/photos/5855242/pexels-photo-5855242.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Abarrotes Doña Mary'),
       'Refresco 2L', 'Coca-Cola, Sprite o Fanta botella de 2 litros', 38.00,
       'https://images.pexels.com/photos/15668448/pexels-photo-15668448.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Abarrotes Doña Mary'),
       'Arroz Verde Valle (1 kg)', 'Arroz blanco de grano largo, paquete de 1 kilo', 32.00,
       'https://images.pexels.com/photos/8992843/pexels-photo-8992843.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Abarrotes Doña Mary'),
       'Frijol Negro (1 kg)', 'Frijol negro en grano, paquete de 1 kilo', 45.00,
       'https://images.pexels.com/photos/4929692/pexels-photo-4929692.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Abarrotes Doña Mary'),
       'Aceite 1a marca (1 L)', 'Aceite vegetal comestible, botella de 1 litro', 55.00,
       'https://images.pexels.com/photos/28944484/pexels-photo-28944484.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop'),
      ((SELECT id FROM negocios WHERE nombre = 'Abarrotes Doña Mary'),
       'Leche Lala Entera (1 L)', 'Leche entera ultrapasteurizada, botella de 1 litro', 28.00,
       'https://images.pexels.com/photos/28268141/pexels-photo-28268141.jpeg?auto=compress&cs=tinysrgb&h=300&w=300&fit=crop');
  END IF;
END $$;