'use client';

import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

type UserRole = 'admin' | 'user' | null;

type AuthContextType = {
  user: any | null;
  role: UserRole;
  loading: boolean;
  refreshAuth: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null);
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  const loadAuth = async () => {
    console.log('AUTH: start loadAuth');

    try {
      setLoading(true);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      console.log('AUTH: session result', { session, sessionError });

      if (sessionError) {
        console.error('AUTH: session error', sessionError);
        setUser(null);
        setRole(null);
        return;
      }

      if (!session?.user) {
        console.log('AUTH: no session user');
        setUser(null);
        setRole(null);
        return;
      }

      setUser(session.user);

      console.log('AUTH: before users query', session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle();

      console.log('AUTH: profile result', { profile, profileError });

      if (profileError) {
        console.error('AUTH: profile error', profileError);
        setRole('user');
        return;
      }

      setRole((profile?.role as UserRole) || 'user');
    } catch (error) {
      console.error('AUTH: unexpected error', error);
      setUser(null);
      setRole('user');
    } finally {
      console.log('AUTH: finish loadAuth');
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      console.log('AUTH: onAuthStateChange fired');
      loadAuth();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      role,
      loading,
      refreshAuth: loadAuth,
    }),
    [user, role, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}