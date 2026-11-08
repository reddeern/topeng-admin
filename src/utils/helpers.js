import { useEffect, useState } from "react";

export const rupiah = (n) => "Rp" + Number(n || 0).toLocaleString("id-ID");

export const tanggal = (s) =>
  s ? new Date(s).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-";

export const labelStatus = (s) => String(s || "").replaceAll("_", " ");

export function useDebounce(value, ms = 350) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return v;
}
