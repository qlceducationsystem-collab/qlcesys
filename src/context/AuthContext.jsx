import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, setUnauthorizedHandler, tokenStore } from '../api/client.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [membership, setMembership] = useState(null);
  const [ready, setReady] = useState(false);

  const logout = useCallback(() => {
    api.post('/auth/logout').catch(() => {});
    tokenStore.set(null);
    setUser(null);
    setMembership(null);
  }, []);

  const loadMembership = useCallback(async (u) => {
    if (u?.role !== 'CLIENT') return setMembership(null);
    setMembership(await api.get('/subscriptions/me'));
  }, []);

  const refresh = useCallback(async () => {
    if (!tokenStore.get()) return setReady(true);
    try {
      const { user: u } = await api.get('/auth/me');
      setUser(u);
      await loadMembership(u);
    } catch {
      tokenStore.set(null);
      setUser(null);
    } finally {
      setReady(true);
    }
  }, [loadMembership]);

  useEffect(() => {
    setUnauthorizedHandler(() => { tokenStore.set(null); setUser(null); setMembership(null); });
    refresh();
  }, [refresh]);

  const startSession = useCallback(async ({ token, user: u }) => {
    tokenStore.set(token);
    setUser(u);
    await loadMembership(u);
    return u;
  }, [loadMembership]);

  const value = useMemo(() => ({
    user,
    membership,
    ready,
    hasAccess: user?.role === 'ADMIN' || !!membership?.hasAccess,
    login: async (body) => startSession(await api.post('/auth/login', body)),
    register: async (body) => startSession(await api.post('/auth/register', body)),
    logout,
    refreshMembership: () => loadMembership(user),
  }), [user, membership, ready, startSession, logout, loadMembership]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
