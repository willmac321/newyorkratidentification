import { useEffect, useState } from 'react'
import './RatClickEffect.css'

interface RatParticle {
  id: number
  x: number
  y: number
  angle: number
  distance: number
  size: number
  rotation: number
}

function RatClickEffect() {
  const [particles, setParticles] = useState<RatParticle[]>([])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const count = Math.floor(Math.random() * 101) // 0 to 100
      const newParticles: RatParticle[] = []

      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2 // Random direction in radians
        const distance = 50 + Math.random() * 200 // Random distance
        const size = 10 + Math.random() * 90 // Random size from 10 to 100
        const rotation = Math.random() * 720 - 360 // Random rotation from -360 to 360 degrees

        newParticles.push({
          id: Date.now() + i,
          x: e.clientX,
          y: e.clientY,
          angle,
          distance,
          size,
          rotation,
        })
      }

      setParticles((prev) => [...prev, ...newParticles])

      // Remove particles after animation
      setTimeout(() => {
        setParticles((prev) => prev.filter((p) => !newParticles.includes(p)))
      }, 2000)
    }

    window.addEventListener('click', handleClick)
    return () => window.removeEventListener('click', handleClick)
  }, [])

  return (
    <div className="rat-click-effect">
      {particles.map((particle) => {
        const endX = Math.cos(particle.angle) * particle.distance
        const endY = Math.sin(particle.angle) * particle.distance
        
        return (
          <div
            key={particle.id}
            className="rat-particle"
            style={{
              left: `${particle.x}px`,
              top: `${particle.y}px`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              '--end-x': `${endX}px`,
              '--end-y': `${endY}px`,
              '--rotation': `${particle.rotation}deg`,
            } as React.CSSProperties}
          >
            <img src="/rat-cursor.svg" alt="rat" />
          </div>
        )
      })}
    </div>
  )
}

export default RatClickEffect

