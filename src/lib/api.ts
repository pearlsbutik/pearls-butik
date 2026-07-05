export const getApiUrl = (): string => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_URL) {
    return metaEnv.VITE_API_URL;
  }
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname.includes('run.app')
    ) {
      return '';
    }
    // For Vercel or any other external host, default to the Render URL
    return 'https://pearls-butik.onrender.com';
  }
  return 'https://pearls-butik.onrender.com';
};

const API_URL = getApiUrl();

export const resolveApiUrl = (endpoint: string): string => {
  if (endpoint.startsWith('http')) return endpoint;
  return `${API_URL}${endpoint}`;
};

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = resolveApiUrl(endpoint);
  
  // Auto inject stored JWT authorization token
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const authHeaders = token ? { 'Authorization': `Bearer ${token}` } : {};

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...authHeaders,
  };

  // Only set Content-Type to application/json if there is a body and it is not a FormData object
  if (options.body && !(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  } else if (!options.body) {
    headers['Content-Type'] = 'application/json';
  }

  // Merge with custom headers
  if (options.headers) {
    const passedHeaders = options.headers as Record<string, string>;
    Object.keys(passedHeaders).forEach((key) => {
      headers[key] = passedHeaders[key];
    });
  }

  const fetchOptions: RequestInit = {
    credentials: 'include',
    ...options,
    headers,
  };

  let response: Response;
  try {
    response = await fetch(url, fetchOptions);
  } catch (err: any) {
    throw new Error(`Failed to connect to the authentication server: ${err.message || err}`);
  }

  const contentType = response.headers.get('content-type') || '';
  
  if (!response.ok) {
    if (contentType.includes('text/html')) {
      const htmlText = await response.text();
      const match = htmlText.match(/<title>([\s\S]*?)<\/title>/i);
      const title = match ? match[1].trim() : "The page could not be found (HTML 404/500)";
      throw new Error(`Server returned HTML: ${title}`);
    }

    let errorData: any = {};
    try {
      errorData = await response.json();
    } catch (e) {
      throw new Error(`HTTP Error ${response.status}: Failed to parse JSON response.`);
    }

    throw new Error(errorData.error || errorData.message || `API Error ${response.status}`);
  }

  if (contentType.includes('text/html')) {
    const htmlText = await response.text();
    const match = htmlText.match(/<title>([\s\S]*?)<\/title>/i);
    const title = match ? match[1].trim() : "HTML Response received instead of JSON";
    throw new Error(`Server returned HTML: ${title}`);
  }

  return response.json();
}
