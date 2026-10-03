import { CSSProperties } from 'react'

export type BulbMode = 'idle' | 'analyzing' | 'done'

// Panel perimeter: 13 across x 8 down (38 bulbs), inset 2.2%, clockwise.
const PERIMETER = (() => {
  const nx = 13
  const ny = 8
  const m = 2.2
  const top = m * 1.2
  const bottom = 100 - m * 1.2
  const col = (i: number) => m + ((100 - 2 * m) * i) / (nx - 1)
  const row = (i: number) => top + ((100 - 2.4 * m) * i) / (ny - 1)
  const pts: { x: number; y: number }[] = []
  for (let i = 0; i < nx; i++) pts.push({ x: col(i), y: top })
  for (let i = 1; i < ny - 1; i++) pts.push({ x: 100 - m, y: row(i) })
  for (let i = nx - 1; i >= 0; i--) pts.push({ x: col(i), y: bottom })
  for (let i = ny - 2; i >= 1; i--) pts.push({ x: m, y: row(i) })
  return pts
})()

const HEADBOARD_COUNT = 9

interface NeonBulbsProps {
  mode: BulbMode
  layout: 'perimeter' | 'row'
}

/** Marquee bulbs. The chase itself is CSS, staggered per bulb via --i. */
function NeonBulbs({ mode, layout }: NeonBulbsProps) {
  if (layout === 'row') {
    return (
      <div className={`neon-bulbs neon-bulbs--row neon-bulbs--${mode}`} aria-hidden="true">
        {Array.from({ length: HEADBOARD_COUNT }, (_, i) => (
          <span key={i} className="bulb" style={{ '--i': i } as CSSProperties} />
        ))}
      </div>
    )
  }

  return (
    <div className={`neon-bulbs neon-bulbs--perimeter neon-bulbs--${mode}`} aria-hidden="true">
      {PERIMETER.map((p, i) => (
        <span
          key={i}
          className="bulb"
          style={{ '--i': i, left: `${p.x}%`, top: `${p.y}%` } as CSSProperties}
        />
      ))}
    </div>
  )
}

export default NeonBulbs
