import { useState } from "react";
import "./index.css";

/* ---------- helper ---------- */
const uid = () => Math.random().toString(36).slice(2, 8);
const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");
const ADMIN = { user: "admin", pass: "admin123" }; // login statis

/* ---------- data awal (pengganti database) ---------- */
const seed = {
  topeng: [
    { id: "t1", nama: "Panji Asmoro Bangun", sifat: "Bijaksana", deskripsi: "Satria halus yang tenang, adil, dan berwibawa." },
    { id: "t2", nama: "Gunungsari", sifat: "Pemberani", deskripsi: "Ksatria muda yang gagah berani dan setia." },
    { id: "t3", nama: "Klana Sewandana", sifat: "Ambisius", deskripsi: "Raja gagah yang penuh hasrat dan percaya diri." },
    { id: "t4", nama: "Dewi Sekartaji", sifat: "Lembut", deskripsi: "Putri anggun yang penyayang dan tulus." },
  ],
  kuis: [
    {
      id: "k1",
      pertanyaan: "Temanmu sedang dalam bahaya. Apa yang paling mungkin kamu lakukan?",
      opsi: [
        { teks: "Langsung menolong tanpa ragu", karakter: "Gunungsari" },
        { teks: "Menyusun rencana dengan tenang", karakter: "Panji Asmoro Bangun" },
        { teks: "Menemani dan menenangkannya", karakter: "Dewi Sekartaji" },
        { teks: "Mengambil alih dan memimpin", karakter: "Klana Sewandana" },
      ],
    },
  ],
  video: [
    { id: "v1", judul: "Sejarah Topeng Malangan", topeng: "Panji Asmoro Bangun", namaFile: "sejarah-malangan.mp4", url: "" },
    { id: "v2", judul: "Keberanian Gunungsari", topeng: "Gunungsari", namaFile: "gunungsari.mp4", url: "" },
  ],
  produk: [
    { id: "p1", nama: "Topeng Klana Mini", harga: 150000, stok: 12 },
    { id: "p2", nama: "Topeng Panji Dekor", harga: 275000, stok: 5 },
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

/* ---------- Kartu pratinjau per modul ---------- */
const PV = {
  topeng: (r) => (
    <div className="pv">
      <div className="pv-media"><Mask size={72} /></div>
      <h3>{r.nama || "Nama topeng"}</h3>
      <span className="badge">{r.sifat || "Sifat"}</span>
      <p>{r.deskripsi || "Deskripsi akan tampil di sini."}</p>
    </div>
  ),
  video: (r) => (
    <div className="pv">
      <div className="pv-media video">
        {r.url ? <video src={r.url} controls /> : <span>Belum ada video</span>}
      </div>
      <h3>{r.judul || "Judul video"}</h3>
      <p className="muted">Topeng terkait: {r.topeng || "-"}</p>
    </div>
  ),
  kuis: (r) => (
    <div className="pv">
      <p className="pv-q">{r.pertanyaan || "Pertanyaan akan tampil di sini."}</p>
      {r.opsi.map((o, i) => (
        <div className="pv-opt" key={i}>
          <span>{o.teks || `Pilihan ${i + 1}`}</span>
          <em>{o.karakter}</em>
        </div>
      ))}
      <p className="muted small-note">Nama karakter hanya terlihat oleh admin.</p>
    </div>
  ),
  produk: (r) => (
    <div className="pv">
      <div className="pv-media">
        {r.gambar ? <img src={r.gambar} alt={r.nama} /> : <Mask size={72} />}
      </div>
      <h3>{r.nama || "Nama produk"}</h3>
      <p className="pv-price">{rupiah(r.harga)}</p>
      <p className="muted">Stok: {r.stok}</p>
    </div>
  ),
  pesanan: (r) => (
    <div className="pv">
      <h3>{r.pelanggan || "Pelanggan"}</h3>
      <p className="muted">{r.tanggal || "-"}</p>
      <div className="pv-opt"><span>{r.produk || "Produk"} × {r.jumlah}</span><em>{rupiah(r.total)}</em></div>
      <span className={`badge ${r.status}`}>{r.status}</span>
    </div>
  ),
};

/* ---------- Halaman CRUD generik (Create, Read, Update, Delete, Search + pratinjau) ---------- */
function CrudPage({ title, noun, items, setItems, fields, preview, update = true, searchable = true }) {
  const [q, setQ] = useState("");
  const [form, setForm] = useState(null); // null = tertutup
  const [showPv, setShowPv] = useState(false);
  const [view, setView] = useState(null);
  const [del, setDel] = useState(null);

  const empty = () =>
    Object.fromEntries(
      fields.map((f) => [
        f.key,
        f.type === "choices" ? Array.from({ length: 4 }, () => ({ teks: "", karakter: f.options[0] || "" }))
          : f.options ? f.options[0] || ""
          : f.type === "number" ? 0 : "",
      ])
    );
  const openForm = (data) => { setShowPv(false); setForm(data); };
  const shown = items.filter((r) => JSON.stringify(r).toLowerCase().includes(q.toLowerCase()));

  const save = (e) => {
    e.preventDefault();
    setItems(form.id ? items.map((r) => (r.id === form.id ? form : r)) : [...items, { ...form, id: uid() }]);
    setForm(null);
  };

  const renderField = (f) => {
    const set = (v) => setForm({ ...form, [f.key]: v });
    if (f.type === "choices") {
      const upd = (i, patch) => set(form[f.key].map((x, j) => (j === i ? { ...x, ...patch } : x)));
      return (
        <fieldset key={f.key}>
          <legend>{f.label}</legend>
          <p className="muted small-note">{f.hint}</p>
          {form[f.key].map((o, i) => (
            <div className="opt-row" key={i}>
              <input required placeholder={`Pilihan ${i + 1}`} value={o.teks} onChange={(e) => upd(i, { teks: e.target.value })} />
              <select value={o.karakter} onChange={(e) => upd(i, { karakter: e.target.value })}>
                {f.options.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          ))}
        </fieldset>
      );
    }
    if (f.type === "file") {
      return (
        <label key={f.key}>{f.label}
          <input type="file" accept={f.accept} required={f.required && !form.id}
            onChange={(e) => {
              const file = e.target.files[0];
              if (file) setForm({ ...form, [f.key]: URL.createObjectURL(file), [f.nameKey]: file.name });
            }} />
          {form[f.nameKey] && <span className="muted small-note">Dipilih: {form[f.nameKey]}</span>}
          {f.accept.startsWith("image") && form[f.key] && <img className="thumb big" src={form[f.key]} alt="Pratinjau gambar" />}
        </label>
      );
    }
    return (
      <label key={f.key}>{f.label}
        {f.options ? (
          <select value={form[f.key]} onChange={(e) => set(e.target.value)}>
            {f.options.map((o) => <option key={o}>{o}</option>)}
          </select>
        ) : f.type === "textarea" ? (
          <textarea rows="3" value={form[f.key]} onChange={(e) => set(e.target.value)} />
        ) : (
          <input type={f.type || "text"} required value={form[f.key]}
            onChange={(e) => set(f.type === "number" ? Number(e.target.value) : e.target.value)} />
        )}
      </label>
    );
  };

  return (
    <section>
      <header className="page-head">
        <h1>{title}</h1>
        <div className="tools">
          {searchable && <input className="search" placeholder={`Cari ${noun}…`} value={q} onChange={(e) => setQ(e.target.value)} />}
          <button className="btn primary" onClick={() => openForm(empty())}>Tambah {noun}</button>
        </div>
      </header>
      <Table
        cols={fields.filter((f) => !f.hideInTable)}
        rows={shown}
        actions={(r) => (
          <>
            <button className="btn ghost" onClick={() => setView(r)}>Lihat</button>
            {update && <button className="btn ghost" onClick={() => openForm(r)}>Ubah</button>}
            <button className="btn danger" onClick={() => setDel(r)}>Hapus</button>
          </>
        )}
      />

      {form && (
        <div className="overlay" onClick={() => setForm(null)}>
          <form className={`modal ${showPv ? "wide" : ""}`} onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{form.id ? "Ubah" : "Tambah"} {noun}</h2>
            <div className={showPv ? "split" : ""}>
              <div className="fields">{fields.filter((f) => !f.formHidden).map(renderField)}</div>
              {showPv && <aside className="pv-wrap"><small>Pratinjau</small>{preview(form)}</aside>}
            </div>
            <div className="row-end">
              <button type="button" className="btn ghost" onClick={() => setShowPv(!showPv)}>
                {showPv ? "Sembunyikan pratinjau" : "Pratinjau"}
              </button>
              <button type="button" className="btn ghost" onClick={() => setForm(null)}>Batal</button>
              <button className="btn primary">Simpan</button>
            </div>
          </form>
        </div>
      )}

      {view && (
        <div className="overlay" onClick={() => setView(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <small className="muted">Pratinjau {noun}</small>
            {preview(view)}
            <div className="row-end"><button className="btn primary" onClick={() => setView(null)}>Tutup</button></div>
          </div>
        </div>
      )}

      {del && (
        <div className="overlay" onClick={() => setDel(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <h2>Hapus {noun}?</h2>
            {preview(del)}
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
            {cols.map((c) => <th key={c.key}>{c.colLabel || c.label}</th>)}
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
                  {c.cell ? c.cell(r) : c.key === "status" ? <span className={`badge ${r.status}`}>{r.status}</span>
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
  const [tanggal, setTanggal] = useState(""); // format YYYY-MM-DD dari date picker
  const [sebulan, setSebulan] = useState(false); // true = tampilkan satu bulan penuh
  const prefix = sebulan ? tanggal.slice(0, 7) : tanggal;
  const rows = pesanan.filter((o) => o.tanggal.startsWith(prefix));
  const total = rows.reduce((s, o) => s + o.total, 0);
  return (
    <section>
      <header className="page-head">
        <h1>Laporan keuangan</h1>
        <div className="tools">
          <label className="inline">Tanggal
            <input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
          </label>
          <label className="inline check">
            <input type="checkbox" checked={sebulan} disabled={!tanggal} onChange={(e) => setSebulan(e.target.checked)} />
            Satu bulan penuh
          </label>
          <button className="btn ghost" onClick={() => { setTanggal(""); setSebulan(false); }}>Reset</button>
        </div>
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
  const namaTopeng = d.topeng.map((t) => t.nama);

  if (!auth) return <Login onLogin={() => setAuth(true)} />;

  const pages = {
    dashboard: <Dashboard d={d} />,
    topeng: <CrudPage title="Data topeng" noun="topeng" items={d.topeng} setItems={set("topeng")} preview={PV.topeng}
      fields={[{ key: "nama", label: "Nama topeng" }, { key: "sifat", label: "Sifat utama (mis. Pemberani)" }, { key: "deskripsi", label: "Deskripsi", type: "textarea", hideInTable: true }]} />,
    video: <CrudPage title="Kelola video AI" noun="video" items={d.video} setItems={set("video")} preview={PV.video} update={false} searchable={false}
      fields={[{ key: "judul", label: "Judul video" }, { key: "topeng", label: "Topeng terkait", options: namaTopeng }, { key: "url", label: "File video AI", type: "file", accept: "video/*", nameKey: "namaFile", required: true, hideInTable: true }, { key: "namaFile", label: "File", formHidden: true }]} />,
    kuis: <CrudPage title="Kelola kuis kepribadian" noun="pertanyaan" items={d.kuis} setItems={set("kuis")} preview={PV.kuis}
      fields={[
        { key: "pertanyaan", label: "Pertanyaan" },
        { key: "opsi", label: "Pilihan jawaban", colLabel: "Karakter yang dituju", type: "choices", options: namaTopeng,
          hint: "Tiap pilihan mengarah ke satu karakter topeng. Tidak ada jawaban benar atau salah.",
          cell: (r) => [...new Set(r.opsi.map((o) => o.karakter))].join(", ") },
      ]} />,
    produk: <CrudPage title="Pengelolaan produk" noun="produk" items={d.produk} setItems={set("produk")} preview={PV.produk}
      fields={[{ key: "nama", label: "Nama produk" },
        { key: "gambar", label: "Gambar produk", colLabel: "Gambar", type: "file", accept: "image/*", nameKey: "namaGambar",
          cell: (r) => (r.gambar ? <img className="thumb" src={r.gambar} alt={r.nama} /> : "-") },
        { key: "harga", label: "Harga (Rp)", type: "number" }, { key: "stok", label: "Stok", type: "number" }]} />,
    pesanan: <CrudPage title="Pengelolaan pesanan" noun="pesanan" items={d.pesanan} setItems={set("pesanan")} preview={PV.pesanan}
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