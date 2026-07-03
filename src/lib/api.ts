const getBaseUrl = (): string => {
  // If running on local server/AI Studio preview, use relative URL
  if (
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname.includes('run.app') ||
     window.location.hostname === '127.0.0.1')
  ) {
    return '';
  }
  // Otherwise, use the production/development URL of the container
  return 'https://ais-dev-mk66spdvnwesefkcv6kvij-751350557083.asia-southeast1.run.app';
};

export async function apiFetch(path: string, options?: RequestInit): Promise<Response> {
  const baseUrl = getBaseUrl();
  const url = path.startsWith('http') ? path : `${baseUrl}${path}`;
  return fetch(url, options);
}
