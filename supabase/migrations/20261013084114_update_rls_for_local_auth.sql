/*
# Update RLS policies for local admin authentication

## Description
Vuelti now uses a simple local credential check instead of Supabase Auth sessions.
This means the browser always operates as the `anon` role. The previous policies
restricted writes to `authenticated` only, which would block all admin operations.

## Changes
- repartidores: INSERT/UPDATE/DELETE policies changed from `TO authenticated` to `TO anon, authenticated`
- pedidos: SELECT/INSERT/UPDATE/DELETE policies changed from `TO authenticated` to `TO anon, authenticated`
- The client-side admin login gate controls who can reach the admin panel UI;
  the database policies allow the anon-key client to perform all CRUD operations.
*/

-- repartidores: drop old auth-only policies, replace with anon+authenticated
DROP POLICY IF EXISTS "auth_insert_repartidores" ON repartidores;
DROP POLICY IF EXISTS "auth_update_repartidores" ON repartidores;
DROP POLICY IF EXISTS "auth_delete_repartidores" ON repartidores;

DROP POLICY IF EXISTS "anon_insert_repartidores" ON repartidores;
CREATE POLICY "anon_insert_repartidores"
  ON repartidores FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_repartidores" ON repartidores;
CREATE POLICY "anon_update_repartidores"
  ON repartidores FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_repartidores" ON repartidores;
CREATE POLICY "anon_delete_repartidores"
  ON repartidores FOR DELETE TO anon, authenticated USING (true);

-- pedidos: drop old auth-only policies, replace with anon+authenticated
DROP POLICY IF EXISTS "auth_select_pedidos" ON pedidos;
DROP POLICY IF EXISTS "auth_insert_pedidos" ON pedidos;
DROP POLICY IF EXISTS "auth_update_pedidos" ON pedidos;
DROP POLICY IF EXISTS "auth_delete_pedidos" ON pedidos;

DROP POLICY IF EXISTS "anon_select_pedidos" ON pedidos;
CREATE POLICY "anon_select_pedidos"
  ON pedidos FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_pedidos" ON pedidos;
CREATE POLICY "anon_insert_pedidos"
  ON pedidos FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_pedidos" ON pedidos;
CREATE POLICY "anon_update_pedidos"
  ON pedidos FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_pedidos" ON pedidos;
CREATE POLICY "anon_delete_pedidos"
  ON pedidos FOR DELETE TO anon, authenticated USING (true);