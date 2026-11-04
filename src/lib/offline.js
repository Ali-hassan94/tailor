// Offline-first data layer:
//  - read: internet ho to Supabase se lo + cache karo, warna cache dikhao
//  - write: internet ho to seedha Supabase, warna outbox mein save, online aate hi sync
import { openDB } from "idb";
import { supabase } from "./supabase";

const dbPromise = openDB("shan-tailor-offline", 2, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("cache")) db.createObjectStore("cache");
    if (!db.objectStoreNames.contains("outbox"))
      db.createObjectStore("outbox", { keyPath: "qid", autoIncrement: true });
    if (!db.objectStoreNames.contains("blobs")) db.createObjectStore("blobs");
  },
});

const PHOTO_BUCKET = "order-photos";

// Phone mein rakhi photos Supabase Storage par upload (retry-safe)
async function uploadBlobs(paths) {
  const db = await dbPromise;
  for (const path of paths) {
    const blob = await db.get("blobs", path);
    if (!blob) continue; // pehle upload ho chuki
    const { error } = await supabase.storage
      .from(PHOTO_BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", upsert: false });
    if (error && !/already exists|duplicate/i.test(error.message || "")) throw error;
    await db.delete("blobs", path);
  }
}

const toSnake = k => k.replace(/[A-Z]/g, c => "_" + c.toLowerCase());
const toCamel = k => k.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

export const toDb = obj =>
  Object.fromEntries(Object.entries(obj).map(([k, v]) => [toSnake(k), v]));

export const fromDb = row => {
  const o = {};
  for (const [k, v] of Object.entries(row)) o[toCamel(k)] = v;
  o._id = row.id; // purana UI _id use karta hai
  return o;
};

export const getCachedUser = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "null");
  } catch {
    return null;
  }
};

const isNetworkError = err =>
  !navigator.onLine ||
  /fetch|network|timeout|load failed|offline/i.test(err?.message || String(err));

async function applyOutbox(table, rows) {
  const db = await dbPromise;
  const items = (await db.getAll("outbox")).filter(i => i.table === table);
  let out = [...rows];
  for (const it of items) {
    if (it.op === "insert") {
      if (!out.some(r => r.id === it.id)) {
        out.unshift({
          status: "pending",
          ...fromDb(it.payload),
          createdAt: it.payload.created_at || new Date(it.ts).toISOString(),
          _pending: true,
        });
      }
    } else if (it.op === "update") {
      const patch = fromDb(it.payload);
      delete patch._id;
      out = out.map(r => (r.id === it.id ? { ...r, ...patch, _pending: true } : r));
    } else if (it.op === "delete") {
      out = out.filter(r => r.id !== it.id);
    }
  }
  return out;
}

export async function listTable(table) {
  const user = getCachedUser();
  const key = `${table}:${user?.id || "anon"}`;
  const db = await dbPromise;
  let rows;
  try {
    if (!navigator.onLine) throw new Error("offline");
    await syncOutbox();
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    rows = data.map(fromDb);
    await db.put("cache", rows, key);
  } catch {
    rows = (await db.get("cache", key)) || [];
  }
  return applyOutbox(table, rows);
}

async function enqueue(item) {
  const db = await dbPromise;
  await db.add("outbox", { ...item, ts: Date.now() });
}

// returns { queued: true } agar offline save hua
export async function insertRow(table, row, { photos = [] } = {}) {
  const user = getCachedUser();
  if (!user?.id) throw new Error("You must be logged in");
  const id = crypto.randomUUID();
  const db = await dbPromise;
  const paths = [];
  for (let i = 0; i < photos.length; i++) {
    const path = `${user.id}/${id}-${i}.jpg`;
    await db.put("blobs", photos[i], path);
    paths.push(path);
  }
  const payload = {
    id,
    user_id: user.id,
    ...toDb(row),
    ...(paths.length ? { photo_paths: paths } : {}),
  };
  if (navigator.onLine) {
    try {
      await uploadBlobs(paths);
      const { error } = await supabase.from(table).insert(payload);
      if (!error) return { queued: false };
      if (!isNetworkError(error)) throw new Error(error.message);
    } catch (err) {
      if (!isNetworkError(err)) {
        for (const p of paths) await db.delete("blobs", p);
        throw err;
      }
    }
  }
  await enqueue({ op: "insert", table, id, payload });
  return { queued: true };
}

export async function updateRow(table, id, patch) {
  const payload = toDb(patch);
  if (navigator.onLine) {
    const { error } = await supabase.from(table).update(payload).eq("id", id);
    if (!error) return { queued: false };
    if (!isNetworkError(error)) throw new Error(error.message);
  }
  await enqueue({ op: "update", table, id, payload });
  return { queued: true };
}

export async function deleteRow(table, id) {
  if (navigator.onLine) {
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (!error) return { queued: false };
    if (!isNetworkError(error)) throw new Error(error.message);
  }
  await enqueue({ op: "delete", table, id });
  return { queued: true };
}

let syncing = false;
export async function syncOutbox() {
  if (syncing || !navigator.onLine) return 0;
  const { data } = await supabase.auth.getSession();
  if (!data?.session) return 0; // login ke baghair sync nahi
  syncing = true;
  let done = 0;
  try {
    const db = await dbPromise;
    const items = await db.getAll("outbox");
    for (const it of items) {
      let error;
      if (it.op === "insert") {
        if (it.payload.photo_paths?.length) {
          try {
            await uploadBlobs(it.payload.photo_paths);
          } catch (e) {
            if (isNetworkError(e)) break;
            console.warn("Photo upload skipped:", e.message);
          }
        }
        ({ error } = await supabase
          .from(it.table)
          .upsert(it.payload, { onConflict: "id", ignoreDuplicates: true }));
      } else if (it.op === "update") {
        ({ error } = await supabase.from(it.table).update(it.payload).eq("id", it.id));
      } else {
        ({ error } = await supabase.from(it.table).delete().eq("id", it.id));
      }
      if (error) {
        if (isNetworkError(error)) break; // baad mein dobara try
        console.warn("Sync skipped (server rejected):", it, error.message);
      }
      await db.delete("outbox", it.qid);
      done++;
    }
  } finally {
    syncing = false;
  }
  return done;
}

export function startOfflineSync() {
  const run = async () => {
    try {
      if ((await syncOutbox()) > 0) window.dispatchEvent(new Event("tailor-synced"));
    } catch (e) {
      console.warn("sync error", e);
    }
  };
  window.addEventListener("online", run);
  setInterval(run, 30000);
  run();
}
