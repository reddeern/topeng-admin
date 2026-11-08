import { labelStatus, rupiah } from "../utils/helpers";

export function StatusBadge({ status }) {
  return <span className={`badge ${status}`}>{labelStatus(status)}</span>;
}

export function Pager({ page, lastPage, onChange }) {
  if (lastPage <= 1) return null;
  return (
    <div className="pager">
      <button className="btn ghost" disabled={page <= 1} onClick={() => onChange(page - 1)}>Sebelumnya</button>
      <span>Halaman {page} dari {lastPage}</span>
      <button className="btn ghost" disabled={page >= lastPage} onClick={() => onChange(page + 1)}>Berikutnya</button>
    </div>
  );
}

export default function Table({ cols, rows, actions, loading = false, startNo = 0 }) {
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>No</th>
            {cols.map((c) => <th key={c.key}>{c.colLabel || c.label}</th>)}
            {actions && <th>Aksi</th>}
          </tr>
        </thead>
        <tbody>
          {loading && rows.length === 0 && (
            <tr><td colSpan={cols.length + 2} className="empty">Memuat data…</td></tr>
          )}
          {!loading && rows.length === 0 && (
            <tr><td colSpan={cols.length + 2} className="empty">Tidak ada data yang cocok.</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={r.id}>
              <td>{startNo + i + 1}</td>
              {cols.map((c) => (
                <td key={c.key}>
                  {c.cell ? c.cell(r)
                    : c.key === "status" || c.key === "pembayaran" ? <StatusBadge status={r[c.key]} />
                    : ["harga", "total", "pendapatan", "omzet"].includes(c.key) ? rupiah(r[c.key])
                    : r[c.key]}
                </td>
              ))}
              {actions && <td className="actions">{actions(r)}</td>}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
