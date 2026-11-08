import { useRef, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

export default function QrModal({ row, onClose }) {
  const canvas = useRef(null);
  const [note, setNote] = useState("");
  const url = row?.qrUrl || "";
  const nama = row?.nama || "Topeng";
  const status = row?.videoStatus || "";
  const statusLabel = status === "selesai" ? "Video siap" : status || "Belum ada video";
  const statusClass = status || "kosong";

  const png = () => canvas.current?.toDataURL("image/png") || "";

  const download = () => {
    if (!url) return;
    const a = document.createElement("a");
    a.href = png();
    a.download = `qr-topeng-${row.id}.png`;
    a.click();
  };

  const print = () => {
    if (!url) return;
    const w = window.open("", "_blank");
    if (!w) { setNote("Popup diblokir browser. Izinkan popup untuk mencetak."); return; }
    const doc = w.document;
    doc.title = `QR ${nama}`;
    const style = doc.createElement("style");
    style.textContent = "body{font-family:sans-serif;text-align:center;padding:24px}img{width:320px;height:320px}h1{font-size:20px;margin:12px 0 4px}p{font-size:13px;color:#444;margin:0}";
    doc.head.appendChild(style);
    const img = doc.createElement("img");
    img.alt = `QR ${nama}`;
    img.onload = () => { w.focus(); w.print(); };
    img.src = png();
    const h = doc.createElement("h1");
    h.textContent = nama;
    const p = doc.createElement("p");
    p.textContent = "Scan untuk video dan kuis";
    doc.body.append(img, h, p);
  };

  const copy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setNote("Link disalin.");
      return;
    } catch {
      /* clipboard butuh HTTPS; pakai fallback */
    }
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand("copy");
      setNote("Link disalin.");
    } catch {
      setNote("Gagal menyalin link.");
    }
    document.body.removeChild(ta);
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal small" onClick={(e) => e.stopPropagation()}>
        <h2>QR {nama}</h2>
        <p><span className={`badge ${statusClass}`}>{statusLabel}</span></p>
        {status !== "selesai" && (
          <p className="muted small-note">Video AI belum siap. Tombol video di mobile nonaktif; kuis tetap bisa.</p>
        )}
        {url ? (
          <>
            <div className="qr-box">
              <QRCodeCanvas ref={canvas} value={url} size={1024} marginSize={2}
                style={{ width: "240px", height: "240px" }} />
            </div>
            <p className="qr-url">{url}</p>
          </>
        ) : (
          <p className="error">URL QR belum tersedia. Periksa MOBILE_QR_BASE_URL di backend.</p>
        )}
        {note && <p className="muted small-note" role="status">{note}</p>}
        <div className="row-end">
          <button type="button" className="btn ghost" disabled={!url} onClick={copy}>Salin link</button>
          <button type="button" className="btn ghost" disabled={!url} onClick={print}>Print</button>
          <button type="button" className="btn primary" disabled={!url} onClick={download}>Download PNG</button>
          <button type="button" className="btn ghost" onClick={onClose}>Tutup</button>
        </div>
      </div>
    </div>
  );
}
