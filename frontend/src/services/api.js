const API_BASE = import.meta.env.VITE_API_URL || '';

let accessToken = localStorage.getItem('accessToken') || null;
let refreshPromise = null;

export function getAccessToken() {
  return accessToken;
}

export function setAccessToken(token) {
  accessToken = token;
  if (token) localStorage.setItem('accessToken', token);
  else localStorage.removeItem('accessToken');
}

async function refreshAccessToken() {
  if (!refreshPromise) {
    refreshPromise = fetch(`${API_BASE}/api/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
      .then(async (res) => {
        if (!res.ok) {
          setAccessToken(null);
          throw new Error('Sesión expirada');
        }
        const data = await res.json();
        setAccessToken(data.accessToken);
        return data.accessToken;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise;
}

export async function apiRequest(path, options = {}) {
  const headers = { ...options.headers };
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  }
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  let response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
    credentials: 'include',
    cache: 'no-store',
  });

  if (response.status === 401) {
    const body = await response.clone().json().catch(() => ({}));
    if (body.expired && accessToken) {
      try {
        await refreshAccessToken();
        headers.Authorization = `Bearer ${accessToken}`;
        response = await fetch(`${API_BASE}${path}`, {
          ...options,
          headers,
          credentials: 'include',
          cache: 'no-store',
        });
      } catch {
        setAccessToken(null);
        throw new Error('Sesión expirada');
      }
    }
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || data.error || 'Error en la petición');
  }
  return data;
}

export const authApi = {
  login: async (payload) => {
    const data = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    setAccessToken(data.accessToken);
    return data;
  },
  logout: async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      setAccessToken(null);
    }
  },
  getMe: () => apiRequest('/api/auth/me'),
};

export const api = {
  dashboard: () => apiRequest('/api/proyectos/dashboard'),
  catalogo: () => apiRequest('/api/catalogo'),
  misProyectos: () => apiRequest('/api/proyectos/mios'),
  proyecto: (id) => apiRequest(`/api/proyectos/${id}`),
  guardarProyecto: (body, id) =>
    apiRequest(id ? `/api/proyectos/${id}` : '/api/proyectos', {
      method: id ? 'PUT' : 'POST',
      body: JSON.stringify(body),
    }),
  eliminarProyecto: (id) =>
    apiRequest(`/api/proyectos/${id}`, { method: 'DELETE' }),
  repositorio: (q = '') =>
    apiRequest(`/api/proyectos/repositorio${q ? `?q=${encodeURIComponent(q)}` : ''}`),
  detalleRepositorio: (id) => apiRequest(`/api/proyectos/repositorio/${id}`),
  directorDashboard: () => apiRequest('/api/director'),
  directorRevision: (id) => apiRequest(`/api/director/revision/${id}`),
  directorAccion: (id, body) =>
    apiRequest(`/api/director/revision/${id}/accion`, {
      method: 'POST',
      body: JSON.stringify(body),
    }),
  soporte: (body) =>
    apiRequest('/api/soporte', { method: 'POST', body: JSON.stringify(body) }),
  proyectosAprobados: () => apiRequest('/api/informes/proyectos-aprobados'),
  presentarInforme: (formData) =>
    apiRequest('/api/informes', { method: 'POST', body: formData }),
};
