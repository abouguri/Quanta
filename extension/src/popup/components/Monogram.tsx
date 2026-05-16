export function Monogram({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <rect width="64" height="64" rx="14" fill="#0F2233" />
      <circle cx="32" cy="30" r="13" stroke="#F4F1E9" strokeWidth="2.5" fill="none" />
      <circle cx="44" cy="42" r="3.2" fill="#E6A23C" />
    </svg>
  )
}
