import CrudPage from "../components/CrudPage";
import { api } from "../api";

const fields = [
  { key: "nama", label: "Nama" },
  { key: "username", label: "Username" },
  { key: "email", label: "Email" },
  { key: "jumlahPesanan", label: "Jumlah pesanan" },
];

/* Sesuai sitemap: Data Pelanggan hanya Read + Search */
export default function Pelanggan() {
  return <CrudPage title="Data pelanggan" noun="pelanggan" fields={fields} api={api.pelanggan} paginated readOnly />;
}
