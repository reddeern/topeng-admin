import CrudPage from "../components/CrudPage";
import { TopengPreview } from "../components/Previews";
import { api } from "../api";

const fields = [
  { key: "nama", label: "Nama topeng" },
  { key: "sifat", label: "Sifat utama (mis. Pemberani)" },
  { key: "deskripsi", label: "Deskripsi", type: "textarea" },
  { key: "gambar", label: "Gambar topeng (opsional)", colLabel: "Gambar", type: "file", accept: "image/*",
    nameKey: "namaGambar", fileKey: "gambarFile", maxMB: 4, hideInTable: true,
    cell: (r) => (r.gambar ? <img className="thumb" src={r.gambar} alt={r.nama} /> : "-") },
];

export default function Topeng() {
  return <CrudPage title="Data topeng" noun="topeng" fields={fields} preview={TopengPreview} api={api.topeng} />;
}
