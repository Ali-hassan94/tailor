import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { listDesigns } from "../lib/api";
import { supabase } from "../lib/supabase";

const isNew = d =>
  d.createdAt && Date.now() - new Date(d.createdAt).getTime() < 7 * 24 * 3600 * 1000;

export default function LatestDesigns() {
  const navigate = useNavigate();
  const [designs, setDesigns] = useState([]);
  const [cat, setCat] = useState("All");
  const [zoom, setZoom] = useState(null);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isTailor = ["tailor", "admin"].includes(user.role);

  useEffect(() => {
    let alive = true;
    const load = () => listDesigns().then(d => alive && setDesigns(d)).catch(() => {});
    load();
    window.addEventListener("online", load);
    return () => {
      alive = false;
      window.removeEventListener("online", load);
    };
  }, []);

  const del = async d => {
    if (!window.confirm(`Delete "${d.title}"?`)) return;
    const { error } = await supabase.from("designs").delete().eq("id", d.id);
    if (error) return alert(error.message);
    if (d.imgPath) await supabase.storage.from("designs").remove([d.imgPath]);
    setDesigns(list => list.filter(x => x.id !== d.id));
  };

  const cats = useMemo(
    () => ["All", ...new Set(designs.map(d => d.category || "Other"))],
    [designs]
  );
  const shown = designs
    .filter(d => cat === "All" || (d.category || "Other") === cat)
    .slice(0, 8);

  if (designs.length === 0 && !isTailor) return null;

  return (
    <section className="bg-black text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between flex-wrap gap-3 mb-5">
          <h2 className="text-3xl font-bold text-red-600">Latest Designs</h2>
          {isTailor && (
            <Link
              to="/manage-designs"
              className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-semibold"
            >
              ➕ Add / Manage Designs
            </Link>
          )}
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3 mb-4">
          {cats.map(c => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`px-4 py-1.5 rounded-full text-sm whitespace-nowrap border ${
                cat === c ? "bg-red-600 border-red-600" : "border-gray-600"
              }`}
            >
              {c}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {shown.map(d => (
            <div key={d.id || d._id} className="bg-gray-900 rounded-xl overflow-hidden border border-red-700">
              <div className="relative cursor-pointer" onClick={() => setZoom(d)}>
                <img
                  src={d.img}
                  alt={d.title}
                  loading="lazy"
                  className="w-full h-44 object-cover"
                  onError={e => (e.currentTarget.style.visibility = "hidden")}
                />
                {isNew(d) && (
                  <span className="absolute top-2 left-2 bg-red-600 text-xs px-2 py-0.5 rounded">NEW</span>
                )}
              </div>
              <div className="p-3">
                <div className="font-semibold text-sm line-clamp-2">{d.title}</div>
                <div className="text-xs text-gray-400 mb-2">{d.category || "Other"}</div>
                <button
                  onClick={() => navigate("/order", { state: { designTitle: d.title } })}
                  className="w-full bg-red-600 rounded-lg py-1.5 text-sm font-semibold"
                >
                  Book Similar
                </button>
                {isTailor && d.id && (
                  <button
                    onClick={() => del(d)}
                    className="w-full mt-2 text-red-400 border border-red-500 rounded-lg py-1 text-xs"
                  >
                    Delete design
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {designs.length > 8 && (
          <div className="text-center mt-6">
            <Link to="/portfolio" className="underline text-red-400">
              View all designs →
            </Link>
          </div>
        )}
      </div>

      {zoom && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex flex-col items-center justify-center p-4"
          onClick={() => setZoom(null)}
        >
          <img src={zoom.img} alt={zoom.title} className="max-h-[75vh] max-w-full rounded-lg" />
          <div className="mt-3 font-semibold text-center">{zoom.title}</div>
          {zoom.description && <div className="text-sm text-gray-300 text-center mt-1">{zoom.description}</div>}
          <div className="text-xs text-gray-400 mt-2">Tap anywhere to close</div>
        </div>
      )}
    </section>
  );
}
