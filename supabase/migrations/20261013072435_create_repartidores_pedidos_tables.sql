/*
# Create repartidores and pedidos tables for Vuelti

## Description
Creates the two main tables for the Vuelti delivery app: repartidores (delivery drivers)
and pedidos (orders). Enables row-level security with policies for public read access
on the driver catalog and admin-only access on orders. Seeds four sample drivers.

## New Tables

### repartidores (delivery drivers)
- id: uuid, primary key (auto-generated)
- nombre: text, NOT NULL — driver's full name
- foto_url: text — URL to driver's photo
- moto: text, NOT NULL — motorcycle description
- telefono: text, NOT NULL — WhatsApp phone number (international format, e.g. 522711234567)
- estatus: text, NOT NULL, CHECK ('disponible' | 'ocupado'), default 'disponible'
- created_at: timestamptz, default now()

### pedidos (orders)
- id: uuid, primary key (auto-generated)
- cliente_nombre: text — customer name
- cliente_telefono: text — customer phone number
- origen: text — pickup location
- destino: text — delivery location
- descripcion: text — description of items being sent
- repartidor_id: uuid, FK to repartidores.id (ON DELETE SET NULL)
- estatus: text, CHECK ('pendiente' | 'entregado'), default 'pendiente'
- created_at: timestamptz, default now()

## Security
- RLS enabled on both tables.
- repartidores: public SELECT (anon + authenticated) so the client catalog works without
  login; INSERT/UPDATE/DELETE restricted to authenticated users (admin only).
- pedidos: all CRUD restricted to authenticated users (admin only).
- Real-time publication enabled for both tables.

## Seed Data
- 4 sample drivers with real photos, motorcycle descriptions, and phone numbers.
*/

CREATE TABLE IF NOT EXISTS repartidores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  foto_url text NOT NULL DEFAULT '',
  moto text NOT NULL DEFAULT '',
  telefono text NOT NULL DEFAULT '',
  estatus text NOT NULL DEFAULT 'disponible' CHECK (estatus IN ('disponible', 'ocupado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE repartidores ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_select_repartidores" ON repartidores;
CREATE POLICY "public_select_repartidores"
  ON repartidores FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_repartidores" ON repartidores;
CREATE POLICY "auth_insert_repartidores"
  ON repartidores FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_repartidores" ON repartidores;
CREATE POLICY "auth_update_repartidores"
  ON repartidores FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_repartidores" ON repartidores;
CREATE POLICY "auth_delete_repartidores"
  ON repartidores FOR DELETE TO authenticated USING (true);

CREATE TABLE IF NOT EXISTS pedidos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_nombre text NOT NULL DEFAULT '',
  cliente_telefono text NOT NULL DEFAULT '',
  origen text NOT NULL DEFAULT '',
  destino text NOT NULL DEFAULT '',
  descripcion text NOT NULL DEFAULT '',
  repartidor_id uuid REFERENCES repartidores(id) ON DELETE SET NULL,
  estatus text NOT NULL DEFAULT 'pendiente' CHECK (estatus IN ('pendiente', 'entregado')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE pedidos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_select_pedidos" ON pedidos;
CREATE POLICY "auth_select_pedidos"
  ON pedidos FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "auth_insert_pedidos" ON pedidos;
CREATE POLICY "auth_insert_pedidos"
  ON pedidos FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "auth_update_pedidos" ON pedidos;
CREATE POLICY "auth_update_pedidos"
  ON pedidos FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "auth_delete_pedidos" ON pedidos;
CREATE POLICY "auth_delete_pedidos"
  ON pedidos FOR DELETE TO authenticated USING (true);

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE repartidores;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE pedidos;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM repartidores LIMIT 1) THEN
    INSERT INTO repartidores (nombre, foto_url, moto, telefono, estatus) VALUES
      ('Carlos Martínez',
       'https://images.pexels.com/photos/20296282/pexels-photo-20296282.jpeg?auto=compress&cs=tinysrgb&h=350&w=350&fit=crop',
       'Honda Wave 125', '522711234567', 'disponible'),
      ('Jorge Ramírez',
       'https://images.pexels.com/photos/12000105/pexels-photo-12000105.jpeg?auto=compress&cs=tinysrgb&h=350&w=350&fit=crop',
       'Yamaha FZ16', '522711234568', 'disponible'),
      ('Miguel Hernández',
       'https://images.pexels.com/photos/9607206/pexels-photo-9607206.jpeg?auto=compress&cs=tinysrgb&h=350&w=350&fit=crop',
       'Bajaj Boxer 150', '522711234569', 'ocupado'),
      ('Roberto García',
       'https://images.pexels.com/photos/36920053/pexels-photo-36920053.jpeg?auto=compress&cs=tinysrgb&h=350&w=350&fit=crop',
       'Italika RT200', '522711234570', 'disponible');
  END IF;
END $$;