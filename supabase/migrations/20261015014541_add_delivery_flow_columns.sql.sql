/*
# Add delivery flow columns and expand order statuses

1. Modified Tables

## pedidos
- Added `modalidad` column (text): 'recoger' or 'domicilio' — how the customer wants to receive the order.
- Added `direccion_entrega` column (text): the delivery address when modalidad is 'domicilio'.
- Expanded `estatus` CHECK constraint to include new statuses: 'pendiente', 'preparacion', 'listo', 'camino', 'entregado'.

2. Security
- No new tables created.
- Existing RLS policies on pedidos remain unchanged (anon + authenticated CRUD).
- No data loss — all new columns are nullable with defaults.

3. Important Notes
- The old CHECK constraint on `estatus` is dropped and replaced with the expanded version.
- Existing rows with 'pendiente' or 'entregado' remain valid under the new constraint.
- `modalidad` defaults to 'domicilio' for backward compatibility with mandadito orders.
*/

-- Add modalidad column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'modalidad') THEN
    ALTER TABLE pedidos ADD COLUMN modalidad text DEFAULT 'domicilio';
  END IF;
END $$;

-- Add direccion_entrega column
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'pedidos' AND column_name = 'direccion_entrega') THEN
    ALTER TABLE pedidos ADD COLUMN direccion_entrega text DEFAULT '';
  END IF;
END $$;

-- Drop old check constraint and add expanded one
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estatus_check;
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_estatus_check1;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_estatus_check 
  CHECK (estatus = ANY (ARRAY['pendiente'::text, 'preparacion'::text, 'listo'::text, 'camino'::text, 'entregado'::text]));

-- Add check constraint for modalidad
ALTER TABLE pedidos DROP CONSTRAINT IF EXISTS pedidos_modalidad_check;
ALTER TABLE pedidos ADD CONSTRAINT pedidos_modalidad_check
  CHECK (modalidad = ANY (ARRAY['recoger'::text, 'domicilio'::text]));
