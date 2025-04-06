import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface AuthState {
  user: any | null;
  loading: boolean;
  setUser: (user: any) => void;
  initializeAuth: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  setUser: (user) => set({ user }),
  
  initializeAuth: async () => {
    try {
      set({ loading: true });
      const { data } = await supabase.auth.getSession();
      const { session } = data;
      
      if (session) {
        const { user } = session;
        set({ user });
      }
    } catch (error) {
      console.error('Error initializing auth:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  signIn: async (email, password) => {
    try {
      set({ loading: true });
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      
      if (data?.user) {
        set({ user: data.user });
      }
    } catch (error) {
      console.error('Error signing in:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  signUp: async (email, password, fullName) => {
    try {
      set({ loading: true });
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      
      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{ id: data.user.id, email, full_name: fullName }]);
          
        if (profileError) throw profileError;
        
        set({ user: data.user });
      }
    } catch (error) {
      console.error('Error signing up:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  signOut: async () => {
    try {
      set({ loading: true });
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));