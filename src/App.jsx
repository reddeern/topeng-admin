import { useState } from "react";
import "./index.css";

/* ---------- helper ---------- */
const uid = () => Math.random().toString(36).slice(2, 8);
const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
const ADMIN = { user: "admin", pass: "admin123" }; // login statis

/* ---------- data awal (pengganti database) ---------- */
const seed = {
  topeng: [
    { id: "t1", nama: "Topeng Klana", daerah: "Cirebon", kategori: "Tari", deskripsi: "Wajah merah melambangkan watak angkara." },
    { id: "t2", nama: "Topeng Panji", daerah: "Malang", kategori: "Tari", deskripsi: "Wajah putih halus, tokoh satria." },
    { id: "t3", nama: "Topeng Barong", daerah: "Bali", kategori: "Ritual", deskripsi: "Penjaga kebaikan dalam pertunjukan Barong." },
  ],
  kuis: [
    { id: "k1", pertanyaan: "Topeng Klana identik dengan warna?", jawaban: "Merah", tingkat: "Mudah" },
    { id: "k2", pertanyaan: "Topeng Panji berasal dari daerah?", jawaban: "Malang", tingkat: "Sedang" },
  ],
  video: [
    { id: "v1", judul: "Sejarah Topeng Malangan", topeng: "Topeng Panji", status: "Selesai" },
    { id: "v2", judul: "Makna Warna Topeng Klana", topeng: "Topeng Klana", status: "Diproses" },
  ],
  produk: [
    { id: "p1", nama: "Topeng Klana Mini", harga: 150000, stok: 12, kategori: "Souvenir" },
    { id: "p2", nama: "Topeng Panji Dekor", harga: 275000, stok: 5, kategori: "Dekorasi" },
  ],
  pesanan: [
    { id: "o1", pelanggan: "Sari Wulandari", produk: "Topeng Klana Mini", jumlah: 2, total: 300000, status: "Selesai", tanggal: "2026-09-12" },
    { id: "o2", pelanggan: "Budi Hartono", produk: "Topeng Panji Dekor", jumlah: 1, total: 275000, status: "Dikirim", tanggal: "2026-10-05" },
    { id: "o3", pelanggan: "Dewi Lestari", produk: "Topeng Klana Mini", jumlah: 1, total: 150000, status: "Diproses", tanggal: "2026-10-21" },
  ],
  pelanggan: [
    { id: "c1", nama: "Sari Wulandari", email: "sari@mail.com", kota: "Surabaya" },
    { id: "c2", nama: "Budi Hartono", email: "budi@mail.com", kota: "Malang" },
    { id: "c3", nama: "Dewi Lestari", email: "dewi@mail.com", kota: "Denpasar" },
  ],
};

/* ---------- ikon topeng (SVG sederhana) ---------- */
const Mask = ({ size = 56 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <path d="M32 4c14 0 24 9 24 24 0 17-10 32-24 32S8 45 8 28C8 13 18 4 32 4z" fill="#C08552" />
    <path d="M18 26c4-3 9-3 12 0-3 4-9 4-12 0zM34 26c3-3 8-3 12 0-3 4-9 4-12 0z" fill="#4B2E2B" />
    <path d="M24 44c5 4 11 4 16 0" stroke="#4B2E2B" strokeWidth="3" fill="none" strokeLinecap="round" />
  </svg>
);

/* ---------- Login ---------- */
function Login({ onLogin }) {
  const [f, setF] = useState({ user: "", pass: "" });
  const [err, setErr] = useState("");
  const submit = (e) => {
    e.preventDefault();
    if (f.user === ADMIN.user && f.pass === ADMIN.pass) onLogin();
    else setErr("Username atau kata sandi salah. Coba admin / admin123.");
  };
  return (
    <div className="login">
      <div className="login-art">
        <Mask size={120} />
        <h2>Warisan Topeng</h2>
        <p>Kelola koleksi, kuis, dan pesanan dalam satu tempat.</p>
      </div>
      <form className="login-form" onSubmit={submit}>
        <h1>Selamat datang</h1>
        <p className="muted">Masuk untuk membuka panel admin.</p>
        <label>Username
          <input value={f.user} onChange={(e) => setF({ ...f, user: e.target.value })} required />
        </label>
        <label>Kata sandi
          <input type="password" value={f.pass} onChange={(e) => setF({ ...f, pass: e.target.value })} required />
        </label>
        {err && <p className="error">{err}</p>}
        <button className="btn primary">Masuk</button>
      </form>
    </div>
  );
}

/* ---------- Halaman CRUD generik (Create, Read, Update, Delete, Search) ---------- */
function CrudPage({ title, noun, items, setItems, fields, update = true, searchable = true, extra }) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null); // null = tertutup
  const [del, setDel] = useState(null);

  const empty = () => Object.fromEntries(fields.map((f) => [f.key, f.options ? f.options[0] : f.type === "number" ? 0 : ""]));
  const shown = items.filter((r) => Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()));

  const save = (e) => {
    e.preventDefault();
    setItems(form.id ? items.map((r) => (r.id === form.id ? form : r)) : [...items, { ...form, id: uid() }]);
    setForm(null);
  };

  return (
    <section>
      <header className="page-head">
        <h1>{title}</h1>
        <div className="tools">
          {searchable && <input className="search" placeholder={`Cari ${noun}…`} value={q} onChange={(e) => setQ(e.target.value)} />}
          <button className="btn primary" onClick={() => setForm(empty())}>Tambah {noun}</button>
        </div>
      </header>
      {extra}
      <Table
        cols={fields.filter((f) => !f.hideInTable)}
        rows={shown}
        actions={(r) => (
          <>
            {update && <button className="btn ghost" onClick={() => setForm(r)}>Ubah</button>}
            <button className="btn danger" onClick={() => setDel(r)}>Hapus</button>
          </>
        )}
      />

      {form && (
        <div className="overlay" onClick={() => setForm(null)}>
          <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{form.id ? "Ubah" : "Tambah"} {noun}</h2>
            {fields.map((f) => (
              <label key={f.key}>{f.label}
                {f.options ? (
                  <select value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}>
                    {f.options.map((o) => <option key={o}>{o}</option>)}
                  </select>
                ) : f.type === "textarea" ? (
                  <textarea rows="3" value={form[f.key]} onChange={(e) => setForm({ ...form, [f.key]: e.target.value })} />
                ) : (
                  <input type={f.type || "text"} required value={form[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value })} />
                )}
              </label>
            ))}
            <div className="row-end">
              <button type="button" className="btn ghost" onClick={() => setForm(null)}>Batal</button>
              <button className="btn primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {del && (
        <div className="overlay" onClick={() => setDel(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <h2>Hapus {noun}?</h2>
            <p className="muted">Data ini akan dihapus dari daftar dan tidak bisa dikembalikan.</p>
            <div className="row-end">
              <button className="btn ghost" onClick={() => setDel(null)}>Batal</button>
              <button className="btn danger" onClick={() => { setItems(items.filter((r) => r.id !== del.id)); setDel(null); }}>Ya, hapus</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

function Table({ cols, rows, actions }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>No</th>
            {cols.map((c) => <th key={c.key}>{c.label}</th>)}
            {actions && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && <tr><td colSpan={cols.length + 2} className="empty">Tidak ada data yang cocok.</td></tr>}
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>{i + 1}</td>
              {cols.map((c) => (
                <td key={c.key}>
                  {c.key === "status" ? <span className={`badge ${r.status}`}>{r.status}</span>
                    : ["harga", "total"].includes(c.key) ? rupiah(r[c.key]) : r[c.key]}
                </td>
              ))}
              {actions && <td className="actions">{actions(r)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ---------- Dashboard ---------- */
function Dashboard({ d }) {
  const pendapatan = d.pesanan.reduce((s, o) => s + o.total, 0);
  const stats = [
    ["Koleksi topeng", d.topeng.length],
    ["Soal kuis", d.kuis.length],
    ["Pesanan masuk", d.pesanan.length],
    ["Total pendapatan", rupiah(pendapatan)],
  ];
  return (
    <section>
      <header className="page-head"><h1>Dashboard</h1></header>
      <div className="stats">
        {stats.map(([l, v]) => (
          <div className="stat" key={l}><strong>{v}</strong><span>{l}</span></div>
        ))}
      </div>
      <h2 className="sub">Pesanan terbaru</h2>
      <Table
        cols={[{ key: "pelanggan", label: "Pelanggan" }, { key: "produk", label: "Produk" }, { key: "total", label: "Total" }, { key: "status", label: "Status" }]}
        rows={[...d.pesanan].reverse().slice(0, 5)}
      />
    </section>
  );
}

/* ---------- Data pelanggan (Read + Search) ---------- */
function Pelanggan({ items }) {
  const [q, setQ] = useState("");
  const rows = items.filter((r) => Object.values(r).join(" ").toLowerCase().includes(q.toLowerCase()));
  return (
    <section>
      <header className="page-head">
        <h1>Data pelanggan</h1>
        <input className="search" placeholder="Cari pelanggan…" value={q} onChange={(e) => setQ(e.target.value)} />
      </header>
      <Table cols={[{ key: "nama", label: "Nama" }, { key: "email", label: "Email" }, { key: "kota", label: "Kota" }]} rows={rows} />
    </section>
  );
}

/* ---------- Laporan penjualan (Read + Search per bulan) ---------- */
function Laporan({ pesanan }) {
  const [bulan, setBulan] = useState(""); // format YYYY-MM
  const rows = pesanan.filter((o) => !bulan || o.tanggal.startsWith(bulan));
  const total = rows.reduce((s, o) => s + o.total, 0);
  return (
    <section>
      <header className="page-head">
        <h1>Laporan penjualan</h1>
        <label className="inline">Bulan
          <input type="month" value={bulan} onChange={(e) => setBulan(e.target.value)} />
        </label>
      </header>
      <div className="stats two">
        <div className="stat"><strong>{rows.length}</strong><span>Transaksi</span></div>
        <div className="stat"><strong>{rupiah(total)}</strong><span>Pendapatan</span></div>
      </div>
      <Table
        cols={[{ key: "tanggal", label: "Tanggal" }, { key: "pelanggan", label: "Pelanggan" }, { key: "produk", label: "Produk" }, { key: "jumlah", label: "Jml" }, { key: "total", label: "Total" }]}
        rows={rows}
      />
    </section>
  );
}

/* ---------- App + navigasi ---------- */
const MENU = [
  { items: [["dashboard", "Dashboard"]] },
  { label: "Mobile", items: [["topeng", "Data Topeng"], ["video", "Kelola Video AI"], ["kuis", "Kelola Kuis"]] },
  { label: "Web", items: [["laporan", "Laporan Keuangan"], ["produk", "Produk"], ["pesanan", "Pesanan"], ["pelanggan", "Pelanggan"]] },
];

/* ornamen batik/awan di dasar sidebar */
const Ornament = () => (
  <svg className="ornament" viewBox="0 0 250 120" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
    <g fill="none" stroke="#C08552" strokeWidth="2" strokeLinecap="round">
      <path d="M-10 110c20-40 55-40 60-10 5-25 40-30 55-5 10-30 50-35 65-5 12-22 45-22 60 0" />
      <path d="M-10 128c25-35 60-30 65 0 8-28 45-28 55 0 12-26 48-28 62 0 10-20 40-20 58 2" />
      <circle cx="50" cy="92" r="8" /><circle cx="160" cy="88" r="8" /><circle cx="105" cy="100" r="5" />
    </g>
  </svg>
);

export default function App() {
  const [auth, setAuth] = useState(false);
  const [page, setPage] = useState("dashboard");
  const [d, setD] = useState(seed);
  const set = (k) => (v) => setD((p) => ({ ...p, [k]: v }));

  if (!auth) return <Login onLogin={() => setAuth(true)} />;

  const pages = {
    dashboard: <Dashboard d={d} />,
    topeng: <CrudPage title="Data topeng" noun="topeng" items={d.topeng} setItems={set("topeng")}
      fields={[{ key: "nama", label: "Nama topeng" }, { key: "daerah", label: "Daerah asal" }, { key: "kategori", label: "Kategori", options: ["Tari", "Ritual", "Hiasan"] }, { key: "deskripsi", label: "Deskripsi", type: "textarea", hideInTable: true }]} />,
    video: <CrudPage title="Kelola video AI" noun="video" items={d.video} setItems={set("video")} update={false} searchable={false}
      fields={[{ key: "judul", label: "Judul video" }, { key: "topeng", label: "Topeng terkait" }, { key: "status", label: "Status", options: ["Diproses", "Selesai"] }]} />,
    kuis: <CrudPage title="Kelola kuis" noun="soal" items={d.kuis} setItems={set("kuis")}
      fields={[{ key: "pertanyaan", label: "Pertanyaan" }, { key: "jawaban", label: "Jawaban benar" }, { key: "tingkat", label: "Tingkat", options: ["Mudah", "Sedang", "Sulit"] }]} />,
    produk: <CrudPage title="Pengelolaan produk" noun="produk" items={d.produk} setItems={set("produk")}
      fields={[{ key: "nama", label: "Nama produk" }, { key: "harga", label: "Harga (Rp)", type: "number" }, { key: "stok", label: "Stok", type: "number" }, { key: "kategori", label: "Kategori", options: ["Souvenir", "Dekorasi", "Koleksi"] }]} />,
    pesanan: <CrudPage title="Pengelolaan pesanan" noun="pesanan" items={d.pesanan} setItems={set("pesanan")}
      fields={[{ key: "pelanggan", label: "Pelanggan" }, { key: "produk", label: "Produk" }, { key: "jumlah", label: "Jumlah", type: "number" }, { key: "total", label: "Total (Rp)", type: "number" }, { key: "tanggal", label: "Tanggal", type: "date" }, { key: "status", label: "Status", options: ["Diproses", "Dikirim", "Selesai"] }]} />,
    pelanggan: <Pelanggan items={d.pelanggan} />,
    laporan: <Laporan pesanan={d.pesanan} />,
  };

  return (
    <div className="shell">
      <aside className="side">
        <div className="brand">
          <Mask size={44} />
          <div><small>Informasi</small><span>Topeng Malang</span></div>
        </div>
        <nav>
          {MENU.map((g, i) => (
            <div className="group" key={i}>
              {g.label && <div className="group-label"><span>{g.label}</span></div>}
              {g.items.map(([k, l]) => (
                <button key={k} className={page === k ? "active" : ""} onClick={() => setPage(k)}>{l}</button>
              ))}
            </div>
          ))}
        </nav>
        <button className="logout" onClick={() => { setAuth(false); setPage("dashboard"); }}>Logout</button>
        <Ornament />
      </aside>
      <main>{pages[page]}</main>
    </div>
  );
}
