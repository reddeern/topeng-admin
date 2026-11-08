import CrudPage from "../components/CrudPage";
import { ProdukPreview } from "../components/Previews";
import { api } from "../api";

const fields = [
  { key: "nama", label: "Nama produk" },
  { key: "gambar", label: "Gambar produk", colLabel: "Gambar", type: "file", accept: "image/*",
    nameKey: "namaGambar", fileKey: "gambarFile", maxMB: 4,
    cell: (r) => (r.gambar ? <img className="thumb" src={r.gambar} alt={r.nama} /> : "-") },
  { key: "harga", label: "Harga (Rp)", type: "number" },
  { key: "stok", label: "Stok", type: "number" },
];

export default function Produk() {
  return <CrudPage title="Pengelolaan produk" noun="produk" fields={fields} preview={ProdukPreview} api={api.produk} paginated />;
}
