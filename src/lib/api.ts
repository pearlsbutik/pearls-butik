const API_URL = import.meta.env.VITE_API_URL!;

export async function apiFetch(
  path: string,
  options?: RequestInit
) {
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    ...options
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}`);
  }

  return response.json();
}
