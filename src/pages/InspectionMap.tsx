import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import './InspectionMap.css'

// NYC Open Data: DOHMH Rodent Inspection (data.cityofnewyork.us/Health/Rodent-Inspection/p937-wjvj)
const API = 'https://data.cityofnewyork.us/resource/p937-wjvj.json'
const WINDOW_DAYS = 7

interface Inspection {
  job_id: string
  inspection_type?: string
  inspection_date: string
  house_number?: string
  street_name?: string
  zip_code?: string
  borough?: string
  result?: string
  letter_type?: string
  observations?: string
  bbl?: string
  nta?: string
  latitude?: string
  longitude?: string
}

type Category = 'rats' | 'other' | 'passed' | 'treatment'

const CATEGORIES: { key: Category; label: string; color: string }[] = [
  { key: 'rats', label: 'Failed: rat activity', color: '#ff3d6e' },
  { key: 'other', label: 'Failed: other reason', color: '#ffb02e' },
  { key: 'passed', label: 'Passed', color: '#3ff3a0' },
  { key: 'treatment', label: 'Bait / stoppage / monitoring', color: '#5aa9ff' },
]

function categorize(result = ''): Category {
  if (result.includes('Rat Activity')) return 'rats'
  if (result.startsWith('Failed')) return 'other'
  if (result === 'Passed') return 'passed'
  return 'treatment'
}

// SoQL floating timestamps have no zone (NYC local time), so format without converting to UTC.
function soqlDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}

function formatDay(d: Date) {
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function tooltipContent(row: Inspection) {
  const el = document.createElement('div')
  const title = document.createElement('strong')
  title.textContent = [row.house_number, row.street_name].filter(Boolean).join(' ') || row.borough || 'Inspection'
  const result = document.createElement('div')
  result.textContent = row.result ?? 'No result'
  const hint = document.createElement('small')
  hint.textContent = 'Click for details'
  el.append(title, result, hint)
  return el
}

function popupContent(row: Inspection) {
  const el = document.createElement('div')
  el.className = 'inspection-popup'

  const title = document.createElement('h3')
  title.textContent = [row.house_number, row.street_name].filter(Boolean).join(' ') || 'Address not listed'
  el.appendChild(title)

  const result = document.createElement('p')
  result.className = `inspection-popup__result inspection-popup__result--${categorize(row.result)}`
  result.textContent = row.result ?? 'No result'
  el.appendChild(result)

  const fields: [string, string | undefined][] = [
    ['Date', new Date(row.inspection_date).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })],
    ['Type', row.inspection_type],
    ['Neighborhood', row.nta],
    ['Borough', [row.borough, row.zip_code].filter(Boolean).join(' ')],
    ['Observed', row.observations],
    ['Follow-up', row.letter_type],
    ['Job ID', row.job_id],
    ['BBL', row.bbl],
  ]
  const dl = document.createElement('dl')
  for (const [label, value] of fields) {
    if (!value) continue
    const dt = document.createElement('dt')
    dt.textContent = label
    const dd = document.createElement('dd')
    dd.textContent = value
    dl.append(dt, dd)
  }
  el.appendChild(dl)
  return el
}

function InspectionMap() {
  const mapEl = useRef<HTMLDivElement>(null)
  const layersRef = useRef<Partial<Record<Category, L.LayerGroup>>>({})
  const mapRef = useRef<L.Map | null>(null)
  const [rows, setRows] = useState<Inspection[] | null>(null)
  const [range, setRange] = useState<[Date, Date] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [hidden, setHidden] = useState<Set<Category>>(new Set())

  // Fetch the most recent week of inspections. The dataset lags a few days and
  // contains some mistyped future dates, so anchor on the latest date up to today.
  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function load() {
      // A day of slack covers viewers west of New York.
      const cutoff = new Date()
      cutoff.setDate(cutoff.getDate() + 1)
      const now = soqlDate(cutoff)
      const latestRes = await fetch(
        `${API}?$select=max(inspection_date) as latest&$where=inspection_date <= '${now}'`,
        { signal },
      )
      if (!latestRes.ok) throw new Error(`NYC Open Data returned ${latestRes.status}`)
      const [{ latest }] = (await latestRes.json()) as { latest: string }[]
      const end = new Date(latest)
      const start = new Date(end)
      start.setDate(start.getDate() - (WINDOW_DAYS - 1))
      start.setHours(0, 0, 0, 0)

      const params = new URLSearchParams({
        $where: `inspection_date between '${soqlDate(start)}' and '${now}' and latitude IS NOT NULL`,
        $order: 'inspection_date DESC',
        $limit: '50000',
      })
      const res = await fetch(`${API}?${params}`, { signal })
      if (!res.ok) throw new Error(`NYC Open Data returned ${res.status}`)
      setRows((await res.json()) as Inspection[])
      setRange([start, end])
    }

    load().catch((e: Error) => {
      if (e.name !== 'AbortError') setError(e.message)
    })
    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!mapEl.current) return
    const map = L.map(mapEl.current, {
      center: [40.7128, -73.95],
      zoom: 11,
      minZoom: 10,
      maxBounds: [[40.35, -74.45], [41.05, -73.5]],
      preferCanvas: true,
      zoomControl: false,
    })
    L.control.zoom({ position: 'topright' }).addTo(map)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> · Data: <a href="https://data.cityofnewyork.us/Health/Rodent-Inspection/p937-wjvj">NYC DOHMH</a>',
      className: 'inspection-map__tiles',
      maxZoom: 19,
    }).addTo(map)
    mapRef.current = map
    return () => {
      map.remove()
      mapRef.current = null
    }
  }, [])

  useEffect(() => {
    const map = mapRef.current
    if (!map || !rows) return
    const groups: Record<Category, L.LayerGroup> = {
      rats: L.layerGroup(),
      other: L.layerGroup(),
      passed: L.layerGroup(),
      treatment: L.layerGroup(),
    }
    // Draw oldest first so the newest inspections sit on top.
    for (const row of [...rows].reverse()) {
      const lat = Number(row.latitude)
      const lng = Number(row.longitude)
      if (!lat || !lng) continue
      const cat = categorize(row.result)
      const color = CATEGORIES.find((c) => c.key === cat)!.color
      L.circleMarker([lat, lng], {
        radius: 6,
        color: '#0e1c23',
        weight: 1,
        fillColor: color,
        fillOpacity: 0.85,
      })
        .bindTooltip(() => tooltipContent(row), {
          direction: 'top',
          offset: [0, -6],
          className: 'inspection-tooltip',
        })
        .bindPopup(() => popupContent(row), { maxWidth: 280 })
        .addTo(groups[cat])
    }
    for (const g of Object.values(groups)) g.addTo(map)
    layersRef.current = groups
    return () => {
      for (const g of Object.values(groups)) g.remove()
    }
  }, [rows])

  useEffect(() => {
    const map = mapRef.current
    if (!map) return
    for (const [key, group] of Object.entries(layersRef.current) as [Category, L.LayerGroup][]) {
      if (hidden.has(key)) group.remove()
      else group.addTo(map)
    }
  }, [hidden, rows])

  const counts = CATEGORIES.map((c) => ({
    ...c,
    count: rows?.filter((r) => categorize(r.result) === c.key).length ?? 0,
  }))

  function toggle(key: Category) {
    setHidden((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  return (
    <div className="inspection-map">
      <div ref={mapEl} className="inspection-map__canvas" />
      <aside className="inspection-map__panel">
        <h1>Rat Inspections</h1>
        <p className="inspection-map__range">
          {error
            ? `Couldn't load data: ${error}`
            : range
              ? `${formatDay(range[0])} – ${formatDay(range[1])} · ${rows!.length.toLocaleString()} visits`
              : 'Loading the latest week…'}
        </p>
        <ul className="inspection-map__legend">
          {counts.map((c) => (
            <li key={c.key}>
              <button
                type="button"
                aria-pressed={!hidden.has(c.key)}
                onClick={() => toggle(c.key)}
              >
                <span className="inspection-map__swatch" style={{ background: c.color }} />
                <span className="inspection-map__label">{c.label}</span>
                <span className="inspection-map__count">{c.count.toLocaleString()}</span>
              </button>
            </li>
          ))}
        </ul>
        <p className="inspection-map__note">
          Hover a dot for the address, click it for the full record. Tap a legend row to hide it.
        </p>
      </aside>
    </div>
  )
}

export default InspectionMap
