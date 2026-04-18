'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { getSupabase } from '@/lib/supabase';
import { useRouter, usePathname } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabase();

  useEffect(() => {
    if (!loading && user && pathname === '/login') {
      console.log('AuthProvider: Logged in user on login page, forcing redirect to dashboard...');
      window.location.href = '/';
    }
  }, [user, loading, pathname]);

  useEffect(() => {
    let isMounted = true;

    const setData = async () => {
      console.log('AuthProvider: Checking session...');
      if (!supabase) {
        console.warn('AuthProvider: Supabase client not initialized.');
        if (isMounted) setLoading(false);
        return;
      }
      
      // Safety timeout for session check
      const stateTimeout = setTimeout(() => {
        if (isMounted && loading) {
          console.warn('AuthProvider: Session check taking too long, forcing loading=false');
          setLoading(false);
        }
      }, 5000);

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        clearTimeout(stateTimeout);
        
        if (error) {
          console.error('AuthProvider: Error getting session:', error);
        }
        console.log('AuthProvider: Session found:', !!session);
        if (isMounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setLoading(false);
        }
      } catch (e) {
        clearTimeout(stateTimeout);
        console.error('AuthProvider: Auth sync error:', e);
        if (isMounted) setLoading(false);
      }
    };

    setData();

    let subscription: any = null;
    if (supabase) {
      const { data } = supabase.auth.onAuthStateChange(async (event: any, currentSession: any) => {
        console.log('AuthProvider: authStateChange event:', event, 'Session:', !!currentSession);
        if (!isMounted) return;
        
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);

        // We avoid router.refresh() here to prevent conflicts with page-level redirects
        // especially during login/logout transitions
      });
      subscription = data.subscription;
    }

    return () => {
      isMounted = false;
      if (subscription) subscription.unsubscribe();
    };
  }, [supabase, router, loading]);

  const signOut = async () => {
    console.log('AuthProvider: Absolute signOut initiated');
    
    // 1. Manually clear all possible auth cookies immediately
    // WARNING: In iframes (AI Studio), we MUST include SameSite=None; Secure; 
    // to successfully clear/overwrite cookies that were set with those flags.
    const cookieNames = [
      'executive-lens-auth',
      'executive-lens-auth-code-verifier',
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token'
    ];
    
    // We also need to clear potential chunks (e.g., .0, .1)
    const allCookies = document.cookie.split(';');
    allCookies.forEach(cookie => {
      const name = cookie.split('=')[0].trim();
      if (name.includes('executive-lens-auth') || cookieNames.includes(name)) {
        // Clear with all possible variations to be sure
        const baseSettings = 'path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=None; Secure;';
        document.cookie = `${name}=; ${baseSettings}`;
        document.cookie = `${name}=; ${baseSettings} domain=${window.location.hostname};`;
      }
    });

    // 2. Clear localStorage as a secondary safety measure
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {}

    // 3. Attempt to notify Supabase, but don't wait for it
    try {
      if (supabase) {
        supabase.auth.signOut().catch(() => {});
      }
    } catch (error) {}

    // 4. Force immediate redirect
    console.log('AuthProvider: Forcing redirect to /login');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
