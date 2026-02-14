import { useState, useEffect, useRef } from 'react'
import './TalkingRat.css'

const RAT_PHRASES = [
  "Squeak squeak!",
  "I'm a NYC rat!",
  "Cheese please!",
  "Underground is home",
  "Trash day is my favorite",
  "Sewer life is the best",
  "I see you there",
  "Got any snacks?",
  "The subway is mine",
  "Night time is right time",
  "I'm the king of rats",
  "Follow me underground",
  "Pizza crust please",
  "I'm not scared of you",
  "The city is my playground",
  "Squeak if you hear me",
  "I love dark places",
  "Rats rule NYC",
  "I'm always hungry",
  "Watch where you step",
  "I'm a survivor",
  "The streets are mine",
  "I see everything",
  "I'm quick and clever",
  "Don't mess with rats",
  "I'm a city legend",
  "Sewer system expert",
  "I know all the shortcuts",
  "I'm always watching",
  "The night belongs to me",
  "I'm a master scavenger",
  "I've seen it all",
  "I'm the real NYC native",
  "I'm faster than you think",
  "I'm a street smart rat",
  "I love the hustle",
  "I'm always on the move",
  "I'm a true New Yorker",
  "I know every alley",
  "I'm a subway regular",
  "I'm a garbage connoisseur",
  "I'm a night crawler",
  "I'm a city slicker",
  "I'm a tunnel expert",
  "I'm a dumpster diver",
  "I'm a rooftop runner",
  "I'm a basement dweller",
  "I'm a fire escape climber",
  "I'm a manhole master",
  "I'm a pipe navigator",
  "I'm a wall climber",
  "I'm a fence jumper",
  "I'm a drain explorer",
  "I'm a vent crawler",
  "I'm a crack finder",
  "I'm a gap squeezer",
  "I'm a hole digger",
  "I'm a shadow hider",
  "I'm a noise maker",
  "I'm a quick thinker",
  "I'm a problem solver",
  "I'm a resource finder",
  "I'm a food locator",
  "I'm a shelter seeker",
  "I'm a path finder",
  "I'm a danger dodger",
  "I'm a trap avoider",
  "I'm a cat outrunner",
  "I'm a dog escaper",
  "I'm a human avoider",
  "I'm a light hater",
  "I'm a dark lover",
  "I'm a quiet mover",
  "I'm a fast runner",
  "I'm a sharp turner",
  "I'm a tight squeezer",
  "I'm a high jumper",
  "I'm a long climber",
  "I'm a deep diver",
  "I'm a wide explorer",
  "I'm a small fitter",
  "I'm a big dreamer",
  "I'm a tough survivor",
  "I'm a smart adapter",
  "I'm a quick learner",
  "I'm a memory keeper",
  "I'm a route rememberer",
  "I'm a pattern recognizer",
  "I'm a danger detector",
  "I'm a food sniffer",
  "I'm a sound listener",
  "I'm a movement watcher",
  "I'm a shadow user",
  "I'm a cover seeker",
  "I'm a hide expert",
  "I'm a wait master",
  "I'm a pounce pro",
  "I'm a grab specialist",
  "I'm a carry champion",
  "I'm a store winner",
  "I'm a hoard hero",
  "I'm a share sharer",
  "I'm a family protector",
  "I'm a colony member",
  "I'm a pack player",
  "I'm a team worker",
  "I'm a group grouper",
  "I'm a social squeaker",
  "I'm a communication master",
]

function TalkingRat() {
  const [isMouthOpen, setIsMouthOpen] = useState(false)
  const [currentPhrase, setCurrentPhrase] = useState('')
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const velocityRef = useRef({ x: 0, y: 0 })
  const ratSize = { width: 300, height: 300 } // Approximate rat image size

  // Function to generate a new random direction vector
  const generateNewDirection = () => {
    const speed = 1 + Math.random() * 2 // Speed between 1-3
    const angle = Math.random() * Math.PI * 2
    return {
      x: Math.cos(angle) * speed,
      y: Math.sin(angle) * speed,
    }
  }

  // Movement animation
  useEffect(() => {
    let animationFrameId: number
    let directionChangeInterval: ReturnType<typeof setInterval>

    const animate = () => {
      setPosition((prev) => {
        const windowWidth = window.innerWidth
        const windowHeight = window.innerHeight

        // If mouth is open, velocity is 0
        const vx = isMouthOpen ? 0 : velocityRef.current.x
        const vy = isMouthOpen ? 0 : velocityRef.current.y

        // Calculate new position
        let newX = prev.x + vx
        let newY = prev.y + vy

        // Keep rat on screen - clamp to boundaries
        newX = Math.max(0, Math.min(newX, windowWidth - ratSize.width))
        newY = Math.max(0, Math.min(newY, windowHeight - ratSize.height))

        // If we hit a boundary, pick a new direction
        if (newX === 0 || newX === windowWidth - ratSize.width || 
            newY === 0 || newY === windowHeight - ratSize.height) {
          velocityRef.current = generateNewDirection()
        }

        return { x: newX, y: newY }
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    // Initialize random starting position and direction
    const initPosition = () => {
      const windowWidth = window.innerWidth
      const windowHeight = window.innerHeight
      const startX = Math.random() * (windowWidth - ratSize.width)
      const startY = Math.random() * (windowHeight - ratSize.height)
      setPosition({ x: startX, y: startY })
      velocityRef.current = generateNewDirection()
    }

    initPosition()
    animate()

    // Periodically change direction (every 3-6 seconds)
    directionChangeInterval = setInterval(() => {
      if (!isMouthOpen) {
        velocityRef.current = generateNewDirection()
      }
    }, 3000 + Math.random() * 3000)

    // Handle window resize
    const handleResize = () => {
      setPosition((prev) => ({
        x: Math.min(prev.x, window.innerWidth - ratSize.width),
        y: Math.min(prev.y, window.innerHeight - ratSize.height),
      }))
    }

    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearInterval(directionChangeInterval)
      window.removeEventListener('resize', handleResize)
    }
  }, [isMouthOpen, ratSize.width, ratSize.height])

  // Generate new direction when mouth closes
  useEffect(() => {
    if (!isMouthOpen) {
      velocityRef.current = generateNewDirection()
    }
  }, [isMouthOpen])

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>
    let intervalId: ReturnType<typeof setTimeout>

    const scheduleNextPhrase = () => {
      // Open mouth
      setIsMouthOpen(true)
      
      // Change phrase when mouth opens
      setCurrentPhrase(RAT_PHRASES[Math.floor(Math.random() * RAT_PHRASES.length)])

      // Random duration for how long the text stays (between 1 and 5 seconds)
      const displayDuration = 1000 + Math.random() * 4000

      // Close mouth after random duration
      timeoutId = setTimeout(() => {
        setIsMouthOpen(false)
        
        // Random delay before next phrase (between 1 and 4 seconds)
        const nextPhraseDelay = 1000 + Math.random() * 3000
        
        // Schedule next phrase
        intervalId = setTimeout(scheduleNextPhrase, nextPhraseDelay)
      }, displayDuration)
    }

    // Start with initial phrase
    scheduleNextPhrase()

    return () => {
      clearTimeout(timeoutId)
      clearTimeout(intervalId)
    }
  }, [])

  return (
    <div 
      className="talking-rat-container"
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y}px`,
      }}
    >
      <div className="rat-wrapper">
        <img
          src={isMouthOpen ? "/ratOpen.png" : "/rat.png"}
          alt="talking rat"
          className="rat-image"
        />
        {isMouthOpen && (
          <div className="speech-bubble">
            <img src="/speechbubble.png" alt="speech bubble" className="speech-bubble-image" />
            <p className="speech-bubble-text">{currentPhrase}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default TalkingRat

