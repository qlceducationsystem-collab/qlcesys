// Cliente HTTP único. La URL del backend viene de VITE_API_URL (nunca localhost fijo).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');
const TOKEN_KEY = 'qlc_token';

export class ApiError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

export const tokenStore = {
  get: () => {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set: (t) => {
    try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* sin almacenamiento */ }
  },
};

// Notifica sesión expirada al AuthContext.
let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

function headers(clientId, json = true) {
  const h = {};
  if (json) h['Content-Type'] = 'application/json';
  const token = tokenStore.get();
  if (token) h.Authorization = `Bearer ${token}`;
  if (clientId) h['X-Client-Id'] = clientId;
  return h;
}

async function request(method, path, { body, clientId } = {}) {
  let res;
  try {
    res = await fetch(`${BASE}/api${path}`, { method, headers: headers(clientId), body: body === undefined ? undefined : JSON.stringify(body) });
  } catch {
    throw new ApiError(0, 'No se pudo conectar con el servidor');
  }
  if (res.status === 204) return null;
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && tokenStore.get()) onUnauthorized();
    throw new ApiError(res.status, data.error || 'Error inesperado', data.details);
  }
  return data;
}

// Descarga de archivos (PDF) con autenticación.
async function download(path, clientId, fallbackName = 'documento.pdf') {
  const res = await fetch(`${BASE}/api${path}`, { headers: headers(clientId, false) });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.error || 'No se pudo descargar');
  }
  const blob = await res.blob();
  const name = /filename="([^"]+)"/.exec(res.headers.get('Content-Disposition') || '')?.[1] || fallbackName;
  const url = URL.createObjectURL(blob);
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// Cliente ligado opcionalmente a un cliente gestionado por el administrador.
export function createApi(clientId = null) {
  return {
    clientId,
    get: (p) => request('GET', p, { clientId }),
    post: (p, body = {}) => request('POST', p, { body, clientId }),
    put: (p, body) => request('PUT', p, { body, clientId }),
    patch: (p, body) => request('PATCH', p, { body, clientId }),
    del: (p) => request('DELETE', p, { clientId }),
    download: (p, name) => download(p, clientId, name),
  };
}

export const api = createApi();
