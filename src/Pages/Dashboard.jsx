import React, { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import { listTable, updateRow, deleteRow } from "../lib/offline";
import { calculatePrice } from "../utils/priceCalculator";

const STATUSES = [
  { value: "pending", label: "Pending", badge: "bg-yellow-100 text-yellow-800" },
  { value: "progress", label: "In Progress", badge: "bg-blue-100 text-blue-800" },
  { value: "completed", label: "Completed", badge: "bg-green-100 text-green-800" },
];

const norm = s => {
  const v = (s || "pending").toLowerCase();
  return v === "in-progress" || v === "in progress" ? "progress" : v;
};
const statusInfo = s => STATUSES.find(x => x.value === norm(s)) || STATUSES[0];
const shortId = id => "#" + String(id || "").slice(0, 6).toUpperCase();
const fmtDate = d => (d ? new Date(d).toLocaleDateString() : "-");
const money = n => "Rs " + Number(n || 0).toLocaleString();
const waNumber = p => {
  let d = (p || "").replace(/\D/g, "");
  if (d.startsWith("00")) d = d.slice(2);
  if (d.startsWith("0")) d = "92" + d.slice(1);
  return d;
};

const StatusBadge = ({ status, pending }) => {
  const info = statusInfo(status);
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${info.badge}`}>
        {info.label}
      </span>
      {pending && <span className="text-xs text-orange-600">Syncing…</span>}
    </span>
  );
};

// User ke liye 3-step progress
const ProgressTracker = ({ status }) => {
  const idx = STATUSES.findIndex(s => s.value === norm(status));
  return (
    <div className="flex items-center mt-3">
      {STATUSES.map((s, i) => (
        <React.Fragment key={s.value}>
          <div className="flex flex-col items-center">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white ${
                i <= idx ? (idx === 2 ? "bg-green-600" : "bg-red-600") : "bg-gray-300"
              }`}
            >
              {i <= idx ? "✓" : i + 1}
            </div>
            <span className="text-xs mt-1 text-gray-600">{s.label}</span>
          </div>
          {i < STATUSES.length - 1 && (
            <div className={`flex-1 h-1 mx-1 mb-4 ${i < idx ? "bg-red-600" : "bg-gray-300"}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

const userMessage = status => {
  const s = norm(status);
  if (s === "completed") return "✅ Your clothes are stitched and ready!";
  if (s === "progress") return "🧵 Tailor is stitching your clothes now.";
  return "⏳ Order received, stitching will start soon.";
};

const StatusSelect = ({ value, onChange }) => (
  <select
    value={norm(value)}
    onChange={e => onChange(e.target.value)}
    className="border rounded-lg px-3 py-2 bg-white w-full"
  >
    {STATUSES.map(s => (
      <option key={s.value} value={s.value}>
        {s.label}
      </option>
    ))}
  </select>
);

const Row = ({ label, children }) => (
  <div className="flex justify-between gap-3 text-sm py-0.5">
    <span className="text-gray-500">{label}</span>
    <span className="font-medium text-right break-words">{children || "-"}</span>
  </div>
);

const PriceInput = ({ value, onSave }) => {
  const [v, setV] = useState(String(value ?? ""));
  useEffect(() => setV(String(value ?? "")), [value]);
  return (
    <div className="mt-2">
      <label className="block text-sm text-gray-600 mb-1">Price (Rs) - change kar sakte hain</label>
      <input
        type="number"
        min="0"
        inputMode="numeric"
        value={v}
        onChange={e => setV(e.target.value)}
        onBlur={() => {
          const n = Number(v);
          if (v !== "" && n >= 0 && n !== Number(value)) onSave(n);
        }}
        className="border rounded-lg px-3 py-2 w-full"
      />
    </div>
  );
};

const ContactButtons = ({ phone, message }) => {
  if (!phone) return null;
  const wa = `https://wa.me/${waNumber(phone)}${message ? "?text=" + encodeURIComponent(message) : ""}`;
  return (
    <div className="flex gap-2 mt-3">
      <a href={`tel:${phone}`} className="flex-1 text-center bg-gray-800 text-white rounded-lg py-2 text-sm">
        📞 Call
      </a>
      <a
        href={wa}
        target="_blank"
        rel="noreferrer"
        className="flex-1 text-center bg-green-600 text-white rounded-lg py-2 text-sm"
      >
        💬 WhatsApp
      </a>
    </div>
  );
};

/* ---------------- Tailor cards ---------------- */

const OrderCardTailor = ({ o, onStatus, onDelete, onField }) => {
  const [note, setNote] = useState(o.tailorNote || "");
  useEffect(() => setNote(o.tailorNote || ""), [o.tailorNote]);
  const done = norm(o.status) === "completed";
  const msg = `Assalam o Alaikum ${o.name || ""}, aap ka ${o.design || "order"} tayyar hai. Shan Tailor se collect kar lein. Shukriya!`;
  return (
    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-600">
      <div className="flex justify-between items-start mb-2">
        <div>
          <div className="font-bold text-lg">{o.name}</div>
          <div className="text-xs text-gray-500">{shortId(o.id)} · {fmtDate(o.createdAt)}</div>
        </div>
        <StatusBadge status={o.status} pending={o._pending} />
      </div>
      <Row label="Design">{o.design}</Row>
      <Row label="Cloth">{o.clothType}</Row>
      <Row label="Complexity">{o.complexity}</Row>
      <Row label="Measurements">{o.measurements}</Row>
      <PriceInput value={o.totalPrice} onSave={n => onField(o.id, { totalPrice: n })} />

      <label className="block text-sm text-gray-600 mt-3 mb-1">Delivery date</label>
      <input
        type="date"
        defaultValue={o.dueDate || ""}
        onChange={e => onField(o.id, { dueDate: e.target.value || null })}
        className="border rounded-lg px-3 py-2 w-full"
      />
      <label className="block text-sm text-gray-600 mt-3 mb-1">Note (customer ko dikhega)</label>
      <textarea
        value={note}
        onChange={e => setNote(e.target.value)}
        onBlur={() => note !== (o.tailorNote || "") && onField(o.id, { tailorNote: note })}
        rows={2}
        className="border rounded-lg px-3 py-2 w-full"
        placeholder="e.g. Kal tak ready ho jayega"
      />

      <label className="block text-sm text-gray-600 mt-3 mb-1">Status</label>
      <StatusSelect value={o.status} onChange={v => onStatus(o.id, v)} />

      <ContactButtons phone={o.phone} message={done ? msg : ""} />
      {done ? (
        <button
          onClick={() => onDelete(o.id)}
          className="mt-3 w-full bg-green-600 text-white rounded-lg py-2 text-sm font-semibold"
        >
          ✅ Delivered - remove order
        </button>
      ) : (
        <button
          onClick={() => onDelete(o.id)}
          className="mt-3 w-full text-red-600 border border-red-300 rounded-lg py-2 text-sm"
        >
          Delete order
        </button>
      )}
    </div>
  );
};

const MeasurementCardTailor = ({ m, onStatus, onDelete }) => (
  <div className="bg-white rounded-xl shadow p-4 border-l-4 border-black">
    <div className="flex justify-between items-start mb-2">
      <div>
        <div className="font-bold text-lg">{m.name}</div>
        <div className="text-xs text-gray-500">{fmtDate(m.createdAt)}</div>
      </div>
      <StatusBadge status={m.status} pending={m._pending} />
    </div>
    <div className="grid grid-cols-2 gap-x-4">
      <Row label="Chest">{m.chest}</Row>
      <Row label="Waist">{m.waist}</Row>
      <Row label="Hips">{m.hips}</Row>
      <Row label="Shoulders">{m.shoulders}</Row>
      <Row label="Length">{m.length}</Row>
    </div>
    <div className="mt-3">
      <StatusSelect value={m.status} onChange={v => onStatus(m.id, v)} />
    </div>
    <ContactButtons phone={m.phone} />
    <button
      onClick={() => onDelete(m.id)}
      className="mt-3 w-full text-red-600 border border-red-300 rounded-lg py-2 text-sm"
    >
      Delete
    </button>
  </div>
);

const BookingCardTailor = ({ b, onStatus, onDelete, onField }) => (
  <div className="bg-white rounded-xl shadow p-4 border-l-4 border-yellow-500">
    <div className="flex justify-between items-start mb-2">
      <div>
        <div className="font-bold text-lg">
          {b.name} {b.rush && <span className="text-xs bg-red-600 text-white px-2 py-0.5 rounded">RUSH</span>}
        </div>
        <div className="text-xs text-gray-500">{shortId(b.id)} · {fmtDate(b.createdAt)}</div>
      </div>
      <StatusBadge status={b.status} pending={b._pending} />
    </div>
    <Row label="Service">{b.service}</Row>
    <Row label="Booking date">{fmtDate(b.date)}</Row>
    <Row label="Cloth">{b.clothType}</Row>
    <Row label="Complexity">{b.complexity}</Row>
    <PriceInput value={b.totalPrice} onSave={n => onField(b.id, { totalPrice: n })} />
    <div className="mt-3">
      <StatusSelect value={b.status} onChange={v => onStatus(b.id, v)} />
    </div>
    <ContactButtons phone={b.phone} />
    <button
      onClick={() => onDelete(b.id)}
      className="mt-3 w-full text-red-600 border border-red-300 rounded-lg py-2 text-sm"
    >
      Delete
    </button>
  </div>
);

/* ---------------- User cards (view only) ---------------- */

const inputCls = "border rounded-lg px-3 py-2 w-full bg-white";

const OrderCardUser = ({ o, onSave }) => {
  const [editing, setEditing] = useState(false);
  const [f, setF] = useState({});
  const canEdit = norm(o.status) === "pending";

  const start = () => {
    setF({
      name: o.name || "",
      phone: o.phone || "",
      design: o.design || "",
      measurements: o.measurements || "",
      clothType: o.clothType || "cotton",
      complexity: o.complexity || "simple",
    });
    setEditing(true);
  };
  const ch = e => setF(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const priceChanged = f.clothType !== o.clothType || f.complexity !== o.complexity;
  const newPrice = priceChanged ? calculatePrice(f.clothType, f.complexity) : Number(o.totalPrice || 0);

  const save = async () => {
    if (Object.values(f).some(v => !String(v).trim())) {
      toast.error("Sab fields bharna zaroori hai");
      return;
    }
    const patch = { ...f };
    if (priceChanged) patch.totalPrice = newPrice;
    if (await onSave(o.id, patch)) setEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow p-4 border-l-4 border-red-600">
      <div className="flex justify-between items-start">
        <div>
          <div className="font-bold text-lg">{o.design || "Order"}</div>
          <div className="text-xs text-gray-500">{shortId(o.id)} · {fmtDate(o.createdAt)}</div>
        </div>
        <StatusBadge status={o.status} pending={o._pending} />
      </div>
      <ProgressTracker status={o.status} />
      <p className="mt-3 text-sm font-medium">{userMessage(o.status)}</p>

      {!editing && (
        <>
          <div className="mt-2">
            <Row label="Cloth">{o.clothType}</Row>
            <Row label="Complexity">{o.complexity}</Row>
            <Row label="Measurements">{o.measurements}</Row>
            <Row label="Price">{money(o.totalPrice)}</Row>
            {o.dueDate && <Row label="Expected delivery">{fmtDate(o.dueDate)}</Row>}
          </div>
          {o.tailorNote && (
            <div className="mt-2 text-sm bg-yellow-50 border border-yellow-200 rounded-lg p-2">
              <b>Tailor note:</b> {o.tailorNote}
            </div>
          )}
          {canEdit ? (
            <button
              onClick={start}
              className="mt-3 w-full bg-red-600 text-white rounded-lg py-2 text-sm font-semibold"
            >
              ✏️ Edit order
            </button>
          ) : (
            <p className="mt-3 text-xs text-gray-500">
              Silai shuru ho chuki hai, ab order edit nahi ho sakta. Tabdeeli ke liye tailor se rabta karein.
            </p>
          )}
        </>
      )}

      {editing && (
        <div className="mt-3 flex flex-col gap-2">
          <input name="name" value={f.name} onChange={ch} placeholder="Full name" className={inputCls} />
          <input name="phone" value={f.phone} onChange={ch} placeholder="Phone" className={inputCls} />
          <input name="design" value={f.design} onChange={ch} placeholder="Design or style" className={inputCls} />
          <textarea
            name="measurements"
            value={f.measurements}
            onChange={ch}
            rows={3}
            placeholder="Measurements"
            className={inputCls}
          />
          <select name="clothType" value={f.clothType} onChange={ch} className={inputCls}>
            <option value="cotton">Cotton</option>
            <option value="silk">Silk</option>
            <option value="linen">Linen</option>
          </select>
          <select name="complexity" value={f.complexity} onChange={ch} className={inputCls}>
            <option value="simple">Simple</option>
            <option value="moderate">Moderate</option>
            <option value="complex">Complex</option>
          </select>
          <div className="text-sm font-semibold">New price: {money(newPrice)}</div>
          <div className="flex gap-2">
            <button onClick={save} className="flex-1 bg-green-600 text-white rounded-lg py-2 text-sm font-semibold">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="flex-1 border rounded-lg py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const SimpleCardUser = ({ title, sub, item }) => (
  <div className="bg-white rounded-xl shadow p-4 flex justify-between items-center">
    <div>
      <div className="font-semibold">{title}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
    <StatusBadge status={item.status} pending={item._pending} />
  </div>
);

/* ---------------- Page ---------------- */

export default function Dashboard() {
  const [orders, setOrders] = useState([]);
  const [measurements, setMeasurements] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [tab, setTab] = useState("orders");
  const [error, setError] = useState("");

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const isTailor = ["tailor", "admin"].includes(currentUser.role);

  const loadAll = useCallback(async () => {
    try {
      setOrders(await listTable("orders"));
      setMeasurements(await listTable("measurements"));
      setBookings(await listTable("bookings"));
      setError("");
    } catch (err) {
      setError(err.message || "Failed to load data");
    }
  }, []);

  useEffect(() => {
    loadAll();
    const t = setInterval(() => navigator.onLine && loadAll(), 20000);
    window.addEventListener("tailor-synced", loadAll);
    window.addEventListener("online", loadAll);
    return () => {
      clearInterval(t);
      window.removeEventListener("tailor-synced", loadAll);
      window.removeEventListener("online", loadAll);
    };
  }, [loadAll]);

  const TABLES = { orders: "orders", measurements: "measurements", bookings: "bookings" };

  const setStatus = table => async (id, status) => {
    try {
      const r = await updateRow(TABLES[table], id, { status });
      if (r.queued) toast("Offline: saved, internet aate hi sync hoga");
      loadAll();
    } catch (err) {
      toast.error(err.message || "Status update failed");
    }
  };
  const setFields = table => async (id, patch) => {
    try {
      await updateRow(TABLES[table], id, patch);
      toast.success("Saved");
      loadAll();
    } catch (err) {
      toast.error(err.message || "Save failed (SQL update run kiya?)");
    }
  };
  const remove = table => async id => {
    if (!window.confirm("Delete this entry?")) return;
    try {
      await deleteRow(TABLES[table], id);
      loadAll();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  const saveOrderEdit = async (id, patch) => {
    try {
      const r = await updateRow("orders", id, patch);
      toast.success(r.queued ? "Offline: saved, internet aate hi sync hoga" : "Order updated");
      loadAll();
      return true;
    } catch (err) {
      toast.error(err.message || "Update failed");
      return false;
    }
  };

  const filter = (rows, fields) => {
    const s = search.toLowerCase();
    return rows.filter(r => {
      if (statusFilter && norm(r.status) !== statusFilter) return false;
      if (!s) return true;
      return fields.some(f => String(r[f] || "").toLowerCase().includes(s));
    });
  };

  const fOrders = useMemo(
    () => filter(orders, ["name", "phone", "design", "clothType"]),
    [orders, search, statusFilter]
  );
  const fMeas = useMemo(() => filter(measurements, ["name", "phone"]), [measurements, search, statusFilter]);
  const fBook = useMemo(
    () => filter(bookings, ["name", "phone", "service", "clothType"]),
    [bookings, search, statusFilter]
  );

  const count = s => orders.filter(o => norm(o.status) === s).length;
  const earned = orders
    .filter(o => norm(o.status) === "completed")
    .reduce((a, o) => a + Number(o.totalPrice || 0), 0);

  /* ---------- User view ---------- */
  if (!isTailor) {
    return (
      <DashboardLayout>
        <h2 className="text-3xl font-bold mt-8 mb-1">My Orders</h2>
        <p className="text-gray-600 mb-5">
          Yahan aap apne kapron ki silai ka status dekh sakte hain.
        </p>
        {error && <p className="text-red-500 mb-4">{error}</p>}

        {orders.length === 0 ? (
          <p className="text-gray-500 mb-8">Abhi koi order nahi hai.</p>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 mb-8">
            {orders.map(o => (
              <OrderCardUser key={o.id} o={o} onSave={saveOrderEdit} />
            ))}
          </div>
        )}

        {bookings.length > 0 && (
          <>
            <h3 className="text-xl font-semibold mb-3">My Bookings</h3>
            <div className="grid gap-3 md:grid-cols-2 mb-8">
              {bookings.map(b => (
                <SimpleCardUser key={b.id} item={b} title={b.service} sub={`${fmtDate(b.date)} · ${money(b.totalPrice)}`} />
              ))}
            </div>
          </>
        )}

        {measurements.length > 0 && (
          <>
            <h3 className="text-xl font-semibold mb-3">My Measurements</h3>
            <div className="grid gap-3 md:grid-cols-2 mb-8">
              {measurements.map(m => (
                <SimpleCardUser key={m.id} item={m} title={m.name} sub={fmtDate(m.createdAt)} />
              ))}
            </div>
          </>
        )}
      </DashboardLayout>
    );
  }

  /* ---------- Tailor view ---------- */
  const tabs = [
    { key: "orders", label: "Orders", n: orders.length },
    { key: "measurements", label: "Measurements", n: measurements.length },
    { key: "bookings", label: "Bookings", n: bookings.length },
  ];

  return (
    <DashboardLayout>
      <h2 className="text-3xl font-bold mt-8 mb-4">Tailor Dashboard</h2>
      <Link
        to="/manage-designs"
        className="inline-block mb-4 bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold"
      >
        🖼️ Add / Manage Designs (Home page demo)
      </Link>
      {error && <p className="text-red-500 mb-4">{error}</p>}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-yellow-100 rounded-xl p-4">
          <div className="text-2xl font-bold">{count("pending")}</div>
          <div className="text-sm">Pending</div>
        </div>
        <div className="bg-blue-100 rounded-xl p-4">
          <div className="text-2xl font-bold">{count("progress")}</div>
          <div className="text-sm">In Progress</div>
        </div>
        <div className="bg-green-100 rounded-xl p-4">
          <div className="text-2xl font-bold">{count("completed")}</div>
          <div className="text-sm">Completed</div>
        </div>
        <div className="bg-black text-white rounded-xl p-4">
          <div className="text-xl font-bold">{money(earned)}</div>
          <div className="text-sm">Completed value</div>
        </div>
      </div>

      <div className="flex gap-2 mb-4 overflow-x-auto">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold ${
              tab === t.key ? "bg-red-600 text-white" : "bg-white border"
            }`}
          >
            {t.label} ({t.n})
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <input
          type="text"
          placeholder="Search name, phone, design..."
          className="border px-3 py-2 rounded-lg w-full sm:w-72 bg-white"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="border px-3 py-2 rounded-lg bg-white"
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All status</option>
          {STATUSES.map(s => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 pb-10">
        {tab === "orders" &&
          (fOrders.length === 0 ? (
            <p className="text-gray-500">No orders.</p>
          ) : (
            fOrders.map(o => (
              <OrderCardTailor
                key={o.id}
                o={o}
                onStatus={setStatus("orders")}
                onDelete={remove("orders")}
                onField={setFields("orders")}
              />
            ))
          ))}
        {tab === "measurements" &&
          (fMeas.length === 0 ? (
            <p className="text-gray-500">No measurements.</p>
          ) : (
            fMeas.map(m => (
              <MeasurementCardTailor
                key={m.id}
                m={m}
                onStatus={setStatus("measurements")}
                onDelete={remove("measurements")}
              />
            ))
          ))}
        {tab === "bookings" &&
          (fBook.length === 0 ? (
            <p className="text-gray-500">No bookings.</p>
          ) : (
            fBook.map(b => (
              <BookingCardTailor
                key={b.id}
                b={b}
                onStatus={setStatus("bookings")}
                onDelete={remove("bookings")}
                onField={setFields("bookings")}
              />
            ))
          ))}
      </div>
    </DashboardLayout>
  );
}
