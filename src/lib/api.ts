const getApiUrl = (): string => {
  const metaEnv = (import.meta as any).env;
  if (metaEnv && metaEnv.VITE_API_URL) {
    return metaEnv.VITE_API_URL;
  }
  // Default to relative URL if we are running in the browser of the same container/preview
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname.includes('run.app') ||
     window.location.hostname === '127.0.0.1')
  ) {
    return '';
  }
  return 'https://ais-dev-mk66spdvnwesefkcv6kvij-751350557083.asia-southeast1.run.app';
};

const API_URL = getApiUrl();

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<any> {
  const url = endpoint.startsWith('http') ? endpoint : `${API_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error ${response.status}`);
  }

  return response.json();
}
