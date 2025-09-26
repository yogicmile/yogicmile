import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  role: string | null;
  isAdmin: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
};

interface AdminAuthProviderProps {
  children: ReactNode;
}

export const AdminAuthProvider: React.FC<AdminAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [role, setRole] = useState<string | null>(null);
  const { toast } = useToast();

  const isAdmin = role ? ['admin', 'super_admin', 'content_admin'].includes(role) : false;

  // Fetch user role from database (and ensure user row exists if missing)
  const fetchUserRole = async (userId: string) => {
    try {
      console.log('Fetching role for user:', userId);

      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Role fetch error:', error);
      }

      let roleValue = data?.role as string | null;

      // If no row exists, create using secure RPC function
      if (!roleValue) {
        const { data: userInfo } = await supabase.auth.getUser();
        const email = userInfo.user?.email || 'admin@yogicmile.com';
        const fullName = email.split('@')[0] || 'Admin User';

        // Use secure RPC to create user record
        const { data: createdUserId, error: upsertErr } = await supabase.rpc('create_user_with_mobile', {
          p_mobile_number: '0000000000',
          p_full_name: fullName,
          p_email: email,
          p_address: 'N/A',
          p_referred_by: null
        });

        if (upsertErr) {
          console.error('User creation failed:', upsertErr);
        } else {
          roleValue = 'user';
        }
      }

      setRole(roleValue);
    } catch (error) {
      console.error('Error fetching user role:', error);
      setRole(null);
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false): Promise<{ error: any }> => {
    try {
      console.log('Admin login attempt:', { email, timestamp: new Date().toISOString() });
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log('Supabase auth response:', { data: data?.user?.id, error: error?.message });

      if (error) {
        console.error('Auth error details:', error);
        throw error;
      }

      if (data.user) {
        await fetchUserRole(data.user.id);
      }

      // Set session persistence based on remember me
      if (rememberMe) {
        await supabase.auth.updateUser({
          data: { remember_session: true }
        });
      }

      toast({
        title: "Welcome back",
        description: "Successfully signed in to admin panel",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign in failed",
        description: error.message,
      });
      return { error };
    }
  };

  const signOut = async (): Promise<void> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      setUser(null);
      setSession(null);
      setRole(null);

      // Log admin action
      if (user) {
        await supabase.rpc('log_admin_action', {
          p_action: 'admin_logout'
        });
      }

      toast({
        title: "Signed out",
        description: "Successfully signed out of admin panel",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Sign out failed", 
        description: error.message,
      });
    }
  };

  const resetPassword = async (email: string): Promise<{ error: any }> => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/admin/reset-password`,
      });

      if (error) throw error;

      toast({
        title: "Password reset sent",
        description: "Check your email for password reset instructions",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Password reset failed",
        description: error.message,
      });
      return { error };
    }
  };

  useEffect(() => {
    // Set up auth state listener FIRST (sync callback only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Defer Supabase calls to avoid deadlocks inside the callback
        setTimeout(() => {
          fetchUserRole(session.user!.id);
          if (event === 'SIGNED_IN') {
            supabase.rpc('log_admin_action', { p_action: 'admin_login' });
          }
        }, 0);
      } else {
        setRole(null);
      }

      setIsLoading(false);
    });

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        setTimeout(() => fetchUserRole(session.user!.id), 0);
      }

      setIsLoading(false);
    }).catch(() => setIsLoading(false));

    return () => subscription.unsubscribe();
  }, []);

  // Auto logout after 2 hours of inactivity
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const resetTimeout = () => {
      clearTimeout(timeoutId);
      if (user && isAdmin) {
        timeoutId = setTimeout(() => {
          signOut();
          toast({
            title: "Session expired",
            description: "You have been automatically logged out due to inactivity",
            variant: "destructive"
          });
        }, 2 * 60 * 60 * 1000); // 2 hours
      }
    };

    const handleActivity = () => {
      if (user && isAdmin) {
        resetTimeout();
      }
    };

    // Listen for user activity
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    resetTimeout();

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
    };
  }, [user, isAdmin]);

  const value: AdminAuthContextType = {
    user,
    session,
    isLoading,
    role,
    isAdmin,
    signIn,
    signOut,
    resetPassword,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
};