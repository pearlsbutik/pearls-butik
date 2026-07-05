import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { getApiUrl } from './lib/api';

// Global Fetch Interceptor to ensure Vercel, Render, and relative requests work seamlessly
const API_URL = getApiUrl();
const originalFetch = window.fetch;

const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

  // Intercept relative /api/ calls as well as absolute api endpoints to allow routing rewrite
  const isApi = url.includes('/api/');
  
  if (isApi) {
    // Resolve relative /api/ to absolute backend URL if needed
    if (url.startsWith('/api/')) {
      url = `${API_URL}${url}`;
    } else if (url.startsWith('http://localhost:3000/api/') || url.startsWith('http://localhost:5173/api/')) {
      const path = url.substring(url.indexOf('/api/'));
      url = `${API_URL}${path}`;
    }

    const headers = new Headers(init?.headers || {});
    
    // Auto inject stored JWT authorization token if available
    const token = localStorage.getItem('token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }

    // Only set Content-Type if not already specified and not uploading form-data (e.g. file uploads)
    if (!headers.has('Content-Type') && !(init?.body instanceof FormData)) {
      headers.set('Content-Type', 'application/json');
    }

    const modifiedInit: RequestInit = {
      credentials: 'include',
      ...init,
      headers,
    };

    const response = await originalFetch(url, modifiedInit);

    // Safeguard response.json() to handle HTML errors gracefully
    const originalJson = response.json.bind(response);
    const originalText = response.text.bind(response);

    response.json = async () => {
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        try {
          const htmlText = await originalText();
          const match = htmlText.match(/<title>([\s\S]*?)<\/title>/i);
          const title = match ? match[1].trim() : "The page could not be found (HTML response)";
          return { error: `Server returned HTML: ${title}` };
        } catch (e) {
          return { error: "Server returned HTML instead of JSON." };
        }
      }
      try {
        return await originalJson();
      } catch (e) {
        try {
          const text = await originalText();
          return { error: text || "Failed to parse JSON response." };
        } catch (err) {
          return { error: "Failed to parse JSON response from the server." };
        }
      }
    };

    return response;
  }

  // Pass-through for non-API requests
  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    writable: true,
    enumerable: true
  });
} catch (e) {
  console.warn("Could not define fetch on window, trying prototype...", e);
  try {
    Object.defineProperty(Object.getPrototypeOf(window), 'fetch', {
      value: customFetch,
      configurable: true,
      writable: true,
      enumerable: true
    });
  } catch (err) {
    console.error("Failed to intercept window.fetch", err);
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
