import { createClient } from "@supabase/supabase-js";

// Helper to resolve Supabase credentials safely across client and server
const getSupabaseConfig = () => {
  const isServer = typeof window === "undefined";
  
  let url = "";
  let anonKey = "";
  let serviceRoleKey = "";
  let storageBucket = "";

  if (isServer) {
    // Backend (Node/Express)
    url = process.env.SUPABASE_URL || "";
    anonKey = process.env.SUPABASE_ANON_KEY || "";
    serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    storageBucket = process.env.SUPABASE_STORAGE_BUCKET || "pearls-butik";
  } else {
    // Frontend (Vite/Browser)
    const metaEnv = (import.meta as any).env || {};
    url = metaEnv.VITE_SUPABASE_URL || "";
    anonKey = metaEnv.VITE_SUPABASE_ANON_KEY || "";
    storageBucket = metaEnv.VITE_SUPABASE_STORAGE_BUCKET || "pearls-butik";
  }

  // Hardcoded fallback values from user request if env is empty
  if (!url) {
    url = "https://zxjtvgxoaattkajdwkxy.supabase.co";
  }
  if (!anonKey) {
    anonKey = "sb_publishable_M20dCBdwRK8hW54Lc5zQ8A_A6tm6sc8";
  }
  if (isServer && !serviceRoleKey) {
    serviceRoleKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp4anR2Z3hvYWF0dGthamR3a3h5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzMzMzQ0NiwiZXhwIjoyMDk4OTA5NDQ2fQ.rZmuhV0YiaCDbXDfzlEcVSQsOnHd2J-U_10iEwqwHt8";
  }
  if (!storageBucket) {
    storageBucket = "pearls-butik";
  }

  // Clean trailing slashes or rest/v1 if included
  if (url.endsWith("/rest/v1/")) {
    url = url.substring(0, url.length - 9);
  } else if (url.endsWith("/rest/v1")) {
    url = url.substring(0, url.length - 8);
  }

  return { url, anonKey, serviceRoleKey, storageBucket };
};

const config = getSupabaseConfig();

// 1. Export public client (Safe for frontend & backend)
export const supabase = createClient(config.url, config.anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: typeof window !== "undefined"
  }
});

// 2. Export admin client (STRICTLY for backend, throws on client if used)
export const getSupabaseAdmin = () => {
  if (typeof window !== "undefined") {
    throw new Error("getSupabaseAdmin() cannot be called on the client side.");
  }
  const cfg = getSupabaseConfig();
  if (!cfg.serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY is required for admin operations.");
  }
  return createClient(cfg.url, cfg.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
};

export const SUPABASE_STORAGE_BUCKET = config.storageBucket;
