import { DragEvent, useEffect, useRef, useState } from 'react'
import { analyze, loadVision, type FacePlacement, type Verdict } from '../../lib/ratVision'
import NeonBulbs, { type BulbMode } from './NeonBulbs'
import RatFaceOverlay from './RatFaceOverlay'
import DisclaimerPlacard from './DisclaimerPlacard'
import './RatCheckInn.css'

const VERDICTS: Record<Verdict, { tube: string; caption: string; line: string }> = {
  rat: {
    tube: 'RAT CONFIRMED',
    caption: 'a genuine rat',
    line: 'Certified New York rat. Welcome home, neighbor.',
  },
  person: { tube: "YOU'RE A RAT", caption: 'rat found', line: '' },
  neither: {
    tube: 'NO RAT',
    caption: 'not a rat',
    line: 'No rat, no person. Just a picture of something.',
  },
}

const MIN_ANALYZE_MS = 1800 // the wait is part of the gag
const PRELOAD_DELAY_MS = 1500
const DISCLAIMER_ID = 'rat-check-inn-notice'

type Phase = 'idle' | 'analyzing' | 'done'

interface Result {
  verdict: Verdict
  faces: FacePlacement[]
  error: boolean
}

function RatCheckInn() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [imgUrl, setImgUrl] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [agreed, setAgreed] = useState(false)
  const [nudge, setNudge] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const runRef = useRef(0)
  const urlRef = useRef<string | null>(null)

  // Warm the models shortly after load, and free the preview on unmount.
  useEffect(() => {
    const t = setTimeout(() => loadVision().catch(() => {}), PRELOAD_DELAY_MS)
    return () => {
      clearTimeout(t)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [])

  // A file dropped beside the mat would otherwise make the browser open it.
  useEffect(() => {
    const block = (e: globalThis.DragEvent) => e.preventDefault()
    window.addEventListener('dragover', block)
    window.addEventListener('drop', block)
    return () => {
      window.removeEventListener('dragover', block)
      window.removeEventListener('drop', block)
    }
  }, [])

  const setPreview = (url: string | null) => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    urlRef.current = url
    setImgUrl(url)
  }

  const handleFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return
    if (!agreed) {
      setNudge(true)
      return
    }

    const url = URL.createObjectURL(file)
    setPreview(url)
    setResult(null)
    setPhase('analyzing')

    const run = ++runRef.current
    const minWait = new Promise((r) => setTimeout(r, MIN_ANALYZE_MS))
    Promise.all([analyze(url), minWait])
      .then(([res]): Result => ({ ...res, error: false }))
      .catch(async (): Promise<Result> => {
        await minWait
        return { verdict: 'neither', faces: [], error: true }
      })
      .then((res) => {
        if (run !== runRef.current) return
        setResult(res)
        setPhase('done')
      })
  }

  const reset = () => {
    runRef.current++
    setPreview(null)
    setResult(null)
    setPhase('idle')
  }

  const pickFile = () => {
    if (!agreed) {
      setNudge(true)
      return
    }
    fileRef.current?.click()
  }

  const onDragOver = (e: DragEvent) => {
    e.preventDefault()
    if (!dragging) setDragging(true)
  }
  const onDragLeave = (e: DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false)
  }
  const onDrop = (e: DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const verdict = result && VERDICTS[result.verdict]
  const tubeText = phase === 'analyzing' ? 'CHECKING…' : verdict?.tube ?? ''
  const caption = phase === 'analyzing' ? 'checking…' : verdict?.caption ?? ''
  const resultLine =
    phase === 'analyzing'
      ? 'Consulting the rat authorities. Please hold.'
      : result?.error
        ? 'Image is scuffed. Try again.'
        : verdict?.line ?? ''
  const isPerson = phase === 'done' && result?.verdict === 'person'
  const bulbMode: BulbMode = phase

  return (
    <div className="rat-check-inn">
      <div className="rat-check-inn__column">
        <div className="inn-sign">
          <div className="inn-sign__badge" aria-hidden="true">
            <span>EST.</span>
            <span className="inn-sign__badge-year">2026</span>
          </div>
          <div className="inn-sign__headboard">
            <h1 className="neon-script">NYC Rat Identification</h1>
            {tubeText && (
              <div className="neon-tube">
                <span
                  className={`neon-tube__text${result?.verdict === 'neither' ? ' neon-tube__text--pink' : ''}`}
                >
                  {tubeText}
                </span>
              </div>
            )}
          </div>
          <NeonBulbs mode={bulbMode} layout="row" />
        </div>

        <div className="inn-poles" aria-hidden="true">
          <span />
          <span />
        </div>

        <div className="inn-panel">
          <NeonBulbs mode={bulbMode} layout="perimeter" />
          <div
            className={`drop-zone${dragging ? ' drop-zone--dragging' : ''}`}
            aria-describedby={DISCLAIMER_ID}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
          >
            {!imgUrl && (
              <>
                <div className={`drop-zone__head${dragging ? '' : ' drop-zone__head--flicker'}`}>
                  {dragging ? "LET GO, WE'VE GOT IT" : 'IS IT A RAT?'}
                </div>
                <p className="drop-zone__sub">
                  {dragging
                    ? 'Drop it on the mat.'
                    : 'Drop a photo on the mat and our night clerk will tell you whether it is a rat.'}
                </p>
                <button
                  type="button"
                  className="inn-button"
                  onClick={pickFile}
                  disabled={!agreed}
                  aria-describedby={DISCLAIMER_ID}
                >
                  CHECK IN A PHOTO
                </button>
                <div className="drop-zone__fine">JPG · PNG · WEBP · kept for zero nights</div>
              </>
            )}

            {imgUrl && (
              <>
                <figure className="polaroid">
                  <div className="polaroid__photo">
                    <img
                      src={imgUrl}
                      alt={isPerson ? 'Your uploaded photo, now a rat' : 'Your uploaded photo'}
                      className={phase === 'analyzing' ? 'polaroid__img--analyzing' : undefined}
                    />
                    {isPerson &&
                      result.faces.map((face, i) => <RatFaceOverlay key={i} face={face} />)}
                  </div>
                  <figcaption>{caption}</figcaption>
                </figure>
                {resultLine && <p className="drop-zone__sub">{resultLine}</p>}
                {isPerson && (
                  <p className="drop-zone__credit">
                    Rat photo:{' '}
                    <a
                      href="https://commons.wikimedia.org/wiki/File:Fancy_rat_blaze.jpg"
                      target="_blank"
                      rel="noreferrer"
                    >
                      AlexK100
                    </a>
                    ,{' '}
                    <a
                      href="https://creativecommons.org/licenses/by-sa/2.0/"
                      target="_blank"
                      rel="noreferrer"
                    >
                      CC BY-SA 2.0
                    </a>
                    , cut out
                  </p>
                )}
                {phase === 'done' && (
                  <button type="button" className="inn-button inn-button--small" onClick={reset}>
                    CHECK OUT · TRY ANOTHER
                  </button>
                )}
              </>
            )}

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={(e) => {
                handleFile(e.target.files?.[0])
                e.target.value = ''
              }}
            />
          </div>
        </div>

        <div className="visually-hidden" aria-live="polite">
          {phase === 'done' && verdict ? `${verdict.tube}. ${resultLine}` : ''}
        </div>
        <DisclaimerPlacard
          id={DISCLAIMER_ID}
          agreed={agreed}
          nudge={nudge}
          onAgreeChange={(checked) => {
            setAgreed(checked)
            setNudge(false)
          }}
        />
      </div>
    </div>
  )
}

export default RatCheckInn
