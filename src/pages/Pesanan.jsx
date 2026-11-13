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
          <label>Status pembayaran
            <select value={bayar} onChange={(e) => setBayar(e.target.value)}>
              {BAYAR.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
            </select>
          </label>
          <label>Status pesanan
            <select value={status} disabled={dibatalkan} onChange={(e) => setStatus(e.target.value)}>
              {STATUS.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
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

/* ---------- halaman ---------- */
export default function Pesanan() {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState("");
  const [err, setErr] = useState("");
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const [fStatus, setFStatus] = useState("");
  const [fBayar, setFBayar] = useState("");
  const [fTanggal, setFTanggal] = useState("");
  const [fBulan, setFBulan] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [reload, setReload] = useState(0);
  const key = `${dq}|${fStatus}|${fBayar}|${fTanggal}|${fBulan}|${page}|${reload}`;
  const loading = loaded !== key;
  const [detail, setDetail] = useState(null);
  const refresh = () => setReload((n) => n + 1);

  useEffect(() => {
    let off = false;
    api.pesanan.list({
      q: dq || undefined,
      status: fStatus || undefined,
      pembayaran: fBayar || undefined,
      tanggal: fTanggal || undefined,
      bulan: fBulan || undefined,
      page,
    })
      .then((r) => { if (!off) { setRows(r.rows); setLastPage(r.lastPage); setErr(""); } })
      .catch((e) => { if (!off) setErr(e.message); })
      .finally(() => { if (!off) setLoaded(key); });
    return () => { off = true; };
  }, [dq, fStatus, fBayar, fTanggal, fBulan, page, reload, key]);

  const openDetail = async (r) => {
    try { setDetail(await api.pesanan.show(r.id)); } catch (e) { setErr(e.message); }
  };

  const filteredRows = rows.filter((r) => {
    const raw = String(r.tanggal || "");
    if (fTanggal && !raw.startsWith(fTanggal)) return false;
    if (fBulan && !raw.startsWith(fBulan)) return false;
    return true;
  });

  return (
    <section>
      <header className="page-head">
        <h1>Pengelolaan pesanan</h1>
        <div className="tools">
          <input className="search" placeholder="Cari pesanan…" value={q} onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          <input
            type="date"
            className="filter"
            aria-label="Filter tanggal pesanan"
            title="Filter berdasarkan tanggal"
            value={fTanggal}
            onChange={(e) => {
              setFTanggal(e.target.value);
              if (e.target.value) setFBulan("");
              setPage(1);
            }}
          />
          <input
            type="month"
            className="filter"
            aria-label="Filter bulan pesanan"
            title="Filter berdasarkan bulan"
            value={fBulan}
            onChange={(e) => {
              setFBulan(e.target.value);
              if (e.target.value) setFTanggal("");
              setPage(1);
            }}
          />
          <select className="filter" aria-label="Filter status pesanan" value={fStatus} onChange={(e) => { setFStatus(e.target.value); setPage(1); }}>
            <option value="">Semua status</option>
            {STATUS.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
          </select>
          <select className="filter" aria-label="Filter status pembayaran" value={fBayar} onChange={(e) => { setFBayar(e.target.value); setPage(1); }}>
            <option value="">Semua pembayaran</option>
            {BAYAR.map((s) => <option key={s} value={s}>{labelStatus(s)}</option>)}
          </select>
          {(fTanggal || fBulan) && (
            <button type="button" className="btn ghost" onClick={() => { setFTanggal(""); setFBulan(""); setPage(1); }}>
              Reset tanggal
            </button>
          )}
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
        rows={filteredRows}
        loading={loading}
        startNo={(page - 1) * 20}
        actions={(r) => (
          <button className="btn ghost" onClick={() => openDetail(r)}>Ubah</button>
        )}
      />
      <Pager page={page} lastPage={lastPage} onChange={setPage} />

      {detail && <DetailModal data={detail} onClose={() => setDetail(null)} onSaved={() => { setDetail(null); refresh(); }} />}
    </section>
  );
}