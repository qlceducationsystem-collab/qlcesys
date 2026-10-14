import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);
const NO_ACCESS = { access: { full: null, tools: [], hasAny: false, mode: 'NONE' }, offers: [], provider: 'MOCK' };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessInfo, setAccessInfo] = useState(null);
  const [ready, setReady] = useState(false);

  const clearSession = useCallback(() => {
    tokenStore.set(null);
    setUser(null);
    setAccessInfo(null);
  }, []);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => null);
    clearSession();
  }, [clearSession]);

  const loadAccess = useCallback(async (u) => {
    if (u?.role !== 'CLIENT') return setAccessInfo(null);
    try {
      setAccessInfo(await api.get('/payments/access'));
    } catch {
      setAccessInfo(NO_ACCESS);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) return setReady(true);
    try {
      const { user: u } = await api.get('/auth/me');
      setUser(u);
      await loadAccess(u);
    } catch {
      clearSession();
    } finally {
      setReady(true);
    }
  }, [loadAccess, clearSession]);

  useEffect(() => {
    setUnauthorizedHandler(clearSession);
    refresh();
  }, [refresh, clearSession]);

  const startSession = useCallback(async ({ token, user: u }) => {
    tokenStore.set(token);
    setUser(u);
    await loadAccess(u);
    return u;
  }, [loadAccess]);

  const value = useMemo(() => ({
    user,
    ready,
    accessInfo,
    access: accessInfo?.access || NO_ACCESS.access,
    hasAccess: user?.role === 'ADMIN' || !!accessInfo?.access?.hasAny,
    login: async (body) => startSession(await api.post('/auth/login', body)),
    register: async (body) => startSession(await api.post('/auth/register', body)),
    logout,
    refreshAccess: () => loadAccess(user),
  }), [user, ready, accessInfo, startSession, logout, loadAccess]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
