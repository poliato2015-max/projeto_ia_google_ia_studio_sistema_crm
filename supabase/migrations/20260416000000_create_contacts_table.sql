-- Create contacts table
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  name TEXT NOT NULL,
  email TEXT,
  company TEXT,
  status TEXT DEFAULT 'Lead' CHECK (status IN ('Lead', 'Cliente', 'Inativo')),
  last_contact DATE DEFAULT CURRENT_DATE,
  value NUMERIC DEFAULT 0,
  initials TEXT,
  avatar_color TEXT,
  image TEXT
);

-- Set up Row Level Security (RLS)
-- For this applet, we'll allow all operations for now (can be hardened later)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations for now" ON contacts
  FOR ALL USING (true) WITH CHECK (true);
