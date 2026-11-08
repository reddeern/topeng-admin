import { useEffect, useState } from "react";
import Table, { Pager, StatusBadge } from "../components/Table";
import { api } from "../api";
import { labelStatus, rupiah, tanggal, useDebounce } from "../utils/helpers";

const STATUS = ["menunggu", "diproses", "dikirim", "selesai", "dibatalkan"];
const BAYAR = ["belum_bayar", "menunggu_verifikasi", "lunas", "ditolak"];

/* ---------- detail + ubah status ---------- */
function DetailModal({ data, onClose, onSaved }) {
  const [status, setStatus] = useState(data.status);
  const [bayar, setBayar] = useState(data.pembayaran);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const dibatalkan = data.status === "dibatalkan";

  const save = async () => {
    setSaving(true); setErr("");
    try {
      await api.pesanan.update(data.id, { status, pembayaran: bayar });
      onSaved();
    } catch (e) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal wide" onClick={(e) => e.stopPropagation()}>
        <h2>Pesanan #{data.id}</h2>
        <div className="info-grid">
          <div><small>Tanggal</small><p>{tanggal(data.tanggal)}</p></div>
          <div><small>Pelanggan</small><p>{data.pelanggan}</p></div>
          <div><small>Penerima</small><p>{data.penerima} · {data.noHp}</p></div>
          <div><small>Metode pembayaran</small><p>{data.metode}</p></div>
          <div className="full"><small>Alamat pengiriman</small><p>{data.alamat}</p></div>
        </div>

        <Table
          cols={[
            { key: "produk", label: "Produk" },
            { key: "jumlah", label: "Jml" },
            { key: "harga", label: "Harga" },
            { key: "subtotal", label: "Subtotal", cell: (r) => rupiah(r.subtotal) },
          ]}
          rows={data.items}
        />
        <p className="total-line">Total: <strong>{rupiah(data.total)}</strong></p>

        <div className="info-grid">
          <div className="full">
            <small>Bukti pembayaran</small>
            {data.buktiUrl
              ? <a href={data.buktiUrl} target="_blank" rel="noreferrer"><img className="thumb big" src={data.buktiUrl} alt="Bukti pembayaran" /></a>
              : <p className="muted">Belum diunggah pelanggan.</p>}
          </div>
          <label>Status pesanan
            <select value={status} disabled={dibatalkan} onChange={(e) => setStatus(e.target.value)}>
              {STATUS.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
            </select>
          </label>
          <label>Status pembayaran
            <select value={bayar} onChange={(e) => setBayar(e.target.value)}>
              {BAYAR.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
            </select>
          </label>
        </div>
        {dibatalkan && <p className="muted small-note">Pesanan yang sudah dibatalkan tidak bisa diaktifkan kembali.</p>}
        {status === "dibatalkan" && !dibatalkan && <p className="muted small-note">Membatalkan pesanan akan mengembalikan stok produk.</p>}
        {err && <p className="error" role="alert">{err}</p>}
        <div className="row-end">
          <button className="btn ghost" onClick={onClose}>Tutup</button>
          <button className="btn primary" disabled={saving} onClick={save}>{saving ? "Menyimpan…" : "Simpan perubahan"}</button>
        </div>
      </div>
    </div>
  );
}

/* ---------- buat pesanan manual ---------- */
function CreateModal({ onClose, onSaved }) {
  const [produk, setProduk] = useState([]);
  const [pel, setPel] = useState([]);
  const [qp, setQp] = useState("");
  const dqp = useDebounce(qp);
  const [f, setF] = useState({ pelangganId: "", penerima: "", noHp: "", alamat: "", metode: "" });
  const [items, setItems] = useState([{ produkId: "", jumlah: 1 }]);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    api.produk.list({ per_page: 100 }).then((r) => setProduk(r.rows)).catch((e) => setErr(e.message));
  }, []);
  useEffect(() => {
    api.pelanggan.list({ q: dqp || undefined, per_page: 100 }).then((r) => setPel(r.rows)).catch((e) => setErr(e.message));
  }, [dqp]);

  const harga = (id) => produk.find((p) => String(p.id) === String(id))?.harga || 0;
  const total = items.reduce((s, i) => s + harga(i.produkId) * Number(i.jumlah || 0), 0);
  const setItem = (idx, patch) => setItems(items.map((x, i) => (i === idx ? { ...x, ...patch } : x)));

  const submit = async (e) => {
    e.preventDefault();
    setSaving(true); setErr("");
    try {
      await api.pesanan.create({ ...f, items });
      onSaved();
    } catch (error) {
      setErr(error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="overlay" onClick={() => !saving && onClose()}>
      <form className="modal wide" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Tambah pesanan manual</h2>
        <div className="fields">
          <label>Cari pelanggan
            <input placeholder="Ketik nama, username, atau email…" value={qp} onChange={(e) => setQp(e.target.value)} />
          </label>
          <label>Pelanggan
            <select required value={f.pelangganId} onChange={(e) => setF({ ...f, pelangganId: e.target.value })}>
              <option value="">Pilih pelanggan…</option>
              {pel.map((p) => <option key={p.id} value={p.id}>{p.nama} ({p.email})</option>)}
            </select>
          </label>
          <label>Nama penerima
            <input required value={f.penerima} onChange={(e) => setF({ ...f, penerima: e.target.value })} />
          </label>
          <label>No. HP
            <input required value={f.noHp} onChange={(e) => setF({ ...f, noHp: e.target.value })} />
          </label>
          <label>Alamat pengiriman
            <textarea rows="2" required value={f.alamat} onChange={(e) => setF({ ...f, alamat: e.target.value })} />
          </label>
          <label>Metode pembayaran
            <input required placeholder="mis. Transfer BCA / COD" value={f.metode} onChange={(e) => setF({ ...f, metode: e.target.value })} />
          </label>

          <fieldset>
            <legend>Produk dipesan</legend>
            {items.map((it, i) => (
              <div className="opt-row" key={i}>
                <select required aria-label={`Produk ${i + 1}`} value={it.produkId} onChange={(e) => setItem(i, { produkId: e.target.value })}>
                  <option value="">Pilih produk…</option>
                  {produk.map((p) => <option key={p.id} value={p.id}>{p.nama} — {rupiah(p.harga)} (stok {p.stok})</option>)}
                </select>
                <div className="qty-row">
                  <input type="number" min="1" required aria-label={`Jumlah ${i + 1}`} value={it.jumlah}
                    onChange={(e) => setItem(i, { jumlah: e.target.value })} />
                  {items.length > 1 && (
                    <button type="button" className="btn danger" onClick={() => setItems(items.filter((_, j) => j !== i))}>×</button>
                  )}
                </div>
              </div>
            ))}
            <button type="button" className="btn ghost" onClick={() => setItems([...items, { produkId: "", jumlah: 1 }])}>+ Tambah produk</button>
          </fieldset>
        </div>
        <p className="total-line">Perkiraan total: <strong>{rupiah(total)}</strong></p>
        {err && <p className="error" role="alert">{err}</p>}
        <div className="row-end">
          <button type="button" className="btn ghost" disabled={saving} onClick={onClose}>Batal</button>
          <button className="btn primary" disabled={saving}>{saving ? "Menyimpan…" : "Simpan pesanan"}</button>
        </div>
      </form>
    </div>
  );
}

/* ---------- halaman ---------- */
export default function Pesanan() {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState("");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const [fStatus, setFStatus] = useState("");
  const [fBayar, setFBayar] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [reload, setReload] = useState(0);
  const key = `${dq}|${fStatus}|${fBayar}|${page}|${reload}`;
  const loading = loaded !== key;
  const [detail, setDetail] = useState(null);
  const [creating, setCreating] = useState(false);
  const [del, setDel] = useState(null);
  const [delErr, setDelErr] = useState("");
  const [deleting, setDeleting] = useState(false);
  const refresh = () => setReload((n) => n + 1);

  useEffect(() => {
    let off = false;
    api.pesanan.list({ q: dq || undefined, status: fStatus, pembayaran: fBayar, page })
      .then((r) => { if (!off) { setRows(r.rows); setLastPage(r.lastPage); setErr(""); } })
      .catch((e) => { if (!off) setErr(e.message); })
      .finally(() => { if (!off) setLoaded(key); });
    return () => { off = true; };
  }, [dq, fStatus, fBayar, page, reload, key]);

  const openDetail = async (r) => {
    try { setDetail(await api.pesanan.show(r.id)); } catch (e) { setErr(e.message); }
  };

  const remove = async () => {
    setDeleting(true); setDelErr("");
    try {
      await api.pesanan.remove(del.id);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      setDel(null);
      refresh();
    } catch (e) {
      setDelErr(e.message);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <section>
      <header className="page-head">
        <h1>Pengelolaan pesanan</h1>
        <div className="tools">
          <input className="search" placeholder="Cari pesanan…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <select className="filter" aria-label="Filter status pesanan" value={fStatus} onChange={(e) => { setFStatus(e.target.value); setPage(1); }}>
            <option value="">Semua status</option>
            {STATUS.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
          </select>
          <select className="filter" aria-label="Filter status pembayaran" value={fBayar} onChange={(e) => { setFBayar(e.target.value); setPage(1); }}>
            <option value="">Semua pembayaran</option>
            {BAYAR.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
          </select>
          <button className="btn primary" onClick={() => setCreating(true)}>Tambah pesanan</button>
        </div>
      </header>

      {err && (
        <div className="banner error">
          <span>{err}</span>
          <button className="btn ghost" onClick={refresh}>Coba lagi</button>
        </div>
      )}

      <Table
        cols={[
          { key: "tanggal", label: "Tanggal", cell: (r) => tanggal(r.tanggal) },
          { key: "pelanggan", label: "Pelanggan" },
          { key: "total", label: "Total" },
          { key: "status", label: "Status" },
          { key: "pembayaran", label: "Pembayaran", cell: (r) => <StatusBadge status={r.pembayaran} /> },
        ]}
        rows={rows}
        loading={loading}
        startNo={(page - 1) * 20}
        actions={(r) => (
          <>
            <button className="btn ghost" onClick={() => openDetail(r)}>Lihat / Ubah</button>
            <button className="btn danger" onClick={() => { setDelErr(""); setDel(r); }}>Hapus</button>
          </>
        )}
      />
      <Pager page={page} lastPage={lastPage} onChange={setPage} />

      {detail && <DetailModal data={detail} onClose={() => setDetail(null)} onSaved={() => { setDetail(null); refresh(); }} />}
      {creating && <CreateModal onClose={() => setCreating(false)} onSaved={() => { setCreating(false); setPage(1); refresh(); }} />}

      {del && (
        <div className="overlay" onClick={() => !deleting && setDel(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <h2>Hapus pesanan #{del.id}?</h2>
            <p className="muted">Pesanan atas nama {del.pelanggan} sebesar {rupiah(del.total)} akan dihapus. Stok dikembalikan bila pesanan belum dibatalkan.</p>
            {delErr && <p className="error" role="alert">{delErr}</p>}
            <div className="row-end">
              <button className="btn ghost" disabled={deleting} onClick={() => setDel(null)}>Batal</button>
              <button className="btn danger" disabled={deleting} onClick={remove}>{deleting ? "Menghapus…" : "Ya, hapus"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
