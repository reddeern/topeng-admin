import { useEffect, useState } from "react";
import { api } from "../api";

/* Daftar topeng sebagai opsi <select>: [{ value: id, label: nama, hasVideo }] */
export function useTopengOptions() {
  const [opts, setOpts] = useState([]);
  useEffect(() => {
    let off = false;
    api.topeng.list().then((r) => {
      if (!off) setOpts(r.rows.map((t) => ({ value: t.id, label: t.nama, hasVideo: t.hasVideo })));
    }).catch(() => {});
    return () => { off = true; };
  }, []);
  return opts;
}
