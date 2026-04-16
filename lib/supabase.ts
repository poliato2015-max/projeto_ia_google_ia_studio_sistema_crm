import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseClient: SupabaseClient | null = null;

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
              process.env.SUPABASE_ANON_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  const isValidUrl = url && url.startsWith('http') && !url.includes('placeholder');
  const isValidKey = key && key.length > 20 && !key.includes('placeholder');

  if (!isValidUrl || !isValidKey) {
    if (typeof window !== 'undefined') {
      console.warn('Supabase: Usando cliente placeholder (configuração incompleta ou inválida).');
    }
    supabaseClient = createClient('https://placeholder.supabase.co', 'placeholder');
    return supabaseClient;
  }

  // URL real detectada
  let finalUrl = url;
  if (finalUrl.endsWith('/')) {
    finalUrl = finalUrl.slice(0, -1);
  }

  supabaseClient = createClient(finalUrl, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    }
  });
  
  return supabaseClient;
};

export const isSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
              process.env.SUPABASE_ANON_KEY || 
              process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  
  const isValidUrl = url && url.startsWith('http') && !url.includes('placeholder');
  const isValidKey = key && key.length > 20 && !key.includes('placeholder');
  
  return !!(isValidUrl && isValidKey);
};

export type Contact = {
  id: string;
  created_at: string;
  name: string;
  email: string | null;
  company: string | null;
  status: 'Lead' | 'Cliente' | 'Inativo';
  last_contact: string | null;
  value: number;
  initials: string | null;
  avatar_color: string | null;
  image: string | null;
};

export type Deal = {
  id: string;
  created_at: string;
  title: string;
  value: number;
  stage: 'Prospecção' | 'Qualificação' | 'Proposta' | 'Negociação' | 'Fechado';
  probability: number;
  expected_close_date: string | null;
  contact_id: string | null;
  health_score: number;
  // Join data
  contact?: Contact;
};
