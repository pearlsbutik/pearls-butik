import { getSupabaseAdmin } from "./supabase";

// Local cache for table existence checks to avoid redundant network requests
const tableCheckCache: Record<string, boolean> = {};

// Helper to check if a specific table exists in Supabase
export async function tableExists(tableName: string): Promise<boolean> {
  if (tableCheckCache[tableName] !== undefined) {
    return tableCheckCache[tableName];
  }
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { error } = await supabaseAdmin
      .from(tableName)
      .select("*")
      .limit(1);
    
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

// Maps client-side structures to standard PostgreSQL schema columns where appropriate
function mapToPostgresRow(tableName: string, item: any): any {
  // Common mapping helper
  const now = new Date().toISOString();
  
  if (tableName === "students") {
    return {
      id: item.id || `st-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: item.name || item.fullName || "",
      email: item.email || "",
      phone_number: item.phone || item.phoneNumber || "",
      whatsapp_number: item.whatsapp || item.whatsappNumber || item.phone || "",
      password_hash: item.passwordHash || "",
      city: item.city || "",
      state: item.state || "",
      date_of_birth: item.dob || item.dateOfBirth || "",
      gender: item.gender || "",
      profile_photo_url: item.avatar || item.profilePhotoUrl || "",
      referral_code: item.referralCode || "",
      is_verified: item.active === true || item.isVerified === true,
      created_at: item.createdAt || now,
      updated_at: item.updatedAt || now,
      last_login: item.lastLogin || now,
      account_status: item.active ? "active" : "inactive"
    };
  }

  if (tableName === "admins") {
    return {
      id: item.id || `ad-${Math.floor(1000 + Math.random() * 9000)}`,
      full_name: item.name || "",
      email: item.email || "",
      phone_number: item.phone || "",
      password_hash: item.passwordHash || "",
      created_at: item.createdAt || now,
      updated_at: item.updatedAt || now
    };
  }

  // Fallback / simple mappings
  return {
    id: item.id || item.email || `id-${Math.floor(Math.random() * 1000000)}`,
    data: item
  };
}

export async function loadDatabaseState(targets: { key: string; target: any[] }[]): Promise<boolean> {
  console.log("Supabase: Restoring database state from Supabase PostgreSQL...");
  let success = false;
  const supabaseAdmin = getSupabaseAdmin();

  for (const col of targets) {
    try {
      // 1. Map key to table name (PostgreSQL conventions)
      const tableName = col.key.replace(/([A-Z])/g, "_$1").toLowerCase(); // e.g. academyUsers -> academy_users
      
      let items: any[] = [];
      let loaded = false;

      // Special mapping for students/admins to split up academyUsers
      if (col.key === "academyUsers") {
        const hasStudentsTable = await tableExists("students");
        const hasAdminsTable = await tableExists("admins");
        const hasUsersTable = await tableExists("academy_users");

        if (hasStudentsTable || hasAdminsTable) {
          let students: any[] = [];
          let admins: any[] = [];

          if (hasStudentsTable) {
            const { data, error } = await supabaseAdmin.from("students").select("*");
            if (!error && data) {
              students = data.map(row => ({
                id: row.id,
                name: row.full_name,
                email: row.email,
                phone: row.phone_number,
                whatsapp: row.whatsapp_number,
                passwordHash: row.password_hash,
                city: row.city,
                state: row.state,
                dob: row.date_of_birth,
                gender: row.gender,
                avatar: row.profile_photo_url,
                referralCode: row.referral_code,
                active: row.is_verified || row.account_status === "active",
                role: "Student",
                studentId: row.id.startsWith("PE") ? row.id : `PE-2026-${row.id.replace(/\D/g, '').substring(0, 4) || '1001'}`
              }));
              console.log(`Supabase: Restored ${students.length} students from 'students' table.`);
            }
          }

          if (hasAdminsTable) {
            const { data, error } = await supabaseAdmin.from("admins").select("*");
            if (!error && data) {
              admins = data.map(row => ({
                id: row.id,
                name: row.full_name,
                email: row.email,
                phone: row.phone_number,
                passwordHash: row.password_hash,
                role: "Admin",
                active: true,
                studentId: "PE-ADMIN-01"
              }));
              console.log(`Supabase: Restored ${admins.length} admins from 'admins' table.`);
            }
          }

          items = [...admins, ...students];
          if (items.length > 0) {
            loaded = true;
          }
        }
      }

      // Try specific table first if it exists
      if (!loaded && await tableExists(tableName)) {
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

      // 1. Special handling to split up academyUsers into explicit students/admins tables
      if (col.key === "academyUsers") {
        const hasStudentsTable = await tableExists("students");
        const hasAdminsTable = await tableExists("admins");

        if (hasStudentsTable || hasAdminsTable) {
          const students = col.data.filter(u => u.role === "Student");
          const admins = col.data.filter(u => u.role === "Admin");

          if (hasStudentsTable && students.length > 0) {
            const mappedStudents = students.map(s => mapToPostgresRow("students", s));
            const { error } = await supabaseAdmin.from("students").upsert(mappedStudents);
            if (!error) {
              console.log(`Supabase: Saved ${students.length} students directly to 'students' table.`);
              saved = true;
            } else {
              console.warn("Supabase: Error saving to 'students' table, falling back:", error.message);
            }
          }

          if (hasAdminsTable && admins.length > 0) {
            const mappedAdmins = admins.map(a => mapToPostgresRow("admins", a));
            const { error } = await supabaseAdmin.from("admins").upsert(mappedAdmins);
            if (!error) {
              console.log(`Supabase: Saved ${admins.length} admins directly to 'admins' table.`);
              saved = true;
            } else {
              console.warn("Supabase: Error saving to 'admins' table, falling back:", error.message);
            }
          }
        }
      }

      // Try specific table if it exists
      if (!saved && await tableExists(tableName)) {
        await supabaseAdmin.from(tableName).delete().neq("id", "0_dummy_id_clear");

        if (col.data.length > 0) {
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
          saved = true;
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
