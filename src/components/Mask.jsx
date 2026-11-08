/* ikon topeng (SVG sederhana) */
export default function Mask({ size = 56 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <path d="M32 4c14 0 24 9 24 24 0 17-10 32-24 32S8 45 8 28C8 13 18 4 32 4z" fill="#C08552" />
      <path d="M18 26c4-3 9-3 12 0-3 4-9 4-12 0zM34 26c3-3 8-3 12 0-3 4-9 4-12 0z" fill="#4B2E2B" />
      <path d="M24 44c5 4 11 4 16 0" stroke="#4B2E2B" strokeWidth="3" fill="none" strokeLinecap="round" />
    </svg>
  );
}
