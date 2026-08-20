export function Monogram({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <circle cx="32" cy="30" r="13" stroke="#F1EEE7" strokeWidth="4" fill="none" />
      <circle cx="44" cy="42" r="4" fill="#E6A23C" />
    </svg>
  )
}
