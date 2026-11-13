import { useEffect, useState } from "react";
import Table, { Pager } from "./Table";
import { useDebounce } from "../utils/helpers";

const norm = (opts = []) => opts.map((o) => (typeof o === "string" ? { value: o, label: o } : o));

/* Halaman CRUD generik: daftar, cari, tambah, ubah, lihat, hapus.
   `api` = { list, create, update, remove } dari src/api.js */
export default function CrudPage({
  title, noun, fields, preview: Preview, api,
  canView = true, canUpdate = true, searchable = true, paginated = false, readOnly = false, extraActions,
}) {
  const [rows, setRows] = useState([]);
  const [loaded, setLoaded] = useState("");
  const [loadErr, setLoadErr] = useState("");
  const [q, setQ] = useState("");
  const dq = useDebounce(q);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [reload, setReload] = useState(0);
  const key = `${dq}|${page}|${reload}`;
  const loading = loaded !== key;

  const [form, setForm] = useState(null); // null = tertutup
  const [formErr, setFormErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(null);
  const [showPv, setShowPv] = useState(false);
  const [view, setView] = useState(null);
  const [del, setDel] = useState(null);
  const [delErr, setDelErr] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    let off = false;
    api.list({ q: dq || undefined, page: paginated ? page : undefined })
      .then((r) => { if (!off) { setRows(r.rows); setLastPage(r.lastPage); setLoadErr(""); } })
      .catch((e) => { if (!off) setLoadErr(e.message); })
      .finally(() => { if (!off) setLoaded(key); });
    return () => { off = true; };
  }, [api, dq, page, reload, paginated, key]);

  const empty = () =>
    Object.fromEntries(
      fields.map((f) => {
        const opts = norm(f.options);
        const first = opts.find((o) => !o.disabled);
        return [
          f.key,
          f.type === "choices"
            ? Array.from({ length: 4 }, () => ({ teks: "", topengId: opts[0]?.value ?? "", karakter: opts[0]?.label ?? "" }))
            : f.type === "select" ? first?.value ?? ""
            : f.type === "file" ? null
            : "",
        ];
      }).concat(
        fields.filter((f) => f.labelKey && f.type === "select").map((f) => {
          const first = norm(f.options).find((o) => !o.disabled);
          return [f.labelKey, first?.label ?? ""];
        })
      )
    );

  // Jika form dibuka sebelum daftar opsi (mis. topeng) selesai dimuat, nilai select masih kosong.
  // Isi dengan opsi pertama, sama seperti yang terlihat di layar.
  const normalize = (data) => {
    const out = { ...data };
    fields.forEach((f) => {
      const opts = norm(f.options);
      const first = opts.find((o) => !o.disabled);
      if (!first) return;
      if (f.type === "select" && (out[f.key] === "" || out[f.key] == null)) {
        out[f.key] = first.value;
        if (f.labelKey) out[f.labelKey] = first.label;
      }
      if (f.type === "choices") {
        out[f.key] = out[f.key].map((o) =>
          o.topengId === "" || o.topengId == null ? { ...o, topengId: opts[0].value, karakter: opts[0].label } : o);
      }
    });
    return out;
  };

  const openForm = (data) => { setShowPv(false); setFormErr(""); setProgress(null); setForm(data); };

  const save = async (e) => {
    e.preventDefault();
    setSaving(true); setFormErr(""); setProgress(null);
    try {
      const opt = { onProgress: setProgress };
      const data = normalize(form);
      if (form.id) await api.update(form.id, data, opt);
      else await api.create(data, opt);
      setForm(null);
      setReload((n) => n + 1);
    } catch (err) {
      setFormErr(err.message);
    } finally {
      setSaving(false); setProgress(null);
    }
  };

  const remove = async () => {
    setDeleting(true); setDelErr("");
    try {
      await api.remove(del.id);
      if (rows.length === 1 && page > 1) setPage(page - 1);
      setDel(null);
      setReload((n) => n + 1);
    } catch (err) {
      setDelErr(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const renderField = (f, data = form, isView = false) => {
    const set = (v) => setForm({ ...form, [f.key]: v });

    if (f.type === "choices") {
      const opts = norm(f.options);
      const upd = (i, patch) => set(data[f.key].map((x, j) => (j === i ? { ...x, ...patch } : x)));
      return (
        <fieldset key={f.key}>
          <legend>{f.label}</legend>
          <p className="muted small-note">{f.hint}</p>
          {opts.length === 0 && <p className="error small-note">Belum ada data topeng. Tambahkan topeng terlebih dahulu.</p>}
          {(data[f.key] || []).map((o, i) => (
            <div className="opt-row" key={i}>
              <input
                required={!isView}
                readOnly={isView}
                placeholder={`Pilihan ${i + 1}`}
                value={o.teks}
                onChange={isView ? undefined : (e) => upd(i, { teks: e.target.value })}
              />
              <select
                required={!isView}
                disabled={isView}
                value={o.topengId === "" ? (opts[0]?.value ?? "") : o.topengId}
                onChange={isView ? undefined : (e) => {
                  const hit = opts.find((x) => String(x.value) === e.target.value);
                  upd(i, { topengId: hit ? hit.value : e.target.value, karakter: hit?.label ?? "" });
                }}
              >
                {opts.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
          ))}
        </fieldset>
      );
    }

    if (f.type === "file") {
      return (
        <label key={f.key}>{f.label}
          <input
            type="file"
            accept={f.accept}
            disabled={isView}
            required={!isView && f.required && !data.id}
            onChange={isView ? undefined : (e) => {
              const file = e.target.files[0];
              if (!file) {
                setForm({ ...form, [f.key]: null, [f.nameKey]: "", [f.fileKey]: null });
                return;
              }
              if (f.maxMB && file.size > f.maxMB * 1024 * 1024) {
                setFormErr(`Ukuran file maksimal ${f.maxMB} MB.`);
                e.target.value = "";
                return;
              }
              setFormErr("");
              
              const reader = new FileReader();
              reader.onload = (ev) => {
                setForm((prev) => ({
                  ...prev,
                  [f.key]: ev.target.result, 
                  [f.nameKey]: file.name,
                  [f.fileKey]: file
                }));
              };
              reader.readAsDataURL(file);
            }}
          />
          {data[f.nameKey] && <span className="muted small-note">Dipilih: {data[f.nameKey]}</span>}
          {f.accept.startsWith("image") && data[f.key] && <img className="thumb big" src={data[f.key]} alt="Pratinjau gambar" />}
        </label>
      );
    }

    if (f.type === "select") {
      const opts = norm(f.options);
      const enabled = opts.filter((o) => !o.disabled);
      return (
        <label key={f.key}>{f.label}
          <select
            required={!isView && f.required !== false}
            disabled={isView}
            value={data[f.key] === "" ? (enabled[0]?.value ?? "") : data[f.key]}
            onChange={isView ? undefined : (e) => {
              const hit = opts.find((x) => String(x.value) === e.target.value);
              setForm({ ...form, [f.key]: hit ? hit.value : e.target.value, ...(f.labelKey ? { [f.labelKey]: hit?.label ?? "" } : {}) });
            }}
          >
            {opts.length === 0 && <option value="">Belum ada pilihan</option>}
            {opts.length > 0 && enabled.length === 0 && <option value="">Tidak ada pilihan tersedia</option>}
            {opts.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
          </select>
        </label>
      );
    }

    return (
      <label key={f.key}>{f.label}
        {f.type === "textarea" ? (
          <textarea
            rows="3"
            required={!isView && f.required !== false}
            readOnly={isView}
            maxLength={isView ? undefined : f.maxLength}
            value={data[f.key] ?? ""}
            onChange={isView ? undefined : (e) => set(e.target.value)}
          />
        ) : (
          <input
            type={f.type || "text"}
            required={!isView && f.required !== false}
            readOnly={isView}
            min={f.type === "number" ? 0 : undefined}
            maxLength={isView ? undefined : f.maxLength}
            value={data[f.key] ?? ""}
            onChange={isView ? undefined : (e) => set(
              f.type === "number" 
                ? (e.target.value === "" ? "" : Number(e.target.value)) 
                : e.target.value
            )}
          />
        )}
        {!isView && f.maxLength && (
          <span className="muted small-note">
            {(data[f.key] || "").length}/{f.maxLength} karakter
          </span>
        )}
      </label>
    );
  };

  const noOptions = fields.some((f) => (f.type === "select" || f.type === "choices") && !norm(f.options).some((o) => !o.disabled));

  return (
    <section>
      <header className="page-head">
        <h1>{title}</h1>
        <div className="tools">
          {searchable && (
            <input className="search" placeholder={`Cari ${noun}...`} value={q}
              onChange={(e) => { setQ(e.target.value); setPage(1); }} />
          )}
          {!readOnly && <button className="btn primary" onClick={() => openForm(empty())}>Tambah {noun}</button>}
        </div>
      </header>

      {loadErr && (
        <div className="banner error">
          <span>{loadErr}</span>
          <button className="btn ghost" onClick={() => setReload((n) => n + 1)}>Coba lagi</button>
        </div>
      )}

      <div className="table-wrap">
        <Table
          cols={fields.filter((f) => !f.hideInTable)}
          rows={rows}
          loading={loading}
          startNo={paginated ? (page - 1) * 20 : 0}
          actions={readOnly ? undefined : (r) => (
            <>
              {canView && <button className="btn ghost" onClick={() => setView(r)}>Lihat</button>}
              {canUpdate && <button className="btn ghost" onClick={() => openForm(r)}>Ubah</button>}
              {extraActions && extraActions(r)}
              <button className="btn danger" onClick={() => { setDelErr(""); setDel(r); }}>Hapus</button>
            </>
          )}
        />
      </div>
      {paginated && <Pager page={page} lastPage={lastPage} onChange={setPage} />}

      {form && (
        <div className="overlay" onClick={() => !saving && setForm(null)}>
          <form className={`modal ${showPv ? "wide" : ""}`} onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{form.id ? "Ubah" : "Tambah"} {noun}</h2>
            <div className={showPv ? "split" : ""}>
              <div className="fields">{fields.filter((f) => !f.formHidden).map((f) => renderField(f, form, false))}</div>
              {showPv && Preview && <aside className="pv-wrap"><small>Pratinjau</small><Preview r={form} /></aside>}
            </div>
            {formErr && <p className="error" role="alert">{formErr}</p>}
            {saving && progress !== null && (
              <div className="progress-wrap" role="status">
                <div className="progress"><div style={{ width: `${progress}%` }} /></div>
                <span className="muted small-note">
                  {progress < 100 ? `Mengunggah... ${progress}%` : "Upload selesai, sedang menyimpan di server. Mohon tunggu, jangan tutup halaman."}
                </span>
              </div>
            )}
            <div className="row-end">
              <button type="button" className="btn ghost" disabled={saving} onClick={() => setForm(null)}>Batal</button>
              <button className="btn primary" disabled={saving || noOptions}>{saving ? "Menyimpan..." : "Simpan"}</button>
            </div>
          </form>
        </div>
      )}

      {view && (
        <div className="overlay" onClick={() => setView(null)}>
          <div className={`modal ${Preview ? "wide" : ""}`} onClick={(e) => e.stopPropagation()}>
            <h2>Detail {noun}</h2>
            <div className={Preview ? "split" : ""}>
              <div className="fields">{fields.filter((f) => !f.formHidden).map((f) => renderField(f, view, true))}</div>
              {Preview && <aside className="pv-wrap"><small>Pratinjau</small><Preview r={view} /></aside>}
            </div>
            <div className="row-end">
              <button type="button" className="btn primary" onClick={() => setView(null)}>Tutup</button>
            </div>
          </div>
        </div>
      )}

      {del && (
        <div className="overlay" onClick={() => !deleting && setDel(null)}>
          <div className="modal small" onClick={(e) => e.stopPropagation()}>
            <h2>Hapus {noun}?</h2>
            {Preview && <Preview r={del} />}
            <p className="muted">Data ini akan dihapus dan tidak bisa dikembalikan.</p>
            {delErr && <p className="error" role="alert">{delErr}</p>}
            <div className="row-end">
              <button className="btn ghost" disabled={deleting} onClick={() => setDel(null)}>Batal</button>
              <button className="btn danger" disabled={deleting} onClick={remove}>{deleting ? "Menghapus..." : "Ya, hapus"}</button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}