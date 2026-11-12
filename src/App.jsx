import { useEffect, useState } from "react";
import "./index.css";
import { api, setUnauthorizedHandler } from "./api";

import Ornament from "./components/Ornament";

// Halaman
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Topeng from "./pages/Topeng";
import Video from "./pages/Video";
import Kuis from "./pages/Kuis";
import Laporan from "./pages/Laporan";
import Produk from "./pages/Produk";
import Pesanan from "./pages/Pesanan";
import Pelanggan from "./pages/Pelanggan";

const MENU = [
  { items: [["dashboard", "Dashboard"]] },
  { label: "Mobile", items: [["topeng", "Data Topeng"], ["video", "Kelola Video AI"], ["kuis", "Kelola Kuis"]] },
  { label: "Web", items: [["laporan", "Laporan Penjualan"], ["produk", "Produk"], ["pesanan", "Pesanan"], ["pelanggan", "Pelanggan"]] },
];

const PAGES = {
  dashboard: Dashboard, topeng: Topeng, video: Video, kuis: Kuis,
  laporan: Laporan, produk: Produk, pesanan: Pesanan, pelanggan: Pelanggan,
};

export default function App() {
  const [auth, setAuth] = useState(api.auth.hasToken());
  const [page, setPage] = useState("dashboard");
  const [menuOpen, setMenuOpen] = useState(false);

  // Token kedaluwarsa/dicabut -> kembali ke halaman login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      api.auth.clear();
      setAuth(false);
      setPage("dashboard");
      setMenuOpen(false);
    });
  }, []);

  const logout = async () => {
    await api.auth.logout();
    setAuth(false);
    setPage("dashboard");
    setMenuOpen(false);
  };

  const go = (k) => {
    setPage(k);
    setMenuOpen(false);
  };

  if (!auth) return <Login onLogin={() => setAuth(true)} />;

  const Page = PAGES[page];
  return (
    <div className="shell">
      <header className="mobile-bar">
        <button
          type="button"
          className="menu-btn"
          aria-label="Buka menu navigasi"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          ☰
        </button>
        <div className="mobile-brand">
          <small>Informasi</small>
          <span>Topeng Malang</span>
        </div>
      </header>

      {menuOpen && <div className="side-backdrop" onClick={() => setMenuOpen(false)} />}

      <aside className={`side ${menuOpen ? "open" : ""}`}>
        <div className="brand">
          <div><small>Informasi</small><span>Topeng Malang</span></div>
          <button
            type="button"
            className="side-close"
            aria-label="Tutup menu"
            onClick={() => setMenuOpen(false)}
          >
            ✕
          </button>
        </div>
        <nav>
          {MENU.map((g, i) => (
            <div className="group" key={i}>
              {g.label && <div className="group-label"><span>{g.label}</span></div>}
              {g.items.map(([k, l]) => (
                <button key={k} className={page === k ? "active" : ""} onClick={() => go(k)}>{l}</button>
              ))}
            </div>
          ))}
        </nav>
        <button className="logout" onClick={logout}>Logout</button>
        <Ornament />
      </aside>

      <main><Page key={page} /></main>
    </div>
  );
}