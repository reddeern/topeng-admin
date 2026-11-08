import { useState } from "react";
import { api } from "../api";
import loginImg from "../assets/Login.png"; 

export default function Login({ onLogin }) {
  const [f, setF] = useState({ user: "", pass: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true); setErr("");
    try {
      await api.auth.login(f.user, f.pass);
      onLogin();
    } catch (error) {
      setErr(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-art">
        <img src={loginImg} alt="Ikon Topeng" width={300} style={{ marginBottom: '1rem' }} />
        <h2>Warisan Topeng Malangan</h2>
        <p>Kelola koleksi, kuis, dan pesanan dalam satu tempat.</p>
      </div>
      <form className="login-form" onSubmit={submit}>
        <h1>Selamat datang</h1>
        <p className="muted">Masuk untuk membuka panel admin.</p>
        
        <label>Username
          <div style={{ position: 'relative', marginTop: '8px' }}>
            {/* Ikon User */}
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#888' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <input 
              value={f.user} 
              autoComplete="username" 
              onChange={(e) => setF({ ...f, user: e.target.value })} 
              required 
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </label>
        
        <label style={{ marginTop: '1rem', display: 'block' }}>Kata sandi
          <div style={{ position: 'relative', marginTop: '8px' }}>
            {/* Ikon Gembok (Lock) */}
            <svg style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', width: '20px', height: '20px', color: '#888' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <input 
              type="password" 
              value={f.pass} 
              autoComplete="current-password" 
              onChange={(e) => setF({ ...f, pass: e.target.value })} 
              required 
              style={{ paddingLeft: '40px', width: '100%', boxSizing: 'border-box' }}
            />
          </div>
        </label>

        {err && <p className="error" role="alert">{err}</p>}
        <button className="btn primary" disabled={loading} style={{ marginTop: '1.5rem' }}>
          {loading ? "Masuk…" : "Masuk"}
        </button>
      </form>
    </div>
  );
}