const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

const buildQueryString = (params = {}) => {
  const query = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&');
  return query ? `?${query}` : '';
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }
  if (contentType.includes('application/pdf')) {
    return response.blob();
  }
  return response.text();
};

export async function apiRequest(path, { method = 'GET', body, token, headers = {}, query } = {}) {
  const finalHeaders = { ...headers };
  let finalBody = body;

  if (token) {
    finalHeaders.Authorization = `Bearer ${token}`;
  }

  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
    finalBody = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${path}${buildQueryString(query)}`;
  const response = await fetch(url, {
    method,
    headers: finalHeaders,
    body: finalBody
  });

  const payload = await parseResponse(response);

  if (!response.ok) {
    const message = payload?.message || payload?.error || 'An unexpected error occurred';
    throw new Error(message);
  }

  return payload;
}

export const ProductsApi = {
  list: ({ search, categoryId, page, size } = {}, token) =>
    apiRequest('/api/products', {
      token,
      query: { search, categoryId, page, size }
    }),
  create: (payload, token) =>
    apiRequest('/api/products', { method: 'POST', body: payload, token }),
  update: (productId, payload, token) =>
    apiRequest(`/api/products/${productId}`, { method: 'PUT', body: payload, token }),
  remove: (productId, token) =>
    apiRequest(`/api/products/${productId}`, { method: 'DELETE', token }),
  references: (token) =>
    apiRequest('/api/products/references', { token }),
  exportPdf: ({ search, categoryId } = {}, token) =>
    apiRequest('/api/products/export/pdf', {
      token,
      headers: { Accept: 'application/pdf' },
      query: { search, categoryId }
    })
};

export const DashboardApi = {
  summary: (token) => apiRequest('/api/dashboard/summary', { token })
};


