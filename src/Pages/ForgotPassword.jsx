import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { supabase } from "../lib/supabase";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);

  const cls = "border rounded-lg px-3 py-3 w-full bg-white text-black";

  const sendCode = async () => {
    if (!navigator.onLine) return toast.error("Internet chahiye");
    if (!email.trim()) return toast.error("Email likhein");
    setBusy(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    setBusy(false);
    if (error) return toast.error(error.message || "Code nahi bheja ja saka");
    toast.success("Code aapki email par bhej diya gaya");
    setStep("code");
  };

  const reset = async () => {
    if (code.trim().length < 6) return toast.error("Email wala code likhein");
    if (newPw.length < 8) return toast.error("Naya password kam az kam 8 characters ka ho");
    if (newPw !== confirm) return toast.error("Dono passwords barabar nahi hain");
    setBusy(true);
    try {
      const { error: e1 } = await supabase.auth.verifyOtp({
        email: email.trim(),
        token: code.trim(),
        type: "recovery",
      });
      if (e1) throw new Error("Code galat hai ya expire ho gaya");
      const { error: e2 } = await supabase.auth.updateUser({ password: newPw });
      if (e2) throw e2;
      await supabase.auth.signOut();
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("role");
      toast.success("Password badal gaya. Ab login karein.");
      navigate("/login");
    } catch (err) {
      toast.error(err.message || "Password reset nahi hua");
    }
    setBusy(false);
  };

  return (
    <section className="min-h-screen bg-black text-white pt-28 px-5 pb-10">
      <div className="max-w-md mx-auto bg-gray-900 border border-red-700 rounded-2xl p-6 flex flex-col gap-3">
        <h2 className="text-2xl font-bold text-red-500">Forgot password</h2>

        {step === "email" ? (
          <>
            <p className="text-sm text-gray-300">Apni email likhein, hum 6 ya zyada ginti ka code bhejenge.</p>
            <input className={cls} type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
            <button onClick={sendCode} disabled={busy} className="bg-red-600 rounded-lg py-3 font-semibold disabled:opacity-60">
              {busy ? "Please wait..." : "Code bhejein"}
            </button>
          </>
        ) : (
          <>
            <p className="text-sm text-gray-300">{email} par aaye code se naya password lagayein.</p>
            <input className={cls} inputMode="numeric" placeholder="Email wala code" value={code} onChange={e => setCode(e.target.value)} />
            <input className={cls} type="password" placeholder="Naya password (kam az kam 8)" value={newPw} onChange={e => setNewPw(e.target.value)} />
            <input className={cls} type="password" placeholder="Naya password dobara" value={confirm} onChange={e => setConfirm(e.target.value)} />
            <button onClick={reset} disabled={busy} className="bg-red-600 rounded-lg py-3 font-semibold disabled:opacity-60">
              {busy ? "Please wait..." : "Password badlein"}
            </button>
            <button onClick={() => setStep("email")} className="text-sm underline text-gray-400">
              Dobara code bhejein
            </button>
          </>
        )}

        <button onClick={() => navigate("/login")} className="text-sm underline text-gray-400 mt-2">
          Login par wapas
        </button>
      </div>
    </section>
  );
}
