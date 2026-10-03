import type { FaceLandmarker, ImageClassifier } from '@mediapipe/tasks-vision'

// Everything here runs in the browser. Image bytes never leave the page;
// the only network traffic is the one-time download of the WASM runtime
// and model files below.

// Must match the exact version pinned in package.json.
const MEDIAPIPE_VERSION = '1.0.1'
const WASM_BASE = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`
const FACE_MODEL =
  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const CLASSIFIER_MODEL =
  'https://storage.googleapis.com/mediapipe-models/image_classifier/efficientnet_lite0/float32/1/efficientnet_lite0.tflite'

// ImageNet has no "rat" class, so accept any rodent-ish label.
// ("mouse" is the computer mouse in ImageNet; acceptable for a joke site.)
const RODENT_RE =
  /\b(rat|mouse|hamster|guinea pig|marmot|beaver|weasel|mink|polecat|porcupine|squirrel)\b(?! monkey)/i
// Real rat photos spread their score across several rodent labels (e.g.
// beaver 0.21 + mink 0.09 + weasel 0.07), so sum the top 10 rather than
// requiring one strong label. Calibrated on rat photos (0.11-0.46) vs.
// people, pets, food and scenery (<= 0.02).
const CLASSIFIER_RESULTS = 10
const MIN_RODENT_SCORE = 0.08
const MAX_SIDE = 1024

// Face mesh landmark indices.
const FOREHEAD = 10
const CHIN = 152
const FACE_LEFT = 234
const FACE_RIGHT = 454
// Width of rat-head.png relative to the face; at this scale the rat's head,
// ear to ear, covers the face.
const HEAD_SCALE = 1.7

export type Verdict = 'rat' | 'person' | 'neither'

/** Overlay placement (center of the face), in percent of the rendered image box. */
export interface FacePlacement {
  x: number
  y: number
  w: number
  rot: number
}

export interface VisionResult {
  verdict: Verdict
  faces: FacePlacement[]
}

interface Models {
  face: FaceLandmarker
  classifier: ImageClassifier
}

let modelsPromise: Promise<Models> | null = null

/** Lazily load the MediaPipe runtime and both models once per page. */
export function loadVision(): Promise<Models> {
  if (!modelsPromise) {
    modelsPromise = (async () => {
      const { FilesetResolver, FaceLandmarker, ImageClassifier } = await import(
        '@mediapipe/tasks-vision'
      )
      const fileset = await FilesetResolver.forVisionTasks(WASM_BASE)
      const [face, classifier] = await Promise.all([
        FaceLandmarker.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: FACE_MODEL },
          runningMode: 'IMAGE',
          numFaces: 6,
        }),
        ImageClassifier.createFromOptions(fileset, {
          baseOptions: { modelAssetPath: CLASSIFIER_MODEL },
          runningMode: 'IMAGE',
          maxResults: CLASSIFIER_RESULTS,
        }),
      ])
      return { face, classifier }
    })()
    // Allow a retry on the next upload if loading failed.
    modelsPromise.catch(() => {
      modelsPromise = null
    })
  }
  return modelsPromise
}

/** Draw the image onto a canvas no larger than MAX_SIDE for faster inference. */
async function toCanvas(url: string): Promise<HTMLCanvasElement> {
  const img = new Image()
  img.src = url
  await img.decode()
  const scale = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.naturalWidth * scale)
  canvas.height = Math.round(img.naturalHeight * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  return canvas
}

/** Person wins over rat; otherwise classify for rodents. */
export async function analyze(url: string): Promise<VisionResult> {
  const [canvas, { face, classifier }] = await Promise.all([toCanvas(url), loadVision()])
  const W = canvas.width
  const H = canvas.height

  const faces = face.detect(canvas).faceLandmarks.map((lm): FacePlacement => {
    const top = lm[FOREHEAD]
    const chin = lm[CHIN]
    const a = lm[FACE_LEFT]
    const b = lm[FACE_RIGHT]
    const dx = (b.x - a.x) * W
    const dy = (b.y - a.y) * H
    return {
      x: ((top.x + chin.x) / 2) * 100,
      y: ((top.y + chin.y) / 2) * 100,
      w: ((Math.hypot(dx, dy) * HEAD_SCALE) / W) * 100,
      rot: (Math.atan2(dy, dx) * 180) / Math.PI,
    }
  })
  if (faces.length) return { verdict: 'person', faces }

  const categories = classifier.classify(canvas).classifications[0]?.categories ?? []
  const rodentScore = categories
    .filter((c) => RODENT_RE.test(c.categoryName || c.displayName))
    .reduce((sum, c) => sum + c.score, 0)
  return { verdict: rodentScore >= MIN_RODENT_SCORE ? 'rat' : 'neither', faces: [] }
}
