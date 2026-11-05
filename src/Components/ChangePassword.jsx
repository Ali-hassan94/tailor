import React, { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export default function ChangePassword() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  const cls = "border rounded-lg px-3 py-2 w-full bg-white text-black";

  const submit = async () => {
    if (!navigator.onLine) return toast.error("Internet chahiye");
    if (newPw.length < 8) return toast.error("Naya password kam az kam 8 characters ka ho");
    if (newPw !== confirm) return toast.error("Dono naye passwords barabar nahi hain");
    if (newPw === oldPw) return toast.error("Naya password purane se alag rakhein");
    setBusy(true);
    try {
      const { error: e1 } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: oldPw,
      });
      if (e1) throw new Error("Purana password galat hai");
      const { error } = await supabase.auth.updateUser({ password: newPw });
      if (error) throw error;
      // Baaki sab devices se logout (agar kisi ko purana password pata tha)
      await supabase.auth.signOut({ scope: "others" });
      toast.success("Password badal gaya. Doosre devices logout ho gaye.");
      setOldPw("");
      setNewPw("");
      setConfirm("");
      setOpen(false);
    } catch (err) {
      toast.error(err.message || "Password change nahi hua");
    }
    setBusy(false);
  };

  return (
    <div className="max-w-md mx-auto my-4 px-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full bg-white text-black rounded-lg py-2 font-semibold"
      >
        🔒 Change password
      </button>
      {open && (
        <div className="bg-white text-black rounded-xl p-4 mt-2 flex flex-col gap-2">
          <input type="password" className={cls} placeholder="Purana password" value={oldPw} onChange={e => setOldPw(e.target.value)} />
          <input type="password" className={cls} placeholder="Naya password (kam az kam 8)" value={newPw} onChange={e => setNewPw(e.target.value)} />
          <input type="password" className={cls} placeholder="Naya password dobara" value={confirm} onChange={e => setConfirm(e.target.value)} />
          <button
            onClick={submit}
            disabled={busy}
            className="bg-red-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60"
          >
            {busy ? "Please wait..." : "Password badlein"}
          </button>
        </div>
      )}
    </div>
  );
}
