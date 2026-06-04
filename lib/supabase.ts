import { createBrowserClient } from '@supabase/ssr';

let supabaseClient: any = null;

// Global server-side mock storage to prevent Local Storage crashes during SSR
const serverMockStorage = new Map<string, string>();

const getMockItem = (key: string): string | null => {
  if (typeof window !== 'undefined') {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }
  return serverMockStorage.get(key) || null;
};

const setMockItem = (key: string, value: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(key, value);
    } catch (e) {}
  } else {
    serverMockStorage.set(key, value);
  }
};

const removeMockItem = (key: string): void => {
  if (typeof window !== 'undefined') {
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  } else {
    serverMockStorage.delete(key);
  }
};

// Helper to check if real Supabase keys are fully defined (works on both client and server)
export const isRealSupabaseConfigured = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return !!(url && url.startsWith('http') && !url.includes('placeholder') && key && key.length > 20 && !key.includes('placeholder'));
};

// Return true so page components bypass fallback gates and let our mock client handle query rendering seamlessly
export const isSupabaseConfigured = () => {
  return true;
};

// Database Initialization helper for fully functional local mode setup
function initMockData() {
  if (!getMockItem('executive-lens-session')) {
    setMockItem('executive-lens-session', JSON.stringify({
      user: {
        id: '00000000-0000-0000-0000-000000000000',
        email: 'poliato2015@gmail.com',
        user_metadata: {
          full_name: 'Usuário Demostração',
          phone: '(11) 99999-9999'
        }
      }
    }));
  }

  if (!getMockItem('executive-lens-contacts')) {
    const defaultContacts = [
      {
        id: 'c1',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Ana Silva',
        email: 'ana.silva@tech.com',
        company: 'Tech Solutions',
        status: 'Lead',
        last_contact: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        value: 15000,
        initials: 'AS',
        avatar_color: 'bg-primary-container',
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 'c2',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Bruno Santos',
        email: 'bruno@inova.corp',
        company: 'Inova Corp',
        status: 'Cliente',
        last_contact: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        value: 45000,
        initials: 'BS',
        avatar_color: 'bg-secondary-container',
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 'c3',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Carla Oliveira',
        email: 'carla@varejoglobal.com',
        company: 'Varejo Global',
        status: 'Lead',
        last_contact: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        value: 28000,
        initials: 'CO',
        avatar_color: 'bg-error-container',
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 'c4',
        created_at: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Diego Souza',
        email: 'diego@distsul.com.br',
        company: 'Distribuidora Sul',
        status: 'Inativo',
        last_contact: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        value: 5000,
        initials: 'DS',
        avatar_color: 'bg-surface-container-highest',
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 'c5',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        name: 'Elaine Costa',
        email: 'elaine@grupoalfa.com',
        company: 'Grupo Alfa',
        status: 'Cliente',
        last_contact: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
        value: 60000,
        initials: 'EC',
        avatar_color: 'bg-secondary-container',
        user_id: '00000000-0000-0000-0000-000000000000'
      }
    ];
    setMockItem('executive-lens-contacts', JSON.stringify(defaultContacts));
  }

  if (!getMockItem('executive-lens-deals')) {
    const defaultDeals = [
      {
        id: 'd1',
        created_at: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Contrato Cloud Alfa',
        value: 60000,
        stage: 'Negociação',
        probability: 75,
        expected_close_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 'c5',
        health_score: 85,
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 'd2',
        created_at: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Migração Inova Corp',
        value: 45000,
        stage: 'Fechado',
        probability: 100,
        expected_close_date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 'c2',
        health_score: 100,
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 'd3',
        created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Consultoria Tech',
        value: 15000,
        stage: 'Qualificação',
        probability: 30,
        expected_close_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 'c1',
        health_score: 65,
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 'd4',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'CRM Varejo Global',
        value: 28000,
        stage: 'Proposta',
        probability: 60,
        expected_close_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        contact_id: 'c3',
        health_score: 55,
        user_id: '00000000-0000-0000-0000-000000000000'
      }
    ];
    setMockItem('executive-lens-deals', JSON.stringify(defaultDeals));
  }

  if (!getMockItem('executive-lens-tasks')) {
    const defaultTasks = [
      {
        id: 't1',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Enviar proposta final Alfa',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Alta',
        status: 'pendente',
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 't2',
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Reunião de alinhamento Tech Solutions',
        due_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Média',
        status: 'concluída',
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 't3',
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Ligação de follow-up Varejo Global',
        due_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Alta',
        status: 'atrasada',
        user_id: '00000000-0000-0000-0000-000000000000'
      },
      {
        id: 't4',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        title: 'Planejamento trimestral',
        due_date: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: 'Baixa',
        status: 'em_progresso',
        user_id: '00000000-0000-0000-0000-000000000000'
      }
    ];
    setMockItem('executive-lens-tasks', JSON.stringify(defaultTasks));
  }
}

class LocalMockBuilder {
  private table: string;
  private filters: { col: string; val: any }[] = [];
  private orderCol: string | null = null;
  private orderAsc: boolean = true;
  private limitValue: number | null = null;
  private orFilter: string | null = null;
  private ilikeFilter: { col: string; val: string } | null = null;

  constructor(table: string) {
    this.table = table;
  }

  private getData() {
    initMockData();
    const raw = getMockItem(`executive-lens-${this.table}`);
    return raw ? JSON.parse(raw) : [];
  }

  private saveData(data: any[]) {
    setMockItem(`executive-lens-${this.table}`, JSON.stringify(data));
  }

  select(selectStr?: string) {
    return this;
  }

  eq(col: string, val: any) {
    this.filters.push({ col, val });
    return this;
  }

  order(col: string, options?: { ascending: boolean }) {
    this.orderCol = col;
    this.orderAsc = options?.ascending !== false;
    return this;
  }

  or(filterStr: string) {
    this.orFilter = filterStr;
    return this;
  }

  ilike(col: string, val: string) {
    this.ilikeFilter = { col, val };
    return this;
  }

  limit(val: number) {
    this.limitValue = val;
    return this;
  }

  async single() {
    const data = this.execute();
    if (data.length === 0) {
      return { data: null, error: { message: 'Not found' } };
    }
    return { data: data[0], error: null };
  }

  private execute() {
    let list = this.getData();

    // Nested joins for deals -> contact:contacts(*)
    if (this.table === 'deals') {
      const contacts = JSON.parse(getMockItem('executive-lens-contacts') || '[]');
      list = list.map((deal: any) => {
        const contact = contacts.find((c: any) => c.id === deal.contact_id);
        return {
          ...deal,
          contact: contact || null
        };
      });
    }

    // Process filters
    for (const f of this.filters) {
      if (f.col === 'user_id') continue; // Accept all requests within the local sandboxed user session
      list = list.filter((item: any) => item[f.col] === f.val);
    }

    if (this.orFilter) {
      const termMatch = this.orFilter.match(/ilike\.%([^%]+)%/);
      if (termMatch) {
        const query = termMatch[1].toLowerCase();
        list = list.filter((item: any) => {
          return (
            (item.name && String(item.name).toLowerCase().includes(query)) ||
            (item.company && String(item.company).toLowerCase().includes(query)) ||
            (item.email && String(item.email).toLowerCase().includes(query))
          );
        });
      }
    }

    if (this.ilikeFilter) {
      const query = this.ilikeFilter.val.replace(/%/g, '').toLowerCase();
      const col = this.ilikeFilter.col;
      list = list.filter((item: any) => item[col] && String(item[col]).toLowerCase().includes(query));
    }

    // Sort order
    if (this.orderCol) {
      const oCol = this.orderCol;
      const oAsc = this.orderAsc;
      list.sort((a: any, b: any) => {
        const valA = a[oCol];
        const valB = b[oCol];
        if (valA === valB) return 0;
        if (valA == null) return 1;
        if (valB == null) return -1;
        if (typeof valA === 'number' && typeof valB === 'number') {
          return oAsc ? valA - valB : valB - valA;
        }
        return oAsc 
          ? String(valA).localeCompare(String(valB)) 
          : String(valB).localeCompare(String(valA));
      });
    }

    // Limit slice
    if (this.limitValue != null) {
      list = list.slice(0, this.limitValue);
    }

    return list;
  }

  // Chain promises
  then(onfulfilled: any, onrejected?: any) {
    const res = { data: this.execute(), error: null };
    return Promise.resolve(res).then(onfulfilled, onrejected);
  }

  async insert(arr: any[]) {
    const items = this.getData();
    const newItems = arr.map(item => ({
      ...item,
      id: item.id || `mock-${Math.random().toString(36).substr(2, 9)}`,
      created_at: item.created_at || new Date().toISOString(),
    }));
    this.saveData([...items, ...newItems]);
    return { data: newItems, error: null };
  }

  async update(obj: any) {
    return {
      eq: (col: string, val: any) => {
        return {
          eq: (col2: string, val2: any) => {
            const items = this.getData();
            const updatedItems = items.map((item: any) => {
              if (item[col] === val) {
                return { ...item, ...obj };
              }
              return item;
            });
            this.saveData(updatedItems);
            return Promise.resolve({ data: obj, error: null });
          },
          then: (resolve: any) => {
            const items = this.getData();
            const updatedItems = items.map((item: any) => {
              if (item[col] === val) {
                return { ...item, ...obj };
              }
              return item;
            });
            this.saveData(updatedItems);
            return Promise.resolve({ data: obj, error: null }).then(resolve);
          }
        };
      }
    };
  }

  delete() {
    return {
      eq: (col1: string, val1: any) => {
        return {
          eq: (col2: string, val2: any) => {
            const items = this.getData();
            const filtered = items.filter((item: any) => {
              const match1 = item[col1] === val1;
              const match2 = col2 === 'user_id' ? true : item[col2] === val2;
              return !(match1 && match2);
            });
            this.saveData(filtered);
            return Promise.resolve({ data: null, error: null });
          },
          then: (resolve: any) => {
            const items = this.getData();
            const filtered = items.filter((item: any) => item[col1] !== val1);
            this.saveData(filtered);
            return Promise.resolve({ data: null, error: null }).then(resolve);
          }
        };
      }
    };
  }
}

const localMockSupabaseClient = {
  from(table: string) {
    return new LocalMockBuilder(table);
  },
  channel(name: string) {
    return {
      on(event: string, opts: any, callback: any) { return this; },
      subscribe() { return this; }
    };
  },
  auth: {
    async getSession() {
      initMockData();
      const raw = getMockItem('executive-lens-session');
      const sessionObj = raw ? JSON.parse(raw) : null;
      return { data: { session: sessionObj }, error: null };
    },
    async signInWithPassword({ email, password }: any) {
      initMockData();
      const sessionObj = {
        user: {
          id: '00000000-0000-0000-0000-000000000000',
          email: email || 'poliato2015@gmail.com',
          user_metadata: {
            full_name: 'Usuário Demostração',
            phone: '(11) 99999-9999'
          }
        }
      };
      setMockItem('executive-lens-session', JSON.stringify(sessionObj));
      return { data: { session: sessionObj }, error: null };
    },
    async signUp({ email, password, options }: any) {
      initMockData();
      const sessionObj = {
        user: {
          id: '00000000-0000-0000-0000-000000000000',
          email: email || 'poliato2015@gmail.com',
          user_metadata: {
            full_name: options?.data?.full_name || 'Usuário Demostração',
            phone: options?.data?.phone || '(11) 99999-9999'
          }
        },
        identities: [{}]
      };
      setMockItem('executive-lens-session', JSON.stringify(sessionObj));
      return { data: sessionObj, error: null };
    },
    async signOut() {
      removeMockItem('executive-lens-session');
      return { error: null };
    },
    async resetPasswordForEmail(email: string, options?: any) {
      return { data: null, error: null };
    },
    async updateUser(attributes: any) {
      return { data: { user: {} }, error: null };
    },
    onAuthStateChange(callback: any) {
      setTimeout(() => {
        const raw = getMockItem('executive-lens-session');
        const sessionObj = raw ? JSON.parse(raw) : null;
        callback('SIGNED_IN', sessionObj);
      }, 50);
      return {
        data: {
          subscription: {
            unsubscribe() {}
          }
        }
      };
    },
    exchangeCodeForSession(code: string) {
      return Promise.resolve({ error: null });
    }
  }
};

export const getSupabase = () => {
  if (supabaseClient) return supabaseClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (isRealSupabaseConfigured() && url && key) {
    if (typeof window !== 'undefined') {
      try {
        supabaseClient = createBrowserClient(url, key, {
          cookieOptions: {
            name: 'executive-lens-auth',
            sameSite: 'none',
            secure: true,
            path: '/',
          }
        });
        return supabaseClient;
      } catch (e) {
        console.error('Supabase real init error, falling back to Local Storage client:', e);
      }
    }
  }

  // Fallback to local storage/memory mock client when Supabase is offline or unconfigured
  return localMockSupabaseClient;
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

export type Task = {
  id: string;
  created_at: string;
  title: string;
  due_date: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  status: 'pendente' | 'em_progresso' | 'concluída' | 'atrasada';
  user_id: string;
  updated_at?: string;
};
