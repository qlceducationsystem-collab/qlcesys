// Espacio de trabajo del área privada: sobre qué cliente se opera y en qué periodo.
// Cliente → sus propios datos. Admin → los MISMOS registros del cliente (X-Client-Id).
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createApi } from '../api/client.js';
import { useAuth } from './AuthContext.jsx';

const WorkspaceContext = createContext(null);
const LEVELS = { VIEW: 1, EDIT: 2, FULL: 3 };

const storeKey = (clientId) => `qlc_period_${clientId || 'me'}`;
const readStored = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
const writeStored = (k, v) => { try { localStorage.setItem(k, v); } catch { /* opcional */ } };

export function WorkspaceProvider({ clientId = null, client = null, children }) {
  const { user } = useAuth();
  const api = useMemo(() => createApi(clientId), [clientId]);
  const [periods, setPeriods] = useState([]);
  const [periodId, setPeriodId] = useState(null);
  const [state, setState] = useState({ loading: true, error: null });

  const reloadPeriods = useCallback(async (selectId) => {
    try {
      const list = await api.get('/periods');
      setPeriods(list);
      setPeriodId((current) => {
        const wanted = selectId || current || readStored(storeKey(clientId));
        return list.find((p) => p.id === wanted)?.id || list[0]?.id || null;
      });
      setState({ loading: false, error: null });
    } catch (error) {
      setState({ loading: false, error });
    }
  }, [api, clientId]);

  useEffect(() => { reloadPeriods(); }, [reloadPeriods]);
  useEffect(() => { if (periodId) writeStored(storeKey(clientId), periodId); }, [periodId, clientId]);

  const isAdminView = user?.role === 'ADMIN';
  const value = useMemo(() => ({
    api,
    clientId,
    client,
    isAdminView,
    basePath: clientId ? `/admin/clientes/${clientId}/app` : '/app',
    canEdit: !isAdminView || (LEVELS[user?.adminLevel] || 0) >= LEVELS.EDIT,
    isFullAdmin: isAdminView && user?.adminLevel === 'FULL',
    periods,
    period: periods.find((p) => p.id === periodId) || null,
    selectPeriod: setPeriodId,
    reloadPeriods,
    periodsState: state,
  }), [api, clientId, client, isAdminView, user, periods, periodId, reloadPeriods, state]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export const useWorkspace = () => useContext(WorkspaceContext);
