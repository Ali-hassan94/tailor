import React, { useEffect, useState } from "react";

// App khulte hi poora poster saaf (full resolution) dikhata hai, phir fade hoke app dikhti hai
export default function SplashOverlay() {
  const [phase, setPhase] = useState("show"); // show -> fade -> gone

  useEffect(() => {
    const t1 = setTimeout(() => setPhase("fade"), 2000);
    const t2 = setTimeout(() => setPhase("gone"), 2500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "#0A0A0A",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: phase === "fade" ? 0 : 1,
        transition: "opacity 0.5s ease",
        pointerEvents: phase === "fade" ? "none" : "auto",
      }}
    >
      <img
        src={`${import.meta.env.BASE_URL}splash-poster.jpg`}
        alt="Shan Tailor"
        style={{ width: "100%", maxHeight: "100%", objectFit: "contain" }}
      />
    </div>
  );
}
