import { Session, User } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthContext: Initializing...');
    
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string) => {
    console.log('🚀 AuthContext: Starting sign up for:', email);
    try {
      // Test basic connectivity first
      console.log('🌐 Testing network connectivity...');
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ AuthContext: Sign up error:', error.message);
        console.error('❌ Error details:', error);
        
        // Provide more helpful error messages
        if (error.message.includes('Network request failed')) {
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        }
        
        throw error;
      }
      
      console.log('✅ AuthContext: Sign up successful:', data.user?.email);
      return data;
    } catch (err) {
      console.error('❌ AuthContext: Sign up exception:', err);
      throw err;
    }
  };

  const signIn = async (email: string, password: string) => {
    console.log('🔑 AuthContext: Starting sign in for:', email);
    try {
      console.log('🌐 Testing network connectivity first...');
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        console.error('❌ AuthContext: Sign in error:', error.message);
        console.error('❌ Error code:', error.status);
        console.error('❌ Full error:', error);
        
        // Provide more helpful error messages
        if (error.message.includes('Network request failed')) {
          throw new Error('Network connection failed. Please check your internet connection and try again.');
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials or sign up for a new account.');
        }
        
        throw error;
      }
      
      console.log('✅ AuthContext: Sign in successful:', data.user?.email);
      return data;
    } catch (err) {
      console.error('❌ AuthContext: Sign in exception:', err);
      throw err;
    }
  };

  const signOut = async () => {
    console.log('👋 AuthContext: Signing out...');
    
    // Sign out from Supabase
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('❌ AuthContext: Sign out error:', error);
      throw error;
    }
    console.log('✅ AuthContext: Sign out successful');
  };

  const resetPassword = async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    
    if (error) {
      throw error;
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
