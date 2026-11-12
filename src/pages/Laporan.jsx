import { useEffect, useMemo, useState } from "react";
import Table, { Pager } from "../components/Table";
import { api } from "../api";
import { rupiah, tanggal } from "../utils/helpers";

/* Laporan penjualan: hanya pesanan lunas dan tidak dibatalkan. */
export default function Laporan() {
  const [periode, setPeriode] = useState(""); // "YYYY-MM" dari month picker
  const [setahun, setSetahun] = useState(false);
  const [tanggalMulai, setTanggalMulai] = useState(""); // "YYYY-MM-DD"
  const [tanggalSelesai, setTanggalSelesai] = useState(""); // "YYYY-MM-DD"
  const [page, setPage] = useState(1);
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [loaded, setLoaded] = useState("");

  const params = useMemo(() => {
    if (tanggalMulai || tanggalSelesai) {
      return {
        tanggal_mulai: tanggalMulai || undefined,
        tanggal_selesai: tanggalSelesai || undefined,
      };
    }
    if (!periode) return {};
    const [t, b] = periode.split("-");
    return setahun ? { tahun: t } : { tahun: t, bulan: Number(b) };
  }, [periode, setahun, tanggalMulai, tanggalSelesai]);

  const key = `${JSON.stringify(params)}|${page}`;
  const loading = loaded !== key;

  useEffect(() => {
    let off = false;
    api.laporan({ ...params, page })
      .then((r) => { if (!off) { setD(r); setErr(""); } })
      .catch((e) => { if (!off) setErr(e.message); })
      .finally(() => { if (!off) setLoaded(key); });
    return () => { off = true; };
  }, [params, page, key]);

  const onChangeBulan = (val) => {
    setPeriode(val);
    if (val) {
      setTanggalMulai("");
      setTanggalSelesai("");
    }
    setPage(1);
  };

  const onChangeMulai = (val) => {
    setTanggalMulai(val);
    if (val) {
      setPeriode("");
      setSetahun(false);
      if (tanggalSelesai && tanggalSelesai < val) setTanggalSelesai(val);
    }
    setPage(1);
  };

  const onChangeSelesai = (val) => {
    setTanggalSelesai(val);
    if (val) {
      setPeriode("");
      setSetahun(false);
      if (!tanggalMulai || tanggalMulai > val) setTanggalMulai(val);
    }
    setPage(1);
  };

  const resetFilter = () => {
    setPeriode("");
    setSetahun(false);
    setTanggalMulai("");
    setTanggalSelesai("");
    setPage(1);
  };

  const judulRincian = (params.bulan || params.tanggal_mulai || params.tanggal_selesai)
    ? "Rincian per hari"
    : "Rincian per bulan";

  return (
    <section>
      <header className="page-head">
        <h1>Laporan penjualan</h1>
        <div className="tools">
          <label className="inline">Bulan
            <input type="month" value={periode} onChange={(e) => onChangeBulan(e.target.value)} />
          </label>
          <label className="inline check">
            <input type="checkbox" checked={setahun} disabled={!periode}
              onChange={(e) => { setSetahun(e.target.checked); setPage(1); }} />
            Satu tahun penuh
          </label>
          <label className="inline">Dari
            <input type="date" value={tanggalMulai} onChange={(e) => onChangeMulai(e.target.value)} />
          </label>
          <label className="inline">Sampai
            <input type="date" min={tanggalMulai || undefined} value={tanggalSelesai}
              onChange={(e) => onChangeSelesai(e.target.value)} />
          </label>
          <button className="btn ghost" onClick={resetFilter}>Reset</button>
        </div>
      </header>

      {err && <div className="banner error"><span>{err}</span></div>}
      {loading && !d && <p className="muted">Memuat data…</p>}

      {d && (
        <>
          <div className="stats three">
            <div className="stat"><strong>{d.jumlahPesanan}</strong><span>Transaksi lunas</span></div>
            <div className="stat"><strong>{rupiah(d.totalPendapatan)}</strong><span>Pendapatan</span></div>
            <div className="stat"><strong>{d.totalItem}</strong><span>Item terjual</span></div>
          </div>

          <h2 className="sub">{judulRincian}</h2>
          <Table
            cols={[
              { key: "periode", label: "Periode" },
              { key: "jumlah", label: "Transaksi" },
              { key: "pendapatan", label: "Pendapatan" },
            ]}
            rows={d.rincian.map((r) => ({ ...r, id: r.periode }))}
          />

          <h2 className="sub">Produk terjual</h2>
          <Table
            cols={[
              { key: "nama", label: "Produk" },
              { key: "terjual", label: "Terjual" },
              { key: "omzet", label: "Omzet" },
            ]}
            rows={d.terlaris}
          />

          <h2 className="sub">Daftar transaksi</h2>
          <Table
            cols={[
              { key: "tanggal", label: "Tanggal", cell: (r) => tanggal(r.tanggal) },
              { key: "pelanggan", label: "Pelanggan" },
              { key: "penerima", label: "Penerima" },
              { key: "total", label: "Total" },
            ]}
            rows={d.pesanan.rows}
            startNo={(page - 1) * 20}
          />
          <Pager page={page} lastPage={d.pesanan.lastPage} onChange={setPage} />
        </>
      )}
    </section>
  );
}