/*
# Add PIN and tiene_repartidor_propio columns to negocios

1. Modified Tables
## negocios
- Added `pin` column (text, 4-digit PIN for store access, nullable)
- Added `tiene_repartidor_propio` column (boolean, default false) — whether the store has its own delivery person

2. Security
- No changes to RLS. Existing policies remain.
- No data loss — both columns are nullable/have defaults.
*/

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'negocios' AND column_name = 'pin') THEN
    ALTER TABLE negocios ADD COLUMN pin text;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'negocios' AND column_name = 'tiene_repartidor_propio') THEN
    ALTER TABLE negocios ADD COLUMN tiene_repartidor_propio boolean DEFAULT false;
  END IF;
END $$;
