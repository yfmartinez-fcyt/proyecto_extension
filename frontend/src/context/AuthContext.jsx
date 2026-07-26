import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authApi, getAccessToken, setAccessToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = useCallback(async () => {
    if (!getAccessToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const data = await authApi.getMe();
      setUser(data.data);
    } catch {
      setAccessToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (credentials) => {
    const data = await authApi.login(credentials);
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      isDirector: user?.rol === 'director_extension',
      isProponente: user && ['alumno', 'docente', 'admin'].includes(user.rol),
      login,
      logout,
      reload: loadUser,
    }),
    [user, loading, loadUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
