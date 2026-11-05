import React, { useState } from "react";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";
import { logoutUser } from "../lib/api";

export default function DeleteAccount() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);

  if (!user) return null;
  const isStaff = ["tailor", "admin"].includes(user.role);

  const run = async () => {
    if (!navigator.onLine) return toast.error("Internet chahiye");
    if (text.trim() !== "DELETE") return toast.error('Confirm ke liye "DELETE" likhein');
    setBusy(true);
    try {
      // Apni uploaded photos hatao
      const { data: files } = await supabase.storage.from("order-photos").list(user.id);
      if (files?.length) {
        await supabase.storage
          .from("order-photos")
          .remove(files.map(f => `${user.id}/${f.name}`));
      }
      const { error } = await supabase.rpc("delete_my_account");
      if (error) throw error;
      await logoutUser();
      toast.success("Aap ka account aur data delete ho gaya");
      window.location.hash = "#/login";
      window.location.reload();
    } catch (err) {
      toast.error(err.message || "Account delete nahi hua");
    }
    setBusy(false);
  };

  return (
    <div className="max-w-md mx-auto my-4 px-4">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full border border-red-500 text-red-400 rounded-lg py-2 font-semibold"
      >
        🗑️ Delete my account
      </button>
      {open && (
        <div className="bg-white text-black rounded-xl p-4 mt-2 flex flex-col gap-2">
          {isStaff ? (
            <p className="text-sm">
              Tailor/admin account yahan se delete nahi hota. Owner se rabta karein.
            </p>
          ) : (
            <>
              <p className="text-sm">
                Is se aap ka account, orders, bookings aur photos hamesha ke liye delete ho jayenge.
                Ye wapas nahi hoga.
              </p>
              <input
                className="border rounded-lg px-3 py-2"
                placeholder='Confirm ke liye DELETE likhein'
                value={text}
                onChange={e => setText(e.target.value)}
              />
              <button
                onClick={run}
                disabled={busy}
                className="bg-red-600 text-white rounded-lg py-2 font-semibold disabled:opacity-60"
              >
                {busy ? "Please wait..." : "Account delete karein"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
