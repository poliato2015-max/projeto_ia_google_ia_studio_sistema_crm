-- Migration to apply user isolation on existing tables (contacts & deals)

-- 1. Alter contacts table to add user_id column if it doesn't exist
ALTER TABLE contacts ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Drop previous loose policy if it exists and apply user isolated policy
DROP POLICY IF EXISTS "Allow all operations for now" ON contacts;
DROP POLICY IF EXISTS "Users can fully manage their own contacts" ON contacts;

CREATE POLICY "Users can fully manage their own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable RLS (just in case)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;


-- 2. Alter deals table to add user_id column if it doesn't exist
ALTER TABLE deals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Drop previous loose policy if it exists and apply user isolated policy
DROP POLICY IF EXISTS "Allow all for deals" ON deals;
DROP POLICY IF EXISTS "Users can fully manage their own deals" ON deals;

CREATE POLICY "Users can fully manage their own deals" ON deals
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable RLS (just in case)
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;


-- 3. Alter tasks table to add user_id column if it doesn't exist
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid();

-- Drop previous loose policy if it exists and apply user isolated policy
DROP POLICY IF EXISTS "Allow all for tasks" ON tasks;
DROP POLICY IF EXISTS "Users can fully manage their own tasks" ON tasks;

CREATE POLICY "Users can fully manage their own tasks" ON tasks
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable RLS (just in case)
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
