import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { OWNER_EMAIL } from "../lib/config";

export default function ManageStaff() {
  const me = JSON.parse(localStorage.getItem("user") || "null");
  const isTailor = ["tailor", "admin"].includes(me?.role);
  const isOwner = (me?.email || "").toLowerCase() === OWNER_EMAIL;

  const [people, setPeople] = useState([]);
  const [email, setEmail] = useState("");
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("id,name,email,phone,role,created_at")
      .order("created_at", { ascending: false });
    if (error) return toast.error(error.message);
    setPeople(data || []);
  }, []);

  useEffect(() => {
    if (isTailor && navigator.onLine) load();
  }, [isTailor, load]);

  const setRole = async (targetEmail, role) => {
    if (!navigator.onLine) return toast.error("Internet chahiye");
    setBusy(true);
    const { error } = await supabase.rpc("set_user_role", {
      target_email: targetEmail,
      new_role: role,
    });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success(role === "tailor" ? "Tailor bana diya gaya" : "Tailor hata diya gaya");
    setEmail("");
    load();
  };

  if (!isTailor) {
    return (
      <section className="min-h-screen pt-28 px-6 text-center bg-gray-100">
        <p className="text-lg">Ye page sirf tailor (admin) ke liye hai.</p>
        <Link to="/Home" className="underline text-red-600">Home</Link>
      </section>
    );
  }

  const s = search.trim().toLowerCase();
  const shown = people.filter(p => !s || `${p.name} ${p.email} ${p.phone}`.toLowerCase().includes(s));
  const tailors = shown.filter(p => p.role === "tailor");
  const others = shown.filter(p => p.role !== "tailor");

  const Card = ({ p }) => (
    <div className="bg-white rounded-xl shadow p-3 flex justify-between items-center gap-2">
      <div className="min-w-0">
        <div className="font-semibold truncate">
          {p.name || "-"} {(p.email || "").toLowerCase() === OWNER_EMAIL && <span className="text-xs bg-black text-white px-2 py-0.5 rounded">OWNER</span>}
        </div>
        <div className="text-xs text-gray-500 truncate">{p.email}</div>
        <div className="text-xs text-gray-500">{p.phone || ""}</div>
      </div>
      {isOwner && (p.email || "").toLowerCase() !== OWNER_EMAIL && (
        p.role === "tailor" ? (
          <button disabled={busy} onClick={() => setRole(p.email, "user")} className="text-red-600 border border-red-300 rounded-lg px-3 py-1 text-sm">
            Remove
          </button>
        ) : (
          <button disabled={busy} onClick={() => setRole(p.email, "tailor")} className="bg-red-600 text-white rounded-lg px-3 py-1 text-sm">
            Make tailor
          </button>
        )
      )}
    </div>
  );

  return (
    <section className="min-h-screen bg-gray-100 pt-24 px-4 pb-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-1">Staff (Tailors)</h2>
        <p className="text-gray-600 text-sm mb-5">
          Har tailor apne naam se kaam kar sakta hai. Order ko kisi tailor ko assign karein, Dashboard mein "My orders" filter se apna kaam alag nazar aata hai.
          {!isOwner && " Tailor add/remove sirf owner kar sakta hai."}
        </p>

        {isOwner && (
          <div className="bg-white rounded-xl shadow p-4 mb-6 flex flex-col gap-2">
            <div className="font-semibold">Naya tailor add karein</div>
            <p className="text-xs text-gray-500">Pehle us shakhs ko app mein Register karna hoga, phir yahan uski email likhein.</p>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="Registered email"
              className="border rounded-lg px-3 py-2"
            />
            <button
              disabled={busy || !email.trim()}
              onClick={() => setRole(email.trim(), "tailor")}
              className="bg-red-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60"
            >
              Tailor banayein
            </button>
          </div>
        )}

        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search name, email, phone..."
          className="border rounded-lg px-3 py-2 w-full bg-white mb-4"
        />

        <h3 className="font-semibold mb-2">Tailors ({tailors.length})</h3>
        <div className="grid gap-2 mb-6">{tailors.map(p => <Card key={p.id} p={p} />)}</div>

        {isOwner && (
          <>
            <h3 className="font-semibold mb-2">Baaqi users ({others.length})</h3>
            <div className="grid gap-2">{others.map(p => <Card key={p.id} p={p} />)}</div>
          </>
        )}
      </div>
    </section>
  );
}
