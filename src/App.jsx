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

const getPageFromPath = (pathname) => {
  const slug = pathname.replace(/^\/+|\/+$/g, "");
  return PAGES[slug] ? slug : "dashboard";
};

export default function App() {
  const [auth, setAuth] = useState(api.auth.hasToken());
  const [page, setPage] = useState(() => getPageFromPath(window.location.pathname));
  const [menuOpen, setMenuOpen] = useState(false);

  // Sinkronkan URL saat pertama kali dibuka atau status login berubah
  useEffect(() => {
    if (!auth) {
      if (window.location.pathname !== "/login") {
        window.history.replaceState(null, "", "/login");
      }
      return;
    }
    const slug = window.location.pathname.replace(/^\/+|\/+$/g, "");
    if (!PAGES[slug]) {
      window.history.replaceState(null, "", `/${page}`);
    }
  }, [auth, page]);

  // Dengarkan tombol Back / Forward browser
  useEffect(() => {
    const onPopState = () => {
      if (!api.auth.hasToken()) return;
      setPage(getPageFromPath(window.location.pathname));
      setMenuOpen(false);
    };
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Token kedaluwarsa/dicabut -> kembali ke halaman login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      api.auth.clear();
      setAuth(false);
      setPage("dashboard");
      setMenuOpen(false);
      window.history.replaceState(null, "", "/login");
    });
  }, []);

  const handleLogin = () => {
    window.history.replaceState(null, "", `/${page}`);
    setAuth(true);
  };

  const logout = async () => {
    await api.auth.logout();
    setAuth(false);
    setPage("dashboard");
    setMenuOpen(false);
    window.history.pushState(null, "", "/login");
  };

  const go = (k) => {
    if (window.location.pathname !== `/${k}`) {
      window.history.pushState(null, "", `/${k}`);
    }
    setPage(k);
    setMenuOpen(false);
  };

  if (!auth) return <Login onLogin={handleLogin} />;

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