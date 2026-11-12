const BASE = String(import.meta.env?.VITE_API_URL || "http://localhost:8000/api").replace(/\/+$/, "");
const TOKEN_KEY = "topeng_admin_token";

/* ---------- token ---------- */
let memToken = null;
const tokenStore = {
  get() {
    if (memToken) return memToken;
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(v) {
    memToken = v;
    try { localStorage.setItem(TOKEN_KEY, v); } catch { /* penyimpanan browser tidak tersedia */ }
  },
  clear() {
    memToken = null;
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* abaikan */ }
  },
};

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export class ApiError extends Error {
  constructor(message, status = 0, errors = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

/* ---------- transport ---------- */
async function send(method, url, headers, body, onProgress) {
  // XMLHttpRequest dipakai hanya bila butuh progress upload (fetch belum bisa)
  if (onProgress && typeof XMLHttpRequest !== "undefined") {
    return new Promise((resolve, reject) => {
      const x = new XMLHttpRequest();
      x.open(method, url);
      Object.entries(headers).forEach(([k, v]) => x.setRequestHeader(k, v));
      x.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      x.onload = () => resolve({ status: x.status, text: x.responseText });
      x.onerror = () => reject(new Error("network"));
      x.send(body);
    });
  }
  const r = await fetch(url, { method, headers, body });
  return { status: r.status, text: await r.text() };
}

async function request(method, path, { body, form, query, onProgress } = {}) {
  let url = BASE + path;
  if (query) {
    const p = new URLSearchParams();
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== "") p.append(k, v);
    });
    const s = p.toString();
    if (s) url += "?" + s;
  }

  const headers = { Accept: "application/json" };
  const token = tokenStore.get();
  if (token) headers.Authorization = "Bearer " + token;

  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  let res;
  try {
    res = await send(method, url, headers, payload, onProgress);
  } catch {
    throw new ApiError(`Tidak bisa terhubung ke server (${BASE}). Pastikan backend berjalan.`);
  }

  if (res.status === 204) return null;
  let data = null;
  try { data = res.text ? JSON.parse(res.text) : null; } catch { data = null; }
  if (res.status >= 200 && res.status < 300) return data;

  if (res.status === 401 && token) onUnauthorized();
  const first = data?.errors ? Object.values(data.errors).flat()[0] : null;
  const msg = first
    || (res.status >= 500 ? "Terjadi kesalahan di server." : data?.message)
    || `Permintaan gagal (${res.status}).`;
  throw new ApiError(msg, res.status, data?.errors || null);
}

/* ---------- util ---------- */
const basename = (p) => (p ? String(p).split("/").pop() : "");
const unwrap = (d) => {
  const rows = Array.isArray(d) ? d : d?.data || [];
  return { rows, page: d?.current_page || 1, lastPage: d?.last_page || 1, total: d?.total ?? rows.length };
};
const withMethodPut = (fd) => { fd.append("_method", "PUT"); return fd; };

/* Resource generik: multipart=true -> kirim FormData (untuk upload file) */
function resource(path, { fromApi, toBody, multipart = false }) {
  return {
    async list(params = {}) {
      const u = unwrap(await request("GET", path, { query: params }));
      return { ...u, rows: u.rows.map(fromApi) };
    },
    create: (f, opt = {}) => multipart
      ? request("POST", path, { form: toBody(f), onProgress: opt.onProgress })
      : request("POST", path, { body: toBody(f) }),
    // upload file via PUT multipart tidak jalan di PHP, jadi pakai POST + _method=PUT
    update: (id, f, opt = {}) => multipart
      ? request("POST", `${path}/${id}`, { form: withMethodPut(toBody(f)), onProgress: opt.onProgress })
      : request("PUT", `${path}/${id}`, { body: toBody(f) }),
    remove: (id) => request("DELETE", `${path}/${id}`),
  };
}

/* ---------- mapper ---------- */
const topengIn = (t) => ({
  id: t.topeng_id, nama: t.topeng_nama, sifat: t.sifat_topeng, deskripsi: t.topeng_deskripsi,
  gambar: t.topeng_gambar_url || "", namaGambar: basename(t.topeng_gambar),
  qrUrl: t.topeng_qr_url || "", videoStatus: t.videos?.[0]?.video_status || "",
  hasVideo: (t.videos || []).length > 0,
});
const topengOut = (f) => {
  const fd = new FormData();
  fd.append("topeng_nama", f.nama);
  fd.append("sifat_topeng", f.sifat);
  fd.append("topeng_deskripsi", f.deskripsi);
  if (f.gambarFile) fd.append("gambar", f.gambarFile);
  return fd;
};

const produkIn = (p) => ({
  id: p.produk_id, nama: p.produk_nama, harga: Number(p.produk_harga), stok: p.produk_stok,
  gambar: p.produk_gambar_url || "", namaGambar: basename(p.produk_gambar),
});
const produkOut = (f) => {
  const fd = new FormData();
  fd.append("produk_nama", f.nama);
  fd.append("produk_harga", f.harga);
  fd.append("produk_stok", f.stok);
  if (f.gambarFile) fd.append("gambar", f.gambarFile);
  return fd;
};

const kuisIn = (k) => ({
  id: k.kuis_id, pertanyaan: k.pertanyaan_teks,
  opsi: (k.pilihan || []).map((p) => ({
    teks: p.pilihan_jawaban, topengId: p.topeng_id, karakter: p.topeng?.topeng_nama || "",
  })),
});
const kuisOut = (f) => ({
  pertanyaan_teks: f.pertanyaan,
  pilihan: f.opsi.map((o) => ({ pilihan_jawaban: o.teks, topeng_id: Number(o.topengId) })),
});

const videoIn = (v) => ({
  id: v.video_id, judul: v.video_judul, topengId: v.topeng_id, topeng: v.topeng?.topeng_nama || "",
  namaFile: basename(v.video_file), url: v.video_url || "", status: v.video_status,
});
const videoOut = (f) => {
  const fd = new FormData();
  fd.append("topeng_id", f.topengId);
  fd.append("video_judul", f.judul);
  if (f.file) fd.append("video", f.file);
  return fd;
};

const pesananIn = (o) => ({
  id: o.pesanan_id, tanggal: o.pesanan_tanggal,
  pelangganId: o.pelanggan_id, pelanggan: o.pelanggan?.nama || "-", email: o.pelanggan?.email || "",
  penerima: o.pesanan_nama_penerima, noHp: o.pesanan_no_hp, alamat: o.pesanan_alamat_pengiriman,
  metode: o.pesanan_metode_pembayaran,
  subtotal: Number(o.pesanan_subtotal), total: Number(o.pesanan_total),
  status: o.pesanan_status, pembayaran: o.pesanan_status_pembayaran, buktiUrl: o.pesanan_bukti_url || "",
  items: (o.details || []).map((d) => ({
    id: d.detail_pesanan_id, produk: d.produk?.produk_nama || "-", jumlah: d.detail_jumlah,
    harga: Number(d.detail_harga), subtotal: Number(d.detail_subtotal),
  })),
});

const pelangganIn = (p) => ({
  id: p.pelanggan_id, nama: p.nama, username: p.username, email: p.email, jumlahPesanan: p.pesanan_count ?? 0,
});

/* ---------- API publik untuk halaman ---------- */
export const api = {
  auth: {
    hasToken: () => !!tokenStore.get(),
    clear: () => tokenStore.clear(),
    async login(username, password) {
      const d = await request("POST", "/admin/login", { body: { username, password } });
      tokenStore.set(d.token);
      return d.admin;
    },
    async logout() {
      try { await request("POST", "/admin/logout"); } catch { /* token sudah tidak berlaku, abaikan */ }
      tokenStore.clear();
    },
  },

  async dashboard() {
    const d = await request("GET", "/admin/dashboard");
    return {
      totalProduk: d.total_produk, totalPelanggan: d.total_pelanggan, totalPesanan: d.total_pesanan,
      pesananMenunggu: d.pesanan_menunggu, perluVerifikasi: d.pembayaran_menunggu_verifikasi,
      pendapatanBulanIni: Number(d.pendapatan_bulan_ini),
      stokMenipis: (d.stok_menipis || []).map((p) => ({ id: p.produk_id, nama: p.produk_nama, stok: p.produk_stok })),
      pesananTerbaru: (d.pesanan_terbaru || []).map(pesananIn),
    };
  },

  topeng: resource("/admin/topeng", { fromApi: topengIn, toBody: topengOut, multipart: true }),
  produk: resource("/admin/produk", { fromApi: produkIn, toBody: produkOut, multipart: true }),
  kuis: resource("/admin/kuis", { fromApi: kuisIn, toBody: kuisOut }),
  video: resource("/admin/video", { fromApi: videoIn, toBody: videoOut, multipart: true }),

  pelanggan: {
    async list(params = {}) {
      const u = unwrap(await request("GET", "/admin/pelanggan", { query: params }));
      return { ...u, rows: u.rows.map(pelangganIn) };
    },
  },

  pesanan: {
    async list(params = {}) {
      const u = unwrap(await request("GET", "/admin/pesanan", { query: params }));
      return { ...u, rows: u.rows.map(pesananIn) };
    },
    async show(id) { return pesananIn(await request("GET", `/admin/pesanan/${id}`)); },
    create: (f) => request("POST", "/admin/pesanan", {
      body: {
        pelanggan_id: Number(f.pelangganId),
        pesanan_nama_penerima: f.penerima,
        pesanan_no_hp: f.noHp,
        pesanan_alamat_pengiriman: f.alamat,
        pesanan_metode_pembayaran: f.metode,
        items: f.items.map((i) => ({ produk_id: Number(i.produkId), jumlah: Number(i.jumlah) })),
      },
    }),
    update: (id, f) => request("PUT", `/admin/pesanan/${id}`, {
      body: { pesanan_status: f.status, pesanan_status_pembayaran: f.pembayaran },
    }),
    remove: (id) => request("DELETE", `/admin/pesanan/${id}`),
  },

  async laporan({ tahun, bulan, tanggal_mulai, tanggal_selesai, page } = {}) {
    const d = await request("GET", "/admin/laporan/penjualan", {
      query: { tahun, bulan, tanggal_mulai, tanggal_selesai, page },
    });
    const p = unwrap(d.pesanan);
    return {
      jumlahPesanan: d.ringkasan.jumlah_pesanan,
      totalPendapatan: Number(d.ringkasan.total_pendapatan),
      totalItem: d.ringkasan.total_item_terjual,
      rincian: (d.rincian || []).map((r) => ({ periode: r.periode, jumlah: r.jumlah_pesanan, pendapatan: Number(r.pendapatan) })),
      terlaris: (d.produk_terlaris || []).map((r) => ({ id: r.produk_id, nama: r.produk_nama, terjual: Number(r.terjual), omzet: Number(r.omzet) })),
      pesanan: { ...p, rows: p.rows.map(pesananIn) },
    };
  },
};