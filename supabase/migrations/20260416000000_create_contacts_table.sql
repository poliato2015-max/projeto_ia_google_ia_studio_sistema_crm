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
  image TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- Set up Row Level Security (RLS)
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can fully manage their own contacts" ON contacts
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
