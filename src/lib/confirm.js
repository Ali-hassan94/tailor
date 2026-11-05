// Apna saaf confirm box (phone par browser wale dabbe se behtar nazar aata hai)
export function confirmDialog(
  message,
  { title = "Kya aap sure hain?", okText = "Haan, delete karein", cancelText = "Nahi, wapas" } = {}
) {
  return new Promise(resolve => {
    const overlay = document.createElement("div");
    Object.assign(overlay.style, {
      position: "fixed",
      inset: "0",
      background: "rgba(0,0,0,0.75)",
      zIndex: "100000",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "16px",
    });

    const box = document.createElement("div");
    Object.assign(box.style, {
      background: "#ffffff",
      color: "#111111",
      borderRadius: "16px",
      padding: "20px",
      width: "100%",
      maxWidth: "360px",
      fontFamily: "inherit",
      boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
    });

    const h = document.createElement("div");
    h.textContent = title;
    Object.assign(h.style, { fontSize: "20px", fontWeight: "700", color: "#b00000", marginBottom: "8px" });

    const p = document.createElement("div");
    p.textContent = message;
    Object.assign(p.style, { fontSize: "16px", lineHeight: "1.5", marginBottom: "18px" });

    const row = document.createElement("div");
    Object.assign(row.style, { display: "flex", gap: "10px" });

    const mkBtn = (text, bg, color) => {
      const b = document.createElement("button");
      b.type = "button";
      b.textContent = text;
      Object.assign(b.style, {
        flex: "1",
        padding: "12px 8px",
        borderRadius: "10px",
        border: "none",
        fontSize: "15px",
        fontWeight: "700",
        background: bg,
        color,
      });
      return b;
    };

    const cancel = mkBtn(cancelText, "#e5e7eb", "#111111");
    const ok = mkBtn(okText, "#dc2626", "#ffffff");

    const close = v => {
      overlay.remove();
      resolve(v);
    };
    cancel.onclick = () => close(false);
    ok.onclick = () => close(true);
    overlay.onclick = e => {
      if (e.target === overlay) close(false);
    };

    row.append(cancel, ok);
    box.append(h, p, row);
    overlay.append(box);
    document.body.appendChild(overlay);
  });
}
