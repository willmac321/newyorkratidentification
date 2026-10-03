import { CSSProperties } from 'react'
import type { FacePlacement } from '../../lib/ratVision'

interface RatFaceOverlayProps {
  face: FacePlacement
}

/**
 * Rat head over one face. Positioned in percent of the image box, so it
 * tracks the image as it resizes. The point between the rat's eyes and nose
 * (38% across, 63% down the PNG) sits on the face's center and rotates with
 * the head.
 *
 * Rat photo: AlexK100, CC BY-SA 2.0,
 * https://commons.wikimedia.org/wiki/File:Fancy_rat_blaze.jpg
 * (head cut out of the background, edges faded; the cutout is CC BY-SA 2.0).
 */
function RatFaceOverlay({ face }: RatFaceOverlayProps) {
  const style = {
    left: `${face.x}%`,
    top: `${face.y}%`,
    width: `${face.w}%`,
    transform: `translate(-38%, -63%) rotate(${face.rot}deg)`,
  } as CSSProperties

  return <img className="rat-face-overlay" src="/rat-head.png" alt="" style={style} />
}

export default RatFaceOverlay
