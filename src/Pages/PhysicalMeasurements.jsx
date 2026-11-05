import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { listTable, insertRow, updateRow, deleteRow } from "../lib/offline";
import { compressImage } from "../lib/image";
import { confirmDialog } from "../lib/confirm";

const TABLE = "physical_measurements";
const BUCKET = "physical-photos";

const MEAS = [
  ["kameezLength", "Kameez Length", "کمیض لمبائی"],
  ["chest", "Chest", "سینہ"],
  ["waist", "Waist", "کمر"],
  ["hips", "Hips", "کولہے"],
  ["shoulders", "Shoulders", "کندھے"],
  ["sleeves", "Sleeves", "آستین"],
  ["armhole", "Armhole", "آرم ہول"],
  ["cuff", "Cuff", "کف"],
  ["neck", "Neck", "گلا"],
  ["shalwarLength", "Shalwar Length", "شلوار لمبائی"],
  ["pancha", "Pancha", "پانچا"],
  ["belt", "Belt", "کمربند"],
  ["ghera", "Ghera", "گیرا"],
];

const emptyForm = {
  id: null,
  name: "",
  phone: "",
  address: "",
  service: "",
  designType: "Single Silai",
  garaType: "Gola",
  startDate: "",
  endDate: "",
  ...Object.fromEntries(MEAS.map(([k]) => [k, ""])),
  notes: "",
};

const fmtDate = d => (d ? new Date(d).toLocaleDateString() : "-");
const waNumber = p => {
  let d = (p || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "92" + d.slice(1);
  return d;
};

const SignedPhotos = ({ paths }) => {
  const [urls, setUrls] = useState([]);
  const [zoom, setZoom] = useState("");
  const key = (paths || []).join("|");

  useEffect(() => {
    let alive = true;
    if (!paths?.length || !navigator.onLine) {
      setUrls([]);
      return undefined;
    }
    supabase.storage
      .from(BUCKET)
      .createSignedUrls(paths, 3600)
      .then(({ data }) => {
        if (alive && data) setUrls(data.map(d => d.signedUrl).filter(Boolean));
      });
    return () => {
      alive = false;
    };
  }, [key]);

  if (!paths?.length) return null;
  return (
    <div className="mt-3">
      <div className="text-sm text-gray-600 mb-1">Cloth photos ({paths.length})</div>
      {urls.length ? (
        <div className="flex gap-2 flex-wrap">
          {urls.map((u, i) => (
            <img
              key={i}
              src={u}
              alt="cloth"
              onClick={() => setZoom(u)}
              className="w-20 h-20 object-cover rounded-lg border cursor-pointer"
            />
          ))}
        </div>
      ) : (
        <div className="text-xs text-gray-500">Photos dekhne ke liye internet chahiye</div>
      )}
      {zoom && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setZoom("")}
        >
          <img src={zoom} alt="" className="max-h-[85vh] max-w-full rounded-lg" />
        </div>
      )}
    </div>
  );
};

export default function PhysicalMeasurements() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const isTailor = ["tailor", "admin"].includes(user?.role);

  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [photos, setPhotos] = useState([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await listTable(TABLE));
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!user) return undefined;
    load();
    window.addEventListener("tailor-synced", load);
    window.addEventListener("online", load);
    return () => {
      window.removeEventListener("tailor-synced", load);
      window.removeEventListener("online", load);
    };
  }, [load]); // eslint-disable-line react-hooks/exhaustive-deps

  const filtered = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return rows;
    return rows.filter(r =>
      [r.name, r.phone, r.clientNumber, r.service, r.address]
        .join(" ")
        .toLowerCase()
        .includes(s)
    );
  }, [rows, search]);

  const ch = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const pickPhotos = e => {
    const files = [...(e.target.files || [])];
    const room = Math.max(0, 4 - photos.length);
    if (files.length > room) toast.error("Maximum 4 photos");
    const add = files.slice(0, room).map(f => ({ file: f, url: URL.createObjectURL(f) }));
    setPhotos(p => [...p, ...add]);
    e.target.value = "";
  };

  const edit = r => {
    const f = { id: r.id };
    Object.keys(emptyForm).forEach(k => {
      if (k !== "id") f[k] = r[k] ?? "";
    });
    setForm(f);
    setPhotos([]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const save = async e => {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Name aur phone zaroori hain");
      return;
    }
    setBusy(true);
    try {
      const { id, ...rest } = form;
      const clean = Object.fromEntries(
        Object.entries(rest).map(([k, v]) => [k, typeof v === "string" && v.trim() === "" ? null : v])
      );
      if (id) {
        await updateRow(TABLE, id, { ...clean, updatedAt: new Date().toISOString() });
        toast.success("Updated");
      } else {
        const blobs = await Promise.all(photos.map(p => compressImage(p.file, 1280, 0.75)));
        const r = await insertRow(TABLE, clean, { photos: blobs, bucket: BUCKET });
        toast.success(r.queued ? "Offline: saved, internet aate hi sync hoga" : "Saved");
      }
      setForm(emptyForm);
      setPhotos([]);
      load();
    } catch (err) {
      toast.error(err.message || "Save failed (SQL update_v6 run kiya?)");
    }
    setBusy(false);
  };

  const remove = async r => {
    if (!(await confirmDialog(`"${r.name}" ka record aur uski photos delete ho jayengi. Ye wapas nahi ho sakta.`, { title: "Customer delete karna hai?" }))) return;
    try {
      const res = await deleteRow(TABLE, r.id);
      if (!res.queued && r.photoPaths?.length) {
        await supabase.storage.from(BUCKET).remove(r.photoPaths);
      }
      load();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  if (!user) {
    return (
      <section className="min-h-screen pt-28 px-6 text-center bg-gray-100">
        <p className="text-lg mb-3">Physical measurements dekhne ke liye pehle login karein.</p>
        <Link to="/login" className="underline text-red-600">
          Login
        </Link>
      </section>
    );
  }

  const inputCls = "border rounded-lg px-3 py-2 w-full bg-white";

  return (
    <section className="min-h-screen bg-gray-100 pt-24 px-4 pb-12">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold mb-1">
          {isTailor ? "Physical Client Measurements" : "My Physical Measurements"}
        </h2>
        <p className="text-gray-600 mb-5 text-sm">
          {isTailor
            ? "Dukaan par aane wale customers ka data yahan save karein. Ye online orders se alag hai."
            : "Dukaan par tailor ne jo measurements save ki hain, wo aapke phone number se yahan nazar aati hain."}
        </p>

        {isTailor && (
          <form onSubmit={save} className="bg-white rounded-xl shadow p-4 mb-8 flex flex-col gap-3">
            <div className="font-semibold">{form.id ? "Record edit karein" : "Naya customer"}</div>
            <div className="grid md:grid-cols-2 gap-3">
              <input name="name" value={form.name} onChange={ch} placeholder="Name (نام) *" className={inputCls} />
              <input name="phone" value={form.phone} onChange={ch} placeholder="Phone (فون) *" className={inputCls} />
              <input name="address" value={form.address} onChange={ch} placeholder="Address (پتہ)" className={inputCls} />
              <input name="service" value={form.service} onChange={ch} placeholder="Service (سروس)" className={inputCls} />
              <select name="designType" value={form.designType} onChange={ch} className={inputCls}>
                <option>Single Silai</option>
                <option>Double Silai</option>
                <option>Design</option>
                <option>Other</option>
              </select>
              <select name="garaType" value={form.garaType} onChange={ch} className={inputCls}>
                <option>Gola</option>
                <option>Chorus</option>
                <option>Other</option>
              </select>
              <div>
                <label className="text-sm text-gray-600">Start date</label>
                <input type="date" name="startDate" value={form.startDate} onChange={ch} className={inputCls} />
              </div>
              <div>
                <label className="text-sm text-gray-600">End date</label>
                <input type="date" name="endDate" value={form.endDate} onChange={ch} className={inputCls} />
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {MEAS.map(([k, en, ur]) => (
                <input key={k} name={k} value={form[k]} onChange={ch} placeholder={`${en} (${ur})`} className={inputCls} />
              ))}
            </div>

            <textarea name="notes" value={form.notes} onChange={ch} rows={2} placeholder="Notes (نوٹس)" className={inputCls} />

            {!form.id && (
              <div>
                <label className="font-semibold text-sm">Kapre ki photos (optional, max 4)</label>
                <input type="file" accept="image/*" multiple onChange={pickPhotos} className="block w-full mt-1 text-sm" />
                {photos.length > 0 && (
                  <div className="flex gap-2 mt-2 flex-wrap">
                    {photos.map((p, i) => (
                      <div key={i} className="relative">
                        <img src={p.url} alt="selected" className="w-20 h-20 object-cover rounded-lg border" />
                        <button
                          type="button"
                          onClick={() => setPhotos(list => list.filter((_, k) => k !== i))}
                          className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={busy}
                className="flex-1 bg-red-600 text-white rounded-lg py-3 font-semibold disabled:opacity-60"
              >
                {busy ? "Saving..." : form.id ? "Update" : "Save customer"}
              </button>
              {form.id && (
                <button
                  type="button"
                  onClick={() => setForm(emptyForm)}
                  className="px-5 border rounded-lg"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        )}

        <div className="flex items-center gap-3 mb-4">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search name, phone, client number..."
            className="border rounded-lg px-3 py-2 w-full sm:w-80 bg-white"
          />
          <span className="text-sm text-gray-600 whitespace-nowrap">{filtered.length} records</span>
        </div>

        {filtered.length === 0 && (
          <p className="text-gray-500">
            {isTailor
              ? "Abhi koi record nahi."
              : "Abhi aapke number par koi record nahi. Profile/Register mein wahi phone number hona chahiye jo dukaan par diya tha."}
          </p>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map(r => (
            <div key={r.id} className="bg-white rounded-xl shadow p-4 border-l-4 border-red-600">
              <div className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-lg">{r.name}</div>
                  <div className="text-xs text-gray-500">
                    {r.clientNumber ? `Client #${r.clientNumber} · ` : ""}
                    {fmtDate(r.createdAt)}
                    {r._pending ? " · Syncing…" : ""}
                  </div>
                </div>
                <div className="text-sm font-semibold">{r.phone}</div>
              </div>

              <div className="text-sm mt-2 space-y-0.5">
                {r.address && <div><span className="text-gray-500">Address:</span> {r.address}</div>}
                {r.service && <div><span className="text-gray-500">Service:</span> {r.service}</div>}
                <div>
                  <span className="text-gray-500">Style:</span> {r.designType || "-"} / {r.garaType || "-"}
                </div>
                {(r.startDate || r.endDate) && (
                  <div>
                    <span className="text-gray-500">Dates:</span> {fmtDate(r.startDate)} → {fmtDate(r.endDate)}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-x-4 mt-3 text-sm">
                {MEAS.filter(([k]) => r[k]).map(([k, en]) => (
                  <div key={k} className="flex justify-between border-b py-0.5">
                    <span className="text-gray-500">{en}</span>
                    <span className="font-medium">{r[k]}</span>
                  </div>
                ))}
              </div>
              {r.notes && <div className="mt-2 text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-2">{r.notes}</div>}

              <SignedPhotos paths={r.photoPaths} />

              {isTailor && (
                <>
                  <div className="flex gap-2 mt-3">
                    <a href={`tel:${r.phone}`} className="flex-1 text-center bg-gray-800 text-white rounded-lg py-2 text-sm">
                      📞 Call
                    </a>
                    <a
                      href={`https://wa.me/${waNumber(r.phone)}`}
                      target="_blank"
                      rel="noreferrer"
                      className="flex-1 text-center bg-green-600 text-white rounded-lg py-2 text-sm"
                    >
                      💬 WhatsApp
                    </a>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => edit(r)} className="flex-1 border rounded-lg py-2 text-sm">
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => remove(r)}
                      className="flex-1 text-red-600 border border-red-300 rounded-lg py-2 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
