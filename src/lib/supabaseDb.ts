import { getSupabaseAdmin } from "./supabase";

// Local cache for table existence checks to avoid redundant network requests
const tableCheckCache: Record<string, boolean> = {};

// Helper to check if a specific table exists in Supabase
async function tableExists(tableName: string): Promise<boolean> {
  if (tableCheckCache[tableName] !== undefined) {
    return tableCheckCache[tableName];
  }
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from(tableName)
      .select("*")
      .limit(1);
    
    // If table doesn't exist, PostgREST usually returns 404 or a specific error code
    if (error && (error.code === "PGRST116" || error.message.includes("does not exist") || error.code === "42P01")) {
      tableCheckCache[tableName] = false;
      return false;
    }
    tableCheckCache[tableName] = true;
    return true;
  } catch (e) {
    tableCheckCache[tableName] = false;
    return false;
  }
}

// Ensure the unified/fallback table "pearls_db" is ready to store backup documents
async function ensureFallbackTable(): Promise<void> {
  // If we can execute SQL, that's great, but since we cannot run arbitrary SQL, 
  // we will rely on Supabase's automatic schema or pre-existing setup.
  // If "pearls_db" doesn't exist, we will log instructions on how to create it.
}

export async function loadDatabaseState(targets: { key: string; target: any[] }[]): Promise<boolean> {
  console.log("Supabase: Restoring database state from Supabase PostgreSQL...");
  let success = false;
  const supabaseAdmin = getSupabaseAdmin();

  for (const col of targets) {
    try {
      // 1. Map Firestore collection key to table name (PostgreSQL conventions)
      const tableName = col.key.replace(/([A-Z])/g, "_$1").toLowerCase(); // e.g. academyUsers -> academy_users
      
      let items: any[] = [];
      let loaded = false;

      // Try specific table first if it exists
      if (await tableExists(tableName)) {
        console.log(`Supabase: Table '${tableName}' exists. Fetching rows...`);
        const { data, error } = await supabaseAdmin
          .from(tableName)
          .select("*");
        if (!error && data) {
          items = data.map(row => row.data || row);
          loaded = true;
          console.log(`Supabase: Restored '${col.key}' from table '${tableName}' (${items.length} rows).`);
        } else if (error) {
          console.warn(`Supabase: Error fetching from table '${tableName}':`, error.message);
        }
      }

      // 2. Fallback to unified pearls_db table if not loaded yet
      if (!loaded) {
        const fallbackExists = await tableExists("pearls_db");
        if (fallbackExists) {
          const { data, error } = await supabaseAdmin
            .from("pearls_db")
            .select("items")
            .eq("key", col.key)
            .single();
          
          if (!error && data && Array.isArray(data.items)) {
            items = data.items;
            loaded = true;
            console.log(`Supabase: Restored '${col.key}' from fallback 'pearls_db' table (${items.length} items).`);
          }
        }
      }

      if (loaded) {
        col.target.splice(0, col.target.length, ...items);
        success = true;
      } else {
        console.log(`Supabase: No records found for '${col.key}'. Using baseline.`);
      }
    } catch (err: any) {
      console.error(`Supabase: Error restoring table '${col.key}':`, err.message || err);
    }
  }

  return success;
}

export async function saveDatabaseState(collections: { key: string; data: any[] }[]): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  
  const savePromises = collections.map(async (col) => {
    try {
      const tableName = col.key.replace(/([A-Z])/g, "_$1").toLowerCase();
      let saved = false;

      // 1. Try to save to specific table first
      if (await tableExists(tableName)) {
        // Clear old rows to keep in-sync (since it's a full baseline override sync)
        await supabaseAdmin.from(tableName).delete().neq("id", "0_dummy_id_clear");

        if (col.data.length > 0) {
          // Format records to rows. If the table is structured as id & data jsonb, we can upsert easily
          const rows = col.data.map((item, idx) => {
            const itemId = item.id || item.email || item.userEmail || `id-${idx}-${Date.now()}`;
            return { id: itemId, data: item };
          });

          const { error } = await supabaseAdmin
            .from(tableName)
            .upsert(rows);
          
          if (!error) {
            saved = true;
            console.log(`Supabase: Successfully saved '${col.key}' to PostgreSQL table '${tableName}' (${col.data.length} rows).`);
          } else {
            console.warn(`Supabase: Failed to save to table '${tableName}', falling back:`, error.message);
          }
        } else {
          saved = true; // empty, cleared successfully
        }
      }

      // 2. Fallback to saving in the unified pearls_db table
      if (!saved) {
        if (await tableExists("pearls_db")) {
          const { error } = await supabaseAdmin
            .from("pearls_db")
            .upsert({
              key: col.key,
              items: col.data,
              updated_at: new Date().toISOString()
            }, { onConflict: "key" });
          
          if (!error) {
            console.log(`Supabase: Saved '${col.key}' to fallback 'pearls_db' table.`);
          } else {
            console.error(`Supabase: Failed to save '${col.key}' to fallback 'pearls_db':`, error.message);
          }
        } else {
          console.warn(`Supabase: Neither table '${tableName}' nor 'pearls_db' fallback table exists.`);
        }
      }
    } catch (err: any) {
      console.error(`Supabase: Error backup-saving '${col.key}':`, err.message || err);
    }
  });

  await Promise.all(savePromises);
}

export async function loadPaymentSettings(): Promise<any> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    if (await tableExists("payment_settings")) {
      const { data, error } = await supabaseAdmin
        .from("payment_settings")
        .select("*")
        .limit(1)
        .single();
      if (!error && data) {
        return data.data || data;
      }
    }
    
    if (await tableExists("pearls_db")) {
      const { data, error } = await supabaseAdmin
        .from("pearls_db")
        .select("items")
        .eq("key", "paymentSettings")
        .single();
      if (!error && data && data.items) {
        return data.items;
      }
    }
  } catch (err) {
    console.error("Supabase: Error loading payment settings:", err);
  }
  return null;
}

export async function savePaymentSettings(settings: any): Promise<void> {
  const supabaseAdmin = getSupabaseAdmin();
  try {
    let saved = false;

    if (await tableExists("payment_settings")) {
      const { error } = await supabaseAdmin
        .from("payment_settings")
        .upsert({ id: "paymentSettings", data: settings });
      if (!error) saved = true;
    }

    if (!saved && await tableExists("pearls_db")) {
      await supabaseAdmin
        .from("pearls_db")
        .upsert({
          key: "paymentSettings",
          items: settings,
          updated_at: new Date().toISOString()
        }, { onConflict: "key" });
    }
  } catch (err) {
    console.error("Supabase: Error saving payment settings:", err);
  }
}
