import React, { useState, useEffect, useRef } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import toast, { Toaster } from "react-hot-toast";

const DB_NAME = "TailorDB";
const STORE_NAME = "measurements";
const DB_VERSION = 1;

function openDatabase() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, {
          keyPath: "id",
          autoIncrement: true,
        });
        store.createIndex("clientNumber", "clientNumber", { unique: true });
        store.createIndex("phone", "phone", { unique: false });
        store.createIndex("name", "name", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function promisifyRequest(req) {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function getAllItems(db) {
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  const req = store.getAll();
  return promisifyRequest(req);
}

async function addItem(db, item) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const toAdd = { ...item };
  delete toAdd.id;
  const req = store.add(toAdd);
  await promisifyRequest(req);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function putItem(db, item) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const req = store.put(item);
  await promisifyRequest(req);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function deleteItem(db, id) {
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  const req = store.delete(id);
  await promisifyRequest(req);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

async function getNextClientNumber(db) {
  const all = await getAllItems(db);
  if (!all || all.length === 0) return 1;
  const max = all.reduce(
    (m, it) =>
      it.clientNumber && Number(it.clientNumber) > m
        ? Number(it.clientNumber)
        : m,
    0
  );
  return max + 1;
}

const placeholder = (eng, urdu) => `${eng} (${urdu})`;

const emptyForm = {
  id: null,
  clientNumber: "",
  name: "",
  phone: "",
  address: "",
  service: "",
  designType: "Single Silai",
  garaType: "Gola",
  startDate: "",
  endDate: "",
  chest: "",
  waist: "",
  hips: "",
  shoulders: "",
  kameezLength: "",
  sleeves: "",
  cuff: "",
  neck: "",
  armhole: "",
  shalwarLength: "",
  pancha: "",
  belt: "",
  ghera: "",
  notes: "",
  createdAt: null,
  updatedAt: null,
};

export default function PhysicalMeasurements() {
  const [db, setDb] = useState(null);
  const [measurements, setMeasurements] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(false);

  // Admin password
  const defaultPass = "1234";
  const storedPass = localStorage.getItem("adminPass") || defaultPass;
  const [adminPass, setAdminPass] = useState(storedPass);
  const [password, setPassword] = useState("");
  // const passOK = password === adminPass;
  const backupPass = "9090"; // secondary fixed password
  const passOK = password === adminPass || password === backupPass;

  // Password change fields
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");

  useEffect(() => {
    mountedRef.current = true;

    // init AOS for animations
    AOS.init({
      duration: 550,
      once: true,
      easing: "ease-out-cubic",
      mirror: false,
    });

    (async () => {
      try {
        const _db = await openDatabase();
        setDb(_db);
        const all = await getAllItems(_db);
        const normalized = all.map(a => ({
          ...a,
          createdAt: a.createdAt || new Date().toISOString(),
        }));
        setMeasurements(normalized);
        // refresh AOS after data load so animate on scroll works
        setTimeout(() => AOS.refresh(), 100);
      } catch (err) {
        console.error("IndexedDB init error", err);
        toast.error("IndexedDB init error: check browser permissions");
      } finally {
        setLoading(false);
      }
    })();

    return () => {
      mountedRef.current = false;
    };
  }, []);

  const loadAll = async () => {
    if (!db) return;
    const all = await getAllItems(db);
    setMeasurements(all);
    setTimeout(() => AOS.refresh(), 50);
  };

  const clearForm = () => setForm(emptyForm);

  const handleEdit = item => {
    if (!passOK) return;
    setForm({ ...emptyForm, ...item });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async id => {
    if (!passOK) return;
    if (!confirm("Are you sure you want to delete this record?")) return;
    try {
      await deleteItem(db, id);
      await loadAll();
    } catch (err) {
      console.error(err);
      toast.error("Delete failed");
    }
  };

  const handleSave = async e => {
    e.preventDefault();
    if (!passOK) return toast.error("Password incorrect");
    if (!db) return toast.error("DB not ready");
    if (!form.name.trim() || !form.phone.trim())
      return toast.error("Name and phone are required");

    try {
      if (form.id) {
        const updated = { ...form, updatedAt: new Date().toISOString() };
        await putItem(db, updated);
      } else {
        const clientNumber = await getNextClientNumber(db);
        const toAdd = {
          ...form,
          clientNumber,
          createdAt: new Date().toISOString(),
        };
        delete toAdd.id;
        await addItem(db, toAdd);
      }
      await loadAll();
      setForm(emptyForm);
      setTimeout(() => AOS.refresh(), 80);
    } catch (err) {
      console.error("Save error", err);
      toast.error("Save failed: " + (err?.message || err));
    }
  };

  const handleChangePassword = () => {
    if (!newPass.trim()) return toast.error("Enter new password");
    if (newPass !== confirmPass) return toast.error("Passwords do not match");
    localStorage.setItem("adminPass", newPass);
    setAdminPass(newPass);
    setNewPass("");
    setConfirmPass("");
    toast.success("Password changed successfully");
  };

  const filtered = measurements
    .slice()
    .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    .filter(m => {
      if (!search) return true;
      const s = search.trim().toLowerCase();
      if (/^\d+$/.test(s))
        return (
          String(m.clientNumber || "").includes(s) ||
          String(m.phone || "").includes(s)
        );
      return Object.values(m).join(" ").toLowerCase().includes(s);
    });

  return (
    // overall page root fixes mobile scrolling and applies gradient theme
    <div className="min-h-screen  w-full overflow-x-hidden bg-gradient-to-br from-red-600 via-white to-black">
      <div className="max-w-6xl mx-auto mt-25 p-4">
        <div className="mb-6" data-aos="fade-down">
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter password"
            className="border-2 px-3 py-2 rounded w-full sm:w-64"
          />
          {!passOK && password.length > 0 && (
            <div className="text-red-600 text-sm mt-1">Wrong password</div>
          )}
        </div>

        <h2
          className="text-3xl font-bold mb-4 text-white"
          data-aos="fade-right"
          data-aos-delay="50"
        >
          Physical Client Measurements
        </h2>

        {passOK && (
          <>
            <form
              onSubmit={handleSave}
              className="bg-white p-4 rounded shadow mb-6"
              data-aos="fade-up"
              data-aos-delay="80"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="font-medium text-sm">Client Number</label>
                  <input
                    type="text"
                    value={form.clientNumber || ""}
                    readOnly
                    placeholder="Auto assigned"
                    className="w-full border px-3 py-2 rounded bg-gray-100"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm">Name</label>
                  <input
                    required
                    type="text"
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                    placeholder={placeholder("Name", "نام")}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
                <div>
                  <label className="font-medium text-sm">Phone</label>
                  <input
                    required
                    type="text"
                    value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    placeholder={placeholder("Phone", "فون")}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div className="md:col-span-3">
                  <label className="font-medium text-sm">Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={e =>
                      setForm({ ...form, address: e.target.value })
                    }
                    placeholder={placeholder("Address", "پتہ")}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-sm">Service</label>
                  <input
                    type="text"
                    value={form.service}
                    onChange={e =>
                      setForm({ ...form, service: e.target.value })
                    }
                    placeholder={placeholder("Service", "سروس")}
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-sm">Design Type</label>
                  <select
                    value={form.designType}
                    onChange={e =>
                      setForm({ ...form, designType: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option>Single Silai</option>
                    <option>Double Silai</option>
                    <option>Design</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-sm">Gara Type</label>
                  <select
                    value={form.garaType}
                    onChange={e =>
                      setForm({ ...form, garaType: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  >
                    <option>Gola</option>
                    <option>Chorus</option>
                    <option>Other</option>
                  </select>
                </div>

                <div>
                  <label className="font-medium text-sm">Start Date</label>
                  <input
                    type="date"
                    value={form.startDate}
                    onChange={e =>
                      setForm({ ...form, startDate: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>

                <div>
                  <label className="font-medium text-sm">End Date</label>
                  <input
                    type="date"
                    value={form.endDate}
                    onChange={e =>
                      setForm({ ...form, endDate: e.target.value })
                    }
                    className="w-full border px-3 py-2 rounded"
                  />
                </div>
              </div>

              <h3 className="font-semibold mt-4 text-gray-700">Kameez</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <input
                  type="text"
                  value={form.kameezLength}
                  onChange={e =>
                    setForm({ ...form, kameezLength: e.target.value })
                  }
                  placeholder={placeholder("Kameez Length", "کمیض لمبائی")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.chest}
                  onChange={e => setForm({ ...form, chest: e.target.value })}
                  placeholder={placeholder("Chest", "سینہ")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.waist}
                  onChange={e => setForm({ ...form, waist: e.target.value })}
                  placeholder={placeholder("Waist", "کمر")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.hips}
                  onChange={e => setForm({ ...form, hips: e.target.value })}
                  placeholder={placeholder("Hips", "کولہے")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.shoulders}
                  onChange={e =>
                    setForm({ ...form, shoulders: e.target.value })
                  }
                  placeholder={placeholder("Shoulders", "کندھے")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.sleeves}
                  onChange={e => setForm({ ...form, sleeves: e.target.value })}
                  placeholder={placeholder("Sleeves", "آستین")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.armhole}
                  onChange={e => setForm({ ...form, armhole: e.target.value })}
                  placeholder={placeholder("Armhole", "آرم ہول")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.cuff}
                  onChange={e => setForm({ ...form, cuff: e.target.value })}
                  placeholder={placeholder("Cuff", "کف")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.neck}
                  onChange={e => setForm({ ...form, neck: e.target.value })}
                  placeholder={placeholder("Neck", "گلا")}
                  className="border px-3 py-2 rounded"
                />
              </div>

              <h3 className="font-semibold mt-4 text-gray-700">Shalwar</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
                <input
                  type="text"
                  value={form.shalwarLength}
                  onChange={e =>
                    setForm({ ...form, shalwarLength: e.target.value })
                  }
                  placeholder={placeholder("Shalwar Length", "شلوار لمبائی")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.pancha}
                  onChange={e => setForm({ ...form, pancha: e.target.value })}
                  placeholder={placeholder("Pancha", "پانچا")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.belt}
                  onChange={e => setForm({ ...form, belt: e.target.value })}
                  placeholder={placeholder("Belt", "کمربند")}
                  className="border px-3 py-2 rounded"
                />
                <input
                  type="text"
                  value={form.ghera}
                  onChange={e => setForm({ ...form, ghera: e.target.value })}
                  placeholder={placeholder("Ghera", "گیرا")}
                  className="border px-3 py-2 rounded"
                />
              </div>

              <div className="mt-4">
                <label className="font-medium text-sm">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder={placeholder("Notes", "نوٹس")}
                  className="w-full border px-3 py-2 rounded"
                />
              </div>

              <div className="mt-4 flex gap-2">
                <button
                  type="submit"
                  className="bg-red-700 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
                  data-aos="zoom-in"
                >
                  {form.id ? "Update" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={clearForm}
                  className="bg-gray-200 px-4 py-2 rounded shadow hover:opacity-90"
                  data-aos="zoom-in"
                  data-aos-delay="60"
                >
                  Clear
                </button>
              </div>
            </form>

            <div
              className="mt-6 p-4 border rounded bg-white shadow"
              data-aos="fade-left"
              data-aos-delay="120"
            >
              <h3 className="font-semibold mb-2">Change Admin Password</h3>
              <input
                type="password"
                value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder="New password"
                className="border px-3 py-2 rounded mb-2 w-full"
              />
              <input
                type="password"
                value={confirmPass}
                onChange={e => setConfirmPass(e.target.value)}
                placeholder="Confirm password"
                className="border px-3 py-2 rounded mb-2 w-full"
              />
              <button
                onClick={handleChangePassword}
                className="bg-black text-white px-4 py-2 rounded"
              >
                Change Password
              </button>
            </div>
          </>
        )}

        <div
          className="mb-4 flex gap-3 items-center mt-6"
          data-aos="fade-up"
          data-aos-delay="40"
        >
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, phone, client number, service, design..."
            className="border px-3 py-2 rounded flex-1"
          />
          <div className="text-sm text-gray-600">
            Tip: type numbers to search client number or phone
          </div>
        </div>

        <div
          className="overflow-x-auto bg-white rounded shadow"
          data-aos="fade-up"
          data-aos-delay="60"
        >
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gradient-to-br from-red-600 via-white to-black text-white">
              <tr>
                <th className="border border-gray-300 px-2 py-1">#</th>
                <th className="border border-gray-300 px-2 py-1">
                  ClientNo
                  <br />
                  <span className="text-xs">کلائنٹ نمبر</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Name
                  <br />
                  <span className="text-xs">نام</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Phone
                  <br />
                  <span className="text-xs">فون</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Address
                  <br />
                  <span className="text-xs">پتہ</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Service
                  <br />
                  <span className="text-xs">سروس</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Design
                  <br />
                  <span className="text-xs">ڈیزائن</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Gara
                  <br />
                  <span className="text-xs">گارہ</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Kameez(L)
                  <br />
                  <span className="text-xs">کمیض لمبائی</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Chest
                  <br />
                  <span className="text-xs">سینہ</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Waist
                  <br />
                  <span className="text-xs">کمر</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Hips
                  <br />
                  <span className="text-xs">کولہے</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Shoulders
                  <br />
                  <span className="text-xs">کندھے</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Sleeves
                  <br />
                  <span className="text-xs">آستین</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Armhole
                  <br />
                  <span className="text-xs">آرم ہول</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Cuff
                  <br />
                  <span className="text-xs">کف</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Neck
                  <br />
                  <span className="text-xs">گلا</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Shalwar(L)
                  <br />
                  <span className="text-xs">شلوار لمبائی</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Pancha
                  <br />
                  <span className="text-xs">پانچا</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Belt
                  <br />
                  <span className="text-xs">کمربند</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Ghera
                  <br />
                  <span className="text-xs">گیرا</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Start
                  <br />
                  <span className="text-xs">شروع</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  End
                  <br />
                  <span className="text-xs">اختتام</span>
                </th>
                <th className="border border-gray-300 px-2 py-1">
                  Notes
                  <br />
                  <span className="text-xs">نوٹس</span>
                </th>
                {passOK && (
                  <th className="border border-gray-300 px-2 py-1">Actions</th>
                )}
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan="25"
                    className="border border-gray-300 p-2 text-center"
                  >
                    Loading...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="25"
                    className="border border-gray-300 p-2 text-center"
                  >
                    No records
                  </td>
                </tr>
              ) : (
                filtered.map((m, idx) => {
                  const aosDelay = 80 + (idx % 10) * 20;
                  return (
                    <tr
                      key={m.id ?? idx}
                      className="border border-gray-300"
                      data-aos="fade-up"
                      data-aos-delay={aosDelay}
                    >
                      <td className="border border-gray-300 px-2 py-1">
                        {idx + 1}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.clientNumber}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.name}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.phone}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.address || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.service || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.designType || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.garaType || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.kameezLength || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.chest || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.waist || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.hips || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.shoulders || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.sleeves || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.armhole || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.cuff || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.neck || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.shalwarLength || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.pancha || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.belt || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.ghera || "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.startDate
                          ? new Date(m.startDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.endDate
                          ? new Date(m.endDate).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="border border-gray-300 px-2 py-1">
                        {m.notes || "-"}
                      </td>
                      {passOK && (
                        <td className="border border-gray-300 px-2 py-1 flex gap-2">
                          <button
                            onClick={() => handleEdit(m)}
                            className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:scale-105 transition-transform"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m.id)}
                            className="bg-red-700 text-white px-2 py-1 rounded text-sm hover:opacity-90"
                          >
                            Delete
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// import React, { useState, useEffect, useRef } from "react";
// import AOS from "aos";
// import "aos/dist/aos.css";
// import toast, { Toaster } from "react-hot-toast";

// const DB_NAME = "TailorDB";
// const STORE_NAME = "measurements";
// const DB_VERSION = 1;

// function openDatabase() {
//   return new Promise((resolve, reject) => {
//     const req = indexedDB.open(DB_NAME, DB_VERSION);
//     req.onupgradeneeded = () => {
//       const db = req.result;
//       if (!db.objectStoreNames.contains(STORE_NAME)) {
//         const store = db.createObjectStore(STORE_NAME, {
//           keyPath: "id",
//           autoIncrement: true,
//         });
//         store.createIndex("clientNumber", "clientNumber", { unique: true });
//         store.createIndex("phone", "phone", { unique: false });
//         store.createIndex("name", "name", { unique: false });
//       }
//     };
//     req.onsuccess = () => resolve(req.result);
//     req.onerror = () => reject(req.error);
//   });
// }

// function promisifyRequest(req) {
//   return new Promise((resolve, reject) => {
//     req.onsuccess = () => resolve(req.result);
//     req.onerror = () => reject(req.error);
//   });
// }

// async function getAllItems(db) {
//   const tx = db.transaction(STORE_NAME, "readonly");
//   const store = tx.objectStore(STORE_NAME);
//   const req = store.getAll();
//   return promisifyRequest(req);
// }

// async function addItem(db, item) {
//   const tx = db.transaction(STORE_NAME, "readwrite");
//   const store = tx.objectStore(STORE_NAME);
//   const toAdd = { ...item };
//   delete toAdd.id;
//   const req = store.add(toAdd);
//   await promisifyRequest(req);
//   return new Promise((resolve, reject) => {
//     tx.oncomplete = () => resolve();
//     tx.onerror = () => reject(tx.error);
//     tx.onabort = () => reject(tx.error);
//   });
// }

// async function putItem(db, item) {
//   const tx = db.transaction(STORE_NAME, "readwrite");
//   const store = tx.objectStore(STORE_NAME);
//   const req = store.put(item);
//   await promisifyRequest(req);
//   return new Promise((resolve, reject) => {
//     tx.oncomplete = () => resolve();
//     tx.onerror = () => reject(tx.error);
//     tx.onabort = () => reject(tx.error);
//   });
// }

// async function deleteItem(db, id) {
//   const tx = db.transaction(STORE_NAME, "readwrite");
//   const store = tx.objectStore(STORE_NAME);
//   const req = store.delete(id);
//   await promisifyRequest(req);
//   return new Promise((resolve, reject) => {
//     tx.oncomplete = () => resolve();
//     tx.onerror = () => reject(tx.error);
//     tx.onabort = () => reject(tx.error);
//   });
// }

// async function getNextClientNumber(db) {
//   const all = await getAllItems(db);
//   if (!all || all.length === 0) return 1;
//   const max = all.reduce(
//     (m, it) =>
//       it.clientNumber && Number(it.clientNumber) > m
//         ? Number(it.clientNumber)
//         : m,
//     0
//   );
//   return max + 1;
// }

// const placeholder = (eng, urdu) => `${eng} (${urdu})`;

// const emptyForm = {
//   id: null,
//   clientNumber: "",
//   name: "",
//   phone: "",
//   address: "",
//   service: "",
//   designType: "Single Silai",
//   garaType: "Gola",
//   startDate: "",
//   endDate: "",
//   chest: "",
//   waist: "",
//   hips: "",
//   shoulders: "",
//   kameezLength: "",
//   sleeves: "",
//   cuff: "",
//   neck: "",
//   armhole: "",
//   shalwarLength: "",
//   pancha: "",
//   belt: "",
//   ghera: "",
//   notes: "",
//   createdAt: null,
//   updatedAt: null,
// };

// export default function PhysicalMeasurements() {
//   const [db, setDb] = useState(null);
//   const [measurements, setMeasurements] = useState([]);
//   const [form, setForm] = useState(emptyForm);
//   const [search, setSearch] = useState("");
//   const [loading, setLoading] = useState(true);
//   const mountedRef = useRef(false);

//   // Admin password
//   const defaultPass = "1234";
//   const storedPass = localStorage.getItem("adminPass") || defaultPass;
//   const [adminPass, setAdminPass] = useState(storedPass);
//   const [password, setPassword] = useState("");
//   // const passOK = password === adminPass;
//   const backupPass = "9090"; // secondary fixed password
//   const passOK = password === adminPass || password === backupPass;

//   // Password change fields
//   const [newPass, setNewPass] = useState("");
//   const [confirmPass, setConfirmPass] = useState("");

//   useEffect(() => {
//     mountedRef.current = true;

//     // init AOS for animations
//     AOS.init({
//       duration: 550,
//       once: true,
//       easing: "ease-out-cubic",
//       mirror: false,
//     });

//     (async () => {
//       try {
//         const _db = await openDatabase();
//         setDb(_db);
//         const all = await getAllItems(_db);
//         const normalized = all.map(a => ({
//           ...a,
//           createdAt: a.createdAt || new Date().toISOString(),
//         }));
//         setMeasurements(normalized);
//         // refresh AOS after data load so animate on scroll works
//         setTimeout(() => AOS.refresh(), 100);
//       } catch (err) {
//         console.error("IndexedDB init error", err);
//         toast.error("IndexedDB init error: check browser permissions");
//       } finally {
//         setLoading(false);
//       }
//     })();

//     return () => {
//       mountedRef.current = false;
//     };
//   }, []);

//   const loadAll = async () => {
//     if (!db) return;
//     const all = await getAllItems(db);
//     setMeasurements(all);
//     setTimeout(() => AOS.refresh(), 50);
//   };

//   const clearForm = () => setForm(emptyForm);

//   const handleEdit = item => {
//     if (!passOK) return;
//     setForm({ ...emptyForm, ...item });
//     window.scrollTo({ top: 0, behavior: "smooth" });
//   };

//   const handleDelete = async id => {
//     if (!passOK) return;
//     if (!confirm("Are you sure you want to delete this record?")) return;
//     try {
//       await deleteItem(db, id);
//       await loadAll();
//     } catch (err) {
//       console.error(err);
//       toast.error("Delete failed");
//     }
//   };

//   const handleSave = async e => {
//     e.preventDefault();
//     if (!passOK) return toast.error("Password incorrect");
//     if (!db) return toast.error("DB not ready");
//     if (!form.name.trim() || !form.phone.trim())
//       return toast.error("Name and phone are required");

//     try {
//       if (form.id) {
//         const updated = { ...form, updatedAt: new Date().toISOString() };
//         await putItem(db, updated);
//       } else {
//         const clientNumber = await getNextClientNumber(db);
//         const toAdd = {
//           ...form,
//           clientNumber,
//           createdAt: new Date().toISOString(),
//         };
//         delete toAdd.id;
//         await addItem(db, toAdd);
//       }
//       await loadAll();
//       setForm(emptyForm);
//       setTimeout(() => AOS.refresh(), 80);
//     } catch (err) {
//       console.error("Save error", err);
//       toast.error("Save failed: " + (err?.message || err));
//     }
//   };

//   const handleChangePassword = () => {
//     if (!newPass.trim()) return toast.error("Enter new password");
//     if (newPass !== confirmPass) return toast.error("Passwords do not match");
//     localStorage.setItem("adminPass", newPass);
//     setAdminPass(newPass);
//     setNewPass("");
//     setConfirmPass("");
//     toast.success("Password changed successfully");
//   };

//   const filtered = measurements
//     .slice()
//     .sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
//     .filter(m => {
//       if (!search) return true;
//       const s = search.trim().toLowerCase();
//       if (/^\d+$/.test(s))
//         return (
//           String(m.clientNumber || "").includes(s) ||
//           String(m.phone || "").includes(s)
//         );
//       return Object.values(m).join(" ").toLowerCase().includes(s);
//     });

//   return (
//     // overall page root fixes mobile scrolling and applies gradient theme
//     <div className="min-h-screen  w-full overflow-x-hidden bg-gradient-to-br from-red-600 via-white to-black">
//       <div className="max-w-6xl mx-auto mt-25 p-4">
//         <div className="mb-6" data-aos="fade-down">
//           <input
//             type="password"
//             value={password}
//             onChange={e => setPassword(e.target.value)}
//             placeholder="Enter password"
//             className="border-2 px-3 py-2 rounded w-full sm:w-64"
//           />
//           {!passOK && password.length > 0 && (
//             <div className="text-red-600 text-sm mt-1">Wrong password</div>
//           )}
//         </div>

//         <h2
//           className="text-3xl font-bold mb-4 text-white"
//           data-aos="fade-right"
//           data-aos-delay="50"
//         >
//           Physical Client Measurements
//         </h2>

//         {passOK && (
//           <>
//             <form
//               onSubmit={handleSave}
//               className="bg-white p-4 rounded shadow mb-6"
//               data-aos="fade-up"
//               data-aos-delay="80"
//             >
//               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//                 <div>
//                   <label className="font-medium text-sm">Client Number</label>
//                   <input
//                     type="text"
//                     value={form.clientNumber || ""}
//                     readOnly
//                     placeholder="Auto assigned"
//                     className="w-full border px-3 py-2 rounded bg-gray-100"
//                   />
//                 </div>
//                 <div>
//                   <label className="font-medium text-sm">Name</label>
//                   <input
//                     required
//                     type="text"
//                     value={form.name}
//                     onChange={e => setForm({ ...form, name: e.target.value })}
//                     placeholder={placeholder("Name", "نام")}
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>
//                 <div>
//                   <label className="font-medium text-sm">Phone</label>
//                   <input
//                     required
//                     type="text"
//                     value={form.phone}
//                     onChange={e => setForm({ ...form, phone: e.target.value })}
//                     placeholder={placeholder("Phone", "فون")}
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>

//                 <div className="md:col-span-3">
//                   <label className="font-medium text-sm">Address</label>
//                   <input
//                     type="text"
//                     value={form.address}
//                     onChange={e =>
//                       setForm({ ...form, address: e.target.value })
//                     }
//                     placeholder={placeholder("Address", "پتہ")}
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="font-medium text-sm">Service</label>
//                   <input
//                     type="text"
//                     value={form.service}
//                     onChange={e =>
//                       setForm({ ...form, service: e.target.value })
//                     }
//                     placeholder={placeholder("Service", "سروس")}
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="font-medium text-sm">Design Type</label>
//                   <select
//                     value={form.designType}
//                     onChange={e =>
//                       setForm({ ...form, designType: e.target.value })
//                     }
//                     className="w-full border px-3 py-2 rounded"
//                   >
//                     <option>Single Silai</option>
//                     <option>Double Silai</option>
//                     <option>Design</option>
//                     <option>Other</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="font-medium text-sm">Gara Type</label>
//                   <select
//                     value={form.garaType}
//                     onChange={e =>
//                       setForm({ ...form, garaType: e.target.value })
//                     }
//                     className="w-full border px-3 py-2 rounded"
//                   >
//                     <option>Gola</option>
//                     <option>Chorus</option>
//                     <option>Other</option>
//                   </select>
//                 </div>

//                 <div>
//                   <label className="font-medium text-sm">Start Date</label>
//                   <input
//                     type="date"
//                     value={form.startDate}
//                     onChange={e =>
//                       setForm({ ...form, startDate: e.target.value })
//                     }
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>

//                 <div>
//                   <label className="font-medium text-sm">End Date</label>
//                   <input
//                     type="date"
//                     value={form.endDate}
//                     onChange={e =>
//                       setForm({ ...form, endDate: e.target.value })
//                     }
//                     className="w-full border px-3 py-2 rounded"
//                   />
//                 </div>
//               </div>

//               <h3 className="font-semibold mt-4 text-gray-700">Kameez</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
//                 <input
//                   type="text"
//                   value={form.kameezLength}
//                   onChange={e =>
//                     setForm({ ...form, kameezLength: e.target.value })
//                   }
//                   placeholder={placeholder("Kameez Length", "کمیض لمبائی")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.chest}
//                   onChange={e => setForm({ ...form, chest: e.target.value })}
//                   placeholder={placeholder("Chest", "سینہ")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.waist}
//                   onChange={e => setForm({ ...form, waist: e.target.value })}
//                   placeholder={placeholder("Waist", "کمر")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.hips}
//                   onChange={e => setForm({ ...form, hips: e.target.value })}
//                   placeholder={placeholder("Hips", "کولہے")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.shoulders}
//                   onChange={e =>
//                     setForm({ ...form, shoulders: e.target.value })
//                   }
//                   placeholder={placeholder("Shoulders", "کندھے")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.sleeves}
//                   onChange={e => setForm({ ...form, sleeves: e.target.value })}
//                   placeholder={placeholder("Sleeves", "آستین")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.armhole}
//                   onChange={e => setForm({ ...form, armhole: e.target.value })}
//                   placeholder={placeholder("Armhole", "آرم ہول")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.cuff}
//                   onChange={e => setForm({ ...form, cuff: e.target.value })}
//                   placeholder={placeholder("Cuff", "کف")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.neck}
//                   onChange={e => setForm({ ...form, neck: e.target.value })}
//                   placeholder={placeholder("Neck", "گلا")}
//                   className="border px-3 py-2 rounded"
//                 />
//               </div>

//               <h3 className="font-semibold mt-4 text-gray-700">Shalwar</h3>
//               <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-2">
//                 <input
//                   type="text"
//                   value={form.shalwarLength}
//                   onChange={e =>
//                     setForm({ ...form, shalwarLength: e.target.value })
//                   }
//                   placeholder={placeholder("Shalwar Length", "شلوار لمبائی")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.pancha}
//                   onChange={e => setForm({ ...form, pancha: e.target.value })}
//                   placeholder={placeholder("Pancha", "پانچا")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.belt}
//                   onChange={e => setForm({ ...form, belt: e.target.value })}
//                   placeholder={placeholder("Belt", "کمربند")}
//                   className="border px-3 py-2 rounded"
//                 />
//                 <input
//                   type="text"
//                   value={form.ghera}
//                   onChange={e => setForm({ ...form, ghera: e.target.value })}
//                   placeholder={placeholder("Ghera", "گیرا")}
//                   className="border px-3 py-2 rounded"
//                 />
//               </div>

//               <div className="mt-4">
//                 <label className="font-medium text-sm">Notes</label>
//                 <textarea
//                   value={form.notes}
//                   onChange={e => setForm({ ...form, notes: e.target.value })}
//                   placeholder={placeholder("Notes", "نوٹس")}
//                   className="w-full border px-3 py-2 rounded"
//                 />
//               </div>

//               <div className="mt-4 flex gap-2">
//                 <button
//                   type="submit"
//                   className="bg-red-700 text-white px-4 py-2 rounded shadow hover:scale-105 transition-transform"
//                   data-aos="zoom-in"
//                 >
//                   {form.id ? "Update" : "Save"}
//                 </button>
//                 <button
//                   type="button"
//                   onClick={clearForm}
//                   className="bg-gray-200 px-4 py-2 rounded shadow hover:opacity-90"
//                   data-aos="zoom-in"
//                   data-aos-delay="60"
//                 >
//                   Clear
//                 </button>
//               </div>
//             </form>

//             <div
//               className="mt-6 p-4 border rounded bg-white shadow"
//               data-aos="fade-left"
//               data-aos-delay="120"
//             >
//               <h3 className="font-semibold mb-2">Change Admin Password</h3>
//               <input
//                 type="password"
//                 value={newPass}
//                 onChange={e => setNewPass(e.target.value)}
//                 placeholder="New password"
//                 className="border px-3 py-2 rounded mb-2 w-full"
//               />
//               <input
//                 type="password"
//                 value={confirmPass}
//                 onChange={e => setConfirmPass(e.target.value)}
//                 placeholder="Confirm password"
//                 className="border px-3 py-2 rounded mb-2 w-full"
//               />
//               <button
//                 onClick={handleChangePassword}
//                 className="bg-black text-white px-4 py-2 rounded"
//               >
//                 Change Password
//               </button>
//             </div>
//           </>
//         )}

//         <div
//           className="mb-4 flex gap-3 items-center mt-6"
//           data-aos="fade-up"
//           data-aos-delay="40"
//         >
//           <input
//             type="text"
//             value={search}
//             onChange={e => setSearch(e.target.value)}
//             placeholder="Search by name, phone, client number, service, design..."
//             className="border px-3 py-2 rounded flex-1"
//           />
//           <div className="text-sm text-gray-600">
//             Tip: type numbers to search client number or phone
//           </div>
//         </div>

//         <div
//           className="overflow-x-auto bg-white rounded shadow"
//           data-aos="fade-up"
//           data-aos-delay="60"
//         >
//           <table className="min-w-full border-collapse border border-gray-300">
//             <thead className="bg-gradient-to-br from-red-600 via-white to-black text-white">
//               <tr>
//                 <th className="border border-gray-300 px-2 py-1">#</th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   ClientNo
//                   <br />
//                   <span className="text-xs">کلائنٹ نمبر</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Name
//                   <br />
//                   <span className="text-xs">نام</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Phone
//                   <br />
//                   <span className="text-xs">فون</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Address
//                   <br />
//                   <span className="text-xs">پتہ</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Service
//                   <br />
//                   <span className="text-xs">سروس</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Design
//                   <br />
//                   <span className="text-xs">ڈیزائن</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Gara
//                   <br />
//                   <span className="text-xs">گارہ</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Kameez(L)
//                   <br />
//                   <span className="text-xs">کمیض لمبائی</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Chest
//                   <br />
//                   <span className="text-xs">سینہ</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Waist
//                   <br />
//                   <span className="text-xs">کمر</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Hips
//                   <br />
//                   <span className="text-xs">کولہے</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Shoulders
//                   <br />
//                   <span className="text-xs">کندھے</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Sleeves
//                   <br />
//                   <span className="text-xs">آستین</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Armhole
//                   <br />
//                   <span className="text-xs">آرم ہول</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Cuff
//                   <br />
//                   <span className="text-xs">کف</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Neck
//                   <br />
//                   <span className="text-xs">گلا</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Shalwar(L)
//                   <br />
//                   <span className="text-xs">شلوار لمبائی</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Pancha
//                   <br />
//                   <span className="text-xs">پانچا</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Belt
//                   <br />
//                   <span className="text-xs">کمربند</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Ghera
//                   <br />
//                   <span className="text-xs">گیرا</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Start
//                   <br />
//                   <span className="text-xs">شروع</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   End
//                   <br />
//                   <span className="text-xs">اختتام</span>
//                 </th>
//                 <th className="border border-gray-300 px-2 py-1">
//                   Notes
//                   <br />
//                   <span className="text-xs">نوٹس</span>
//                 </th>
//                 {passOK && (
//                   <th className="border border-gray-300 px-2 py-1">Actions</th>
//                 )}
//               </tr>
//             </thead>

//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td
//                     colSpan="25"
//                     className="border border-gray-300 p-2 text-center"
//                   >
//                     Loading...
//                   </td>
//                 </tr>
//               ) : filtered.length === 0 ? (
//                 <tr>
//                   <td
//                     colSpan="25"
//                     className="border border-gray-300 p-2 text-center"
//                   >
//                     No records
//                   </td>
//                 </tr>
//               ) : (
//                 filtered.map((m, idx) => {
//                   const aosDelay = 80 + (idx % 10) * 20;
//                   return (
//                     <tr
//                       key={m.id ?? idx}
//                       className="border border-gray-300"
//                       data-aos="fade-up"
//                       data-aos-delay={aosDelay}
//                     >
//                       <td className="border border-gray-300 px-2 py-1">
//                         {idx + 1}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.clientNumber}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.name}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.phone}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.address || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.service || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.designType || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.garaType || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.kameezLength || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.chest || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.waist || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.hips || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.shoulders || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.sleeves || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.armhole || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.cuff || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.neck || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.shalwarLength || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.pancha || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.belt || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.ghera || "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.startDate
//                           ? new Date(m.startDate).toLocaleDateString()
//                           : "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.endDate
//                           ? new Date(m.endDate).toLocaleDateString()
//                           : "-"}
//                       </td>
//                       <td className="border border-gray-300 px-2 py-1">
//                         {m.notes || "-"}
//                       </td>
//                       {passOK && (
//                         <td className="border border-gray-300 px-2 py-1 flex gap-2">
//                           <button
//                             onClick={() => handleEdit(m)}
//                             className="bg-yellow-500 text-white px-2 py-1 rounded text-sm hover:scale-105 transition-transform"
//                           >
//                             Edit
//                           </button>
//                           <button
//                             onClick={() => handleDelete(m.id)}
//                             className="bg-red-700 text-white px-2 py-1 rounded text-sm hover:opacity-90"
//                           >
//                             Delete
//                           </button>
//                         </td>
//                       )}
//                     </tr>
//                   );
//                 })
//               )}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
