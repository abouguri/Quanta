export function Monogram({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 320 320" fill="none" aria-hidden="true">
      <defs>
        <filter id="fluffExt" x="-30%" y="-30%" width="160%" height="160%">
          <feTurbulence type="fractalNoise" baseFrequency=".04" numOctaves="3" seed="8" result="n" />
          <feDisplacementMap in="SourceGraphic" in2="n" scale="4" />
        </filter>
      </defs>
      <circle cx="145" cy="142" r="92" fill="none" stroke="#FFFFEB" strokeWidth="50" filter="url(#fluffExt)" />
      <path d="M176 177 C196 198 218 223 250 248" fill="none" stroke="#FFFFEB" strokeWidth="50" strokeLinecap="round" filter="url(#fluffExt)" />
    </svg>
  )
}
