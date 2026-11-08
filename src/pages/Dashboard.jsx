import { useEffect, useState } from "react";
import Table from "../components/Table";
import { api } from "../api";
import { rupiah } from "../utils/helpers";

export default function Dashboard() {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [reload, setReload] = useState(0);

  useEffect(() => {
    let off = false;
    api.dashboard()
      .then((r) => { if (!off) { setD(r); setErr(""); } })
      .catch((e) => { if (!off) setErr(e.message); });
    return () => { off = true; };
  }, [reload]);

  const stats = d && [
    ["Produk", d.totalProduk],
    ["Pelanggan", d.totalPelanggan],
    ["Total pesanan", d.totalPesanan],
    ["Pesanan menunggu", d.pesananMenunggu],
    ["Perlu verifikasi bayar", d.perluVerifikasi],
    ["Pendapatan bulan ini", rupiah(d.pendapatanBulanIni)],
  ];

  return (
    <section>
      <header className="page-head"><h1>Dashboard</h1></header>
      {err && (
        <div className="banner error">
          <span>{err}</span>
          <button className="btn ghost" onClick={() => setReload((n) => n + 1)}>Coba lagi</button>
        </div>
      )}
      {!d && !err && <p className="muted">Memuat data…</p>}
      {d && (
        <>
          <div className="stats six">
            {stats.map(([l, v]) => (
              <div className="stat" key={l}><strong>{v}</strong><span>{l}</span></div>
            ))}
          </div>
          <h2 className="sub">Pesanan terbaru</h2>
          <Table
            cols={[
              { key: "pelanggan", label: "Pelanggan" },
              { key: "total", label: "Total" },
              { key: "status", label: "Status" },
              { key: "pembayaran", label: "Pembayaran" },
            ]}
            rows={d.pesananTerbaru}
          />
          <h2 className="sub">Stok menipis (5 atau kurang)</h2>
          <Table
            cols={[{ key: "nama", label: "Produk" }, { key: "stok", label: "Stok" }]}
            rows={d.stokMenipis}
          />
        </>
      )}
    </section>
  );
}
