import { useMemo } from "react";
import CrudPage from "../components/CrudPage";
import { VideoPreview } from "../components/Previews";
import { api } from "../api";
import { useTopengOptions } from "../utils/hooks";

export default function Video() {
  const topeng = useTopengOptions();
  const fields = useMemo(() => [
    { key: "judul", label: "Judul video" },
    { key: "topengId", label: "Topeng terkait", colLabel: "Topeng", type: "select", options: topeng, labelKey: "topeng",
      cell: (r) => r.topeng || "-" },
    { key: "url", label: "File video AI (mp4/webm/mov, maks. 300 MB)", type: "file", accept: "video/*",
      nameKey: "namaFile", fileKey: "file", required: true, maxMB: 300, hideInTable: true },
    { key: "namaFile", label: "File", formHidden: true },
    { key: "status", label: "Status", formHidden: true },
  ], [topeng]);

  // Sesuai sitemap: video hanya Create, Read, Delete (tanpa ubah dan tanpa pencarian)
  return <CrudPage title="Kelola video AI" noun="video" fields={fields} preview={VideoPreview} api={api.video}
    canUpdate={false} searchable={false} paginated />;
}
