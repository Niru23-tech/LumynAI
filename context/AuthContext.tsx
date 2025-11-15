
import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { supabase } from '../services/supabaseClient';
import { AuthError, Session, User as SupabaseUser, PostgrestError } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loginWithGoogle: () => Promise<{ error: AuthError | null }>;
  updateUserRole: (role: Role) => Promise<{ error: PostgrestError | null }>;
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

        if (error && error.code === 'PGRST116') { // "0 rows" error, meaning no profile exists
            const { data: newUserProfile, error: insertError } = await supabase
                .from('users')
                .insert({
                    id: supabaseUser.id,
                    name: supabaseUser.user_metadata.full_name || supabaseUser.user_metadata.name,
                    email: supabaseUser.email,
                    role: null, // Role is set in the complete-profile step
                    avatar_url: supabaseUser.user_metadata.picture || supabaseUser.user_metadata.avatar_url,
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
          await supabase.auth.signOut();
      }
  }

  const loginWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
    });
    return { error };
  };
  
  const updateUserRole = async (role: Role) => {
    if (!user) return { error: { message: "User not found", code: "404", details: "", hint: ""} as PostgrestError };
    
    const { error } = await supabase
        .from('users')
        .update({ role: role })
        .eq('id', user.id);

    if (!error) {
        setUser(currentUser => currentUser ? { ...currentUser, role: role } : null);
    }
    
    return { error };
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    setUser(null);
    return { error };
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loginWithGoogle, updateUserRole, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};