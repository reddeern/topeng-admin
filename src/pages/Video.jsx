import { useMemo } from "react";
import CrudPage from "../components/CrudPage";
import { VideoPreview } from "../components/Previews";
import { api } from "../api";
import { useTopengOptions } from "../utils/hooks";

export default function Video() {
  const topeng = useTopengOptions();
  const topengOptions = useMemo(() => topeng.map((t) => ({
    value: t.value,
    label: t.hasVideo ? `${t.label} (sudah ada video)` : t.label,
    disabled: t.hasVideo,
  })), [topeng]);
  const fields = useMemo(() => [
    { key: "judul", label: "Judul video" },
    { key: "topengId", label: "Topeng terkait", colLabel: "Topeng", type: "select", options: topengOptions, labelKey: "topeng",
      cell: (r) => r.topeng || "-" },
    { key: "url", label: "File video AI (mp4/webm/mov, maks. 300 MB)", type: "file", accept: "video/*",
      nameKey: "namaFile", fileKey: "file", required: true, maxMB: 300, hideInTable: true },
    { key: "namaFile", label: "File", formHidden: true },
    { key: "status", label: "Status", formHidden: true },
  ], [topengOptions]);

  // Satu topeng hanya punya satu video AI; update dipakai untuk mengganti video.
  return <CrudPage title="Kelola video AI" noun="video" fields={fields} preview={VideoPreview} api={api.video}
    searchable={false} paginated />;
}
