import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { supabase } from '../services/supabaseClient';
import { AuthError, Session, User as SupabaseUser } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signup: (name: string, email: string, password: string, role: Role) => Promise<{ error: AuthError | null }>;
  logout: () => Promise<{ error: AuthError | null }>;
  loading: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetchUserProfile(session.user);
      }
      setLoading(false);
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        await fetchUserProfile(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);
  
  const fetchUserProfile = async (supabaseUser: SupabaseUser) => {
      try {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        // If a profile exists, use it.
        if (userProfile) {
            setUser({
                id: userProfile.id,
                name: userProfile.name,
                email: userProfile.email,
                role: userProfile.role,
                avatarUrl: userProfile.avatar_url,
            });
            return;
        }

        // If no profile, and the error indicates "0 rows", create the profile.
        // This handles the first login for a new user and respects RLS policies.
        if (error && error.code === 'PGRST116') {
            const { data: newUserProfile, error: insertError } = await supabase
                .from('users')
                .insert({
                    id: supabaseUser.id,
                    name: supabaseUser.user_metadata.name,
                    email: supabaseUser.email,
                    role: supabaseUser.user_metadata.role,
                    avatar_url: supabaseUser.user_metadata.avatar_url,
                })
                .select()
                .single();

            if (insertError) throw insertError;
            
            if (newUserProfile) {
                setUser({
                    id: newUserProfile.id,
                    name: newUserProfile.name,
                    email: newUserProfile.email,
                    role: newUserProfile.role,
                    avatarUrl: newUserProfile.avatar_url,
                });
            }
        } else if (error) {
            throw error;
        }
      } catch (error) {
          console.error('Error fetching or creating user profile:', error);
          setUser(null);
          await supabase.auth.signOut(); // Log out user to prevent broken state
      }
  }


  const login = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signup = async (name: string, email: string, password: string, role: Role) => {
    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                name,
                role,
                avatar_url: `https://i.pravatar.cc/150?u=${email}` // Default avatar
            }
        }
    });

    // Manual insertion into 'users' table removed to fix RLS violation.
    // Profile creation is now handled by fetchUserProfile on first login,
    // which is a more secure and robust pattern.
    
    return { error };
  };


  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, signup, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
