// src/context/AuthContext.jsx
import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { checkIfUserIsCoach } from '../lib/coaches';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [isCoach, setIsCoach] = useState(false);
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateAuthState = async (newSession) => {
    try {
      setSession(newSession);
      const currentUser = newSession?.user ?? null;

      if (currentUser) {
        console.log('[AUTH] Verificando rol en DB para:', currentUser.email);
        const roleCheckPromise = checkIfUserIsCoach(currentUser.id);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout verificando rol')), 5000)
        );

        try {
          const { isCoach: userIsCoach, coachData: data } = await Promise.race([roleCheckPromise, timeoutPromise]);
          setIsCoach(userIsCoach);
          setCoachData(data);
          // IMPORTANTE: Seteamos el usuario AL FINAL de la verificación de rol
          // para evitar que los ProtectedRoutes redirijan antes de saber si es coach.
          setUser(currentUser);
          console.log('[AUTH] Rol verificado y usuario seteado:', userIsCoach ? 'COACH' : 'CLIENTE');
        } catch (roleError) {
          console.error('[AUTH] Error o timeout verificando rol:', roleError.message);
          setIsCoach(false);
          setCoachData(null);
          setUser(currentUser); // Seteamos igual para que pueda entrar como coachee si falla el check
        }
      } else {
        console.log('[AUTH] Sesión cerrada o inexistente');
        setUser(null);
        setIsCoach(false);
        setCoachData(null);
      }
    } catch (err) {
      console.error('[AUTH] Error en updateAuthState:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let currentUserId = null; // Track del user.id actual para comparar cambios

    const initialize = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (isMounted) {
          currentUserId = initialSession?.user?.id ?? null;
          await updateAuthState(initialSession);
          console.log('[AUTH] Initial session cargada');
          setLoading(false);
        }
      } catch (err) {
        console.error('[AUTH] Error inicializando session:', err);
        if (isMounted) setLoading(false);
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;

        const newUserId = newSession?.user?.id ?? null;
        const userIdentityChanged = newUserId !== currentUserId;

        console.log('[AUTH] onAuthStateChange event:', _event, '| userChanged:', userIdentityChanged);

        if (userIdentityChanged) {
          // Cambio real de identidad (login, logout, switch de usuario) → mostrar loading
          setLoading(true);
          currentUserId = newUserId;
          await updateAuthState(newSession);
          setLoading(false);
        } else {
          // Mismo usuario, solo refresh de token o re-foco de pestaña → actualizar sesión silenciosamente
          setSession(newSession);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const resetPassword = async (email) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    return { data, error };
  };

  const value = {
    user,
    session,
    isCoach,
    coachData,
    loading,
    signIn,
    signUp,
    signOut,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return context;
}
