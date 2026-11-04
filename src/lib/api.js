import { supabase } from "./supabase";
import { listTable } from "./offline";

const friendly = err => {
  const m = err?.message || "";
  if (/database error saving new user/i.test(m)) return "Phone or email already exists";
  if (/already registered/i.test(m)) return "Email already exists";
  if (/fetch|network|load failed/i.test(m) || !navigator.onLine)
    return "Internet required (pehli dafa login/register ke liye)";
  return m || "Something went wrong";
};

export async function registerUser({ name, email, phone, password }) {
  const { error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
    options: { data: { name: name.trim(), phone: phone.trim() } },
  });
  if (error) throw new Error(friendly(error));
  await supabase.auth.signOut(); // purane flow ki tarah: register ke baad login
}

export async function loginUser({ email, password }) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });
  if (error) {
    throw new Error(
      /invalid login/i.test(error.message) ? "Invalid credentials" : friendly(error)
    );
  }
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", data.user.id)
    .maybeSingle();

  const user = {
    id: data.user.id,
    name: profile?.name || data.user.user_metadata?.name || "",
    email: data.user.email,
    phone: profile?.phone || data.user.user_metadata?.phone || "",
    role: profile?.role || "user",
  };
  localStorage.setItem("token", data.session.access_token);
  localStorage.setItem("user", JSON.stringify(user));
  localStorage.setItem("role", user.role);
  return user;
}

export async function logoutUser() {
  try {
    await supabase.auth.signOut();
  } catch {
    /* offline ho to bhi local logout */
  }
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  localStorage.removeItem("role");
}

export async function listDesigns() {
  let rows = [];
  try {
    rows = await listTable("designs");
  } catch {
    /* ignore */
  }
  if (rows.length) return rows;
  const res = await fetch(`${import.meta.env.BASE_URL}designs.json`);
  const json = await res.json();
  return json.map((d, i) => ({ ...d, _id: String(i) }));
}

// Role (user/tailor) Supabase se refresh: tailor banne ke baad dobara login ki zaroorat nahi
export async function refreshProfile() {
  try {
    if (!navigator.onLine) return;
    const { data } = await supabase.auth.getSession();
    const session = data?.session;
    if (!session) return;
    const cached = JSON.parse(localStorage.getItem("user") || "null");
    if (!cached) return;
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", session.user.id)
      .maybeSingle();
    if (!profile) return;
    const changedRole = cached.role !== profile.role;
    if (changedRole || cached.name !== profile.name || cached.phone !== profile.phone) {
      const user = { ...cached, name: profile.name, phone: profile.phone, role: profile.role };
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("role", user.role);
      if (changedRole) window.location.reload();
    }
  } catch {
    /* offline ya error: cached role chalta rahe */
  }
}
