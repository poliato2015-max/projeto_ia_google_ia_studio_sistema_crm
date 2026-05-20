-- Create deals table
CREATE TABLE IF NOT EXISTS deals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  title TEXT NOT NULL,
  value NUMERIC NOT NULL DEFAULT 0,
  stage TEXT NOT NULL DEFAULT 'Prospecção' CHECK (stage IN ('Prospecção', 'Qualificação', 'Proposta', 'Negociação', 'Fechado')),
  probability INTEGER DEFAULT 20,
  expected_close_date DATE,
  contact_id UUID REFERENCES contacts(id) ON DELETE CASCADE,
  health_score INTEGER DEFAULT 100, -- 0 to 100
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE DEFAULT auth.uid()
);

-- RLS
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can fully manage their own deals" ON deals 
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
