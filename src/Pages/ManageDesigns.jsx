import React, { useCallback, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { listTable } from "../lib/offline";

const CATEGORIES = [
  "Shalwar Kameez",
  "Kurta",
  "Suit",
  "Shirt",
  "Sherwani",
  "Waistcoat",
  "Bridal / Party Wear",
  "Other",
];

// Phone ki badi photo ko chhota karke upload (data bachti hai)
async function compressImage(file, max = 1280, quality = 0.8) {
  const bmp = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const w = Math.round(bmp.width * scale);
  const h = Math.round(bmp.height * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  canvas.getContext("2d").drawImage(bmp, 0, 0, w, h);
  return new Promise((res, rej) =>
    canvas.toBlob(b => (b ? res(b) : rej(new Error("Image convert failed"))), "image/jpeg", quality)
  );
}

export default function ManageDesigns() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isTailor = ["tailor", "admin"].includes(user.role);

  const [designs, setDesigns] = useState([]);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      setDesigns(await listTable("designs"));
    } catch {
      /* ignore */
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const pick = e => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const add = async () => {
    if (!navigator.onLine) return toast.error("Design add karne ke liye internet chahiye");
    if (!file) return toast.error("Pehle image chunein");
    if (!title.trim()) return toast.error("Design ka naam likhein");
    setBusy(true);
    let path = "";
    try {
      const blob = await compressImage(file);
      path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.jpg`;
      const up = await supabase.storage.from("designs").upload(path, blob, {
        contentType: "image/jpeg",
        upsert: false,
      });
      if (up.error) throw up.error;
      const { data } = supabase.storage.from("designs").getPublicUrl(path);
      const { error } = await supabase.from("designs").insert({
        title: title.trim(),
        description: description.trim() || null,
        category,
        price: price.trim() ? Number(price) : null,
        img: data.publicUrl,
        img_path: path,
      });
      if (error) {
        await supabase.storage.from("designs").remove([path]);
        throw error;
      }
      toast.success("Design add ho gaya, Home page par nazar aayega");
      setFile(null);
      setPreview("");
      setTitle("");
      setDescription("");
      setPrice("");
      load();
    } catch (err) {
      toast.error(err.message || "Upload failed (SQL update_v4 run kiya?)");
    }
    setBusy(false);
  };

  const savePrice = async (d, v) => {
    const n = v === "" ? null : Number(v);
    if (n === (d.price ?? null)) return;
    const { error } = await supabase.from("designs").update({ price: n }).eq("id", d.id);
    if (error) toast.error(error.message || "Price save failed (SQL update_v7 run kiya?)");
    else {
      toast.success("Price saved");
      load();
    }
  };

  const remove = async d => {
    if (!window.confirm(`Delete "${d.title}"?`)) return;
    try {
      const { error } = await supabase.from("designs").delete().eq("id", d.id);
      if (error) throw error;
      if (d.imgPath) await supabase.storage.from("designs").remove([d.imgPath]);
      load();
    } catch (err) {
      toast.error(err.message || "Delete failed");
    }
  };

  if (!isTailor) {
    return (
      <section className="min-h-screen pt-28 px-6 text-center">
        <p className="text-lg">Ye page sirf tailor (admin) ke liye hai.</p>
        <Link to="/Home" className="underline text-red-600">Home</Link>
      </section>
    );
  }

  const inputCls = "border rounded-lg px-3 py-2 w-full bg-white text-black";

  return (
    <section className="min-h-screen bg-gray-100 pt-24 px-5 pb-12">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl font-bold mb-1">Manage Designs</h2>
        <p className="text-gray-600 mb-5">Yahan se naye design ki photo add karein, wo Home page par demo ke taur par dikhegi.</p>

        <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-3 mb-8">
          <label className="font-semibold">Photo</label>
          <input type="file" accept="image/*" onChange={pick} />
          {preview && <img src={preview} alt="preview" className="w-full max-h-72 object-contain rounded-lg bg-gray-50" />}
          <input className={inputCls} placeholder="Design name (e.g. Black Sherwani)" value={title} onChange={e => setTitle(e.target.value)} />
          <select className={inputCls} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <input
            className={inputCls}
            type="number"
            min="0"
            inputMode="numeric"
            placeholder="Price in Rs (optional, Home page par dikhegi)"
            value={price}
            onChange={e => setPrice(e.target.value)}
          />
          <textarea className={inputCls} rows={2} placeholder="Description (optional)" value={description} onChange={e => setDescription(e.target.value)} />
          <button
            onClick={add}
            disabled={busy}
            className="bg-red-600 text-white rounded-lg py-3 font-semibold disabled:opacity-60"
          >
            {busy ? "Uploading..." : "Add Design to Home"}
          </button>
        </div>

        <h3 className="text-xl font-semibold mb-3">All Designs ({designs.length})</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {designs.map(d => (
            <div key={d.id} className="bg-white rounded-xl shadow overflow-hidden">
              <img src={d.img} alt={d.title} loading="lazy" className="w-full h-36 object-cover" onError={e => (e.currentTarget.style.visibility = "hidden")} />
              <div className="p-2">
                <div className="text-sm font-semibold line-clamp-2">{d.title}</div>
                <div className="text-xs text-gray-500 mb-1">{d.category || "Other"}</div>
                <input
                  key={`${d.id}-${d.price ?? ""}`}
                  type="number"
                  min="0"
                  inputMode="numeric"
                  defaultValue={d.price ?? ""}
                  placeholder="Price Rs"
                  onBlur={e => savePrice(d, e.target.value)}
                  className="border rounded px-2 py-1 w-full text-sm mb-2"
                />
                <button onClick={() => remove(d)} className="w-full text-red-600 border border-red-300 rounded-lg py-1 text-sm">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
