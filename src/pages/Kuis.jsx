import { useMemo } from "react";
import CrudPage from "../components/CrudPage";
import { KuisPreview } from "../components/Previews";
import { api } from "../api";
import { useTopengOptions } from "../utils/hooks";

export default function Kuis() {
  const topeng = useTopengOptions();
  const fields = useMemo(() => [
    { key: "pertanyaan", label: "Pertanyaan" },
    { key: "opsi", label: "Pilihan jawaban", colLabel: "Karakter yang dituju", type: "choices", options: topeng,
      hint: "Tiap pilihan mengarah ke satu karakter topeng. Tidak ada jawaban benar atau salah.",
      cell: (r) => [...new Set(r.opsi.map((o) => o.karakter))].join(", ") },
  ], [topeng]);

  return <CrudPage title="Kelola kuis kepribadian" noun="pertanyaan" fields={fields} preview={KuisPreview} api={api.kuis} />;
}
