import Mask from "./Mask";
import { rupiah } from "../utils/helpers";

export function TopengPreview({ r }) {
  return (
    <div className="pv">
      <div className="pv-media">
        {r.gambar ? <img src={r.gambar} alt={r.nama} /> : <Mask size={72} />}
      </div>
      <h3>{r.nama || "Nama topeng"}</h3>
      <span className="badge">{r.sifat || "Sifat"}</span>
      <p>{r.deskripsi || "Deskripsi akan tampil di sini."}</p>
    </div>
  );
}

export function VideoPreview({ r }) {
  return (
    <div className="pv">
      <div className="pv-media video" style={{
        width: '100%',
        maxWidth: '280px', // Membatasi lebar agar tingginya pas di layar
        margin: '0 auto', // Memastikan posisinya di tengah
        aspectRatio: '9 / 16', // Rasio vertikal
        backgroundColor: '#000',
        borderRadius: '8px',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {r.url ? (
          <video 
            src={r.url} 
            controls 
            style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
          />
        ) : (
          <span style={{ color: '#fff' }}>Belum ada video</span>
        )}
      </div>
      <h3 style={{ marginTop: '1rem' }}>{r.judul || "Judul video"}</h3>
      <p className="muted">Topeng terkait: {r.topeng || "-"}</p>
    </div>
  );
}

export function KuisPreview({ r }) {
  return (
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
  );
}

export function ProdukPreview({ r }) {
  return (
    <div className="pv">
      <div className="pv-media">
        {r.gambar ? <img src={r.gambar} alt={r.nama} /> : <Mask size={72} />}
      </div>
      <h3>{r.nama || "Nama produk"}</h3>
      <p className="pv-price">{rupiah(r.harga)}</p>
      <p className="muted">Stok: {r.stok}</p>
    </div>
  );
}