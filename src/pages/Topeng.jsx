import { useState } from "react";
import CrudPage from "../components/CrudPage";
import QrModal from "../components/QrModal";
import { TopengPreview } from "../components/Previews";
import { api } from "../api";

const videoLabel = (s) => (s === "selesai" ? "Video siap" : s || "Belum ada video");

const truncate = (text, max = 65) =>
  !text ? "-" : text.length > max ? `${text.slice(0, max)}...` : text;

const fields = [
  { key: "nama", label: "Nama topeng" },
  { key: "sifat", label: "Sifat utama (mis. Pemberani)" },
  {
    key: "deskripsi",
    label: "Deskripsi",
    type: "textarea",
    maxLength: 1000,
    cell: (r) => <span title={r.deskripsi}>{truncate(r.deskripsi, 65)}</span>,
  },
  {
    key: "videoStatus",
    label: "Status video",
    formHidden: true,
    cell: (r) => (
      <span className={`badge ${r.videoStatus || "kosong"}`}>
        {videoLabel(r.videoStatus)}
      </span>
    ),
  },
  {
    key: "gambar",
    label: "Gambar topeng (opsional)",
    colLabel: "Gambar",
    type: "file",
    accept: "image/*",
    nameKey: "namaGambar",
    fileKey: "gambarFile",
    maxMB: 4,
    hideInTable: true,
    cell: (r) =>
      r.gambar ? <img className="thumb" src={r.gambar} alt={r.nama} /> : "-",
  },
];

export default function Topeng() {
  const [qr, setQr] = useState(null);

  return (
    <>
      <CrudPage
        title="Data topeng"
        noun="topeng"
        fields={fields}
        preview={TopengPreview}
        api={api.topeng}
        extraActions={(r) => (
          <button className="btn ghost" onClick={() => setQr(r)}>
            QR
          </button>
        )}
      />
      {qr && <QrModal row={qr} onClose={() => setQr(null)} />}
    </>
  );
}