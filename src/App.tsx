import React, { useState, useEffect, useRef } from 'react'
import type { CSSProperties, ReactElement } from 'react'
import { Map as MapLibre, Marker, Source, Layer } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import './seil.css'

// ─── Types ────────────────────────────────────────────────────
type Screen = 'chart' | 'instr' | 'route' | 'ais' | 'more' | 'weather'

// ─── Icon ─────────────────────────────────────────────────────
const PATHS: Record<string, ReactElement> = {
  chart: <><path d="M3 6.5 9 4l6 2.5L21 4v13.5L15 20l-6-2.5L3 20z"/><path d="M9 4v13.5M15 6.5V20"/></>,
  gauge: <><path d="M4 19a8 8 0 1 1 16 0"/><path d="M12 19l4.2-5.2" strokeLinejoin="round"/><circle cx="12" cy="19" r="1.4" fill="currentColor" stroke="none"/></>,
  route: <><circle cx="6" cy="18" r="2.4"/><circle cx="18" cy="6" r="2.4"/><path d="M8 16.2c5-1.2 2-7.2 8-8.4" strokeDasharray="0.1 3.4" strokeLinecap="round"/></>,
  ais: <><path d="M12 3 6 19l6-3 6 3z" strokeLinejoin="round"/><path d="M3.5 8a12 12 0 0 1 17 0" opacity=".55"/></>,
  settings: <><circle cx="12" cy="12" r="3.2"/><path d="M12 2.5v3M12 18.5v3M21.5 12h-3M5.5 12h-3M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1M18.7 18.7l-2.1-2.1M7.4 7.4 5.3 5.3"/></>,
  wind: <><path d="M3 9h11a2.6 2.6 0 1 0-2.6-2.6"/><path d="M3 14h15a2.8 2.8 0 1 1-2.8 2.8"/></>,
  anchor: <><circle cx="12" cy="5.5" r="2"/><path d="M12 7.5V20M5.5 13.5A6.5 6.5 0 0 0 12 20a6.5 6.5 0 0 0 6.5-6.5M8.5 11H12m0 0h3.5"/></>,
  compass: <><circle cx="12" cy="12" r="9"/><path d="M15.5 8.5 13 13l-4.5 2.5L11 11z" strokeLinejoin="round" fill="currentColor" stroke="none"/><path d="M12 3v1.6M12 19.4V21M3 12h1.6M19.4 12H21"/></>,
  boat: <><path d="M5 13h14l-1.6 4.2a2 2 0 0 1-1.9 1.3H8.5a2 2 0 0 1-1.9-1.3z"/><path d="M12 13V3l6 7" strokeLinejoin="round"/></>,
  plus: <><path d="M12 5v14M5 12h14" strokeLinecap="round"/></>,
  minus: <><path d="M5 12h14" strokeLinecap="round"/></>,
  crosshair: <><circle cx="12" cy="12" r="4"/><path d="M12 2v3.5M12 18.5V22M2 12h3.5M18.5 12H22"/></>,
  layers: <><path d="M12 3 3 8l9 5 9-5z" strokeLinejoin="round"/><path d="M3.5 12 12 17l8.5-5M3.5 15.5 12 20.5l8.5-5" opacity=".55"/></>,
  search: <><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5" strokeLinecap="round"/></>,
  chevR: <path d="m9 5 7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>,
  chevD: <path d="m5 9 7 7 7-7" strokeLinecap="round" strokeLinejoin="round"/>,
  back: <path d="m15 5-7 7 7 7" strokeLinecap="round" strokeLinejoin="round"/>,
  flag: <><path d="M6 21V4"/><path d="M6 5h11l-2 3.5L17 12H6" strokeLinejoin="round"/></>,
  alert: <><path d="M12 3 2.5 20h19z" strokeLinejoin="round"/><path d="M12 9.5v5M12 17.4v.1" strokeLinecap="round"/></>,
  gps: <><circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none"/><path d="M12 4.5V2M12 22v-2.5M4.5 12H2M22 12h-2.5"/><circle cx="12" cy="12" r="6.5" opacity=".5"/></>,
  moon: <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5z" strokeLinejoin="round"/>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2.5M12 19.5V22M2 12h2.5M19.5 12H22M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19"/></>,
  ruler: <><rect x="3" y="8" width="18" height="8" rx="1.5"/><path d="M7 8v3M11 8v4M15 8v3M19 8v4" opacity=".7"/></>,
  radio: <><circle cx="12" cy="12" r="2" fill="currentColor" stroke="none"/><path d="M8 8a5.6 5.6 0 0 0 0 8M16 8a5.6 5.6 0 0 1 0 8M5.5 5.5a9.2 9.2 0 0 0 0 13M18.5 5.5a9.2 9.2 0 0 1 0 13" opacity=".7"/></>,
  sliders: <><path d="M5 6h14M5 12h14M5 18h14"/><circle cx="9" cy="6" r="2.2" fill="var(--panel)"/><circle cx="15" cy="12" r="2.2" fill="var(--panel)"/><circle cx="8" cy="18" r="2.2" fill="var(--panel)"/></>,
  info: <><circle cx="12" cy="12" r="8.5"/><path d="M12 11v5M12 8v.1" strokeLinecap="round"/></>,
  drop: <path d="M12 3.5c3.2 4 5.5 6.7 5.5 9.7A5.5 5.5 0 0 1 6.5 13.2c0-3 2.3-5.7 5.5-9.7z" strokeLinejoin="round"/>,
  more: <><circle cx="5" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.5" fill="currentColor" stroke="none"/></>,
}

function Icon({ name, size = 24, sw = 1.8, style }: { name: string; size?: number; sw?: number; style?: CSSProperties }): ReactElement {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth={sw} style={style}>
      {PATHS[name] || null}
    </svg>
  )
}

// ─── StatusBar ────────────────────────────────────────────────
function StatusBar({ time = '13:42', over = false }: { time?: string; over?: boolean }) {
  return (
    <div className={'statusbar' + (over ? ' over' : '')}>
      <div className="tnum">{time}</div>
      <div className="sb-right">
        <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--go)', fontSize: 11, fontWeight: 700, letterSpacing: 0.4 }}>
          <Icon name="gps" size={14} sw={2} /> GPS
        </span>
        <svg width="18" height="12" viewBox="0 0 18 12" fill="currentColor">
          <rect x="0" y="8" width="3" height="4" rx="1"/><rect x="5" y="5.5" width="3" height="6.5" rx="1"/>
          <rect x="10" y="3" width="3" height="9" rx="1"/><rect x="15" y="0.5" width="3" height="11.5" rx="1" opacity=".4"/>
        </svg>
        <svg width="26" height="13" viewBox="0 0 26 13" fill="none">
          <rect x="0.6" y="0.6" width="21" height="11.8" rx="3" stroke="currentColor" strokeOpacity=".5"/>
          <rect x="2.4" y="2.4" width="13" height="8.2" rx="1.6" fill="currentColor"/>
          <rect x="23" y="4" width="2.4" height="5" rx="1.2" fill="currentColor" fillOpacity=".5"/>
        </svg>
      </div>
    </div>
  )
}

// ─── TabNav ───────────────────────────────────────────────────
function TabNav({ active, onTab }: { active: Screen; onTab: (s: Screen) => void }) {
  const tabs: { id: Screen; label: string; icon: string }[] = [
    { id: 'chart', label: 'Kart', icon: 'chart' },
    { id: 'instr', label: 'Instrument', icon: 'gauge' },
    { id: 'route', label: 'Rute', icon: 'route' },
    { id: 'ais', label: 'AIS', icon: 'ais' },
    { id: 'more', label: 'Mer', icon: 'settings' },
  ]
  return (
    <nav className="tabnav">
      {tabs.map((t) => (
        <div key={t.id} className={'tab' + (active === t.id ? ' active' : '')} onClick={() => onTab(t.id)}>
          <Icon name={t.icon} size={24} sw={active === t.id ? 2 : 1.8} />
          <span>{t.label}</span>
        </div>
      ))}
    </nav>
  )
}

// ─── Map constants ────────────────────────────────────────────
const KARTVERKET_URL =
  'https://cache.kartverket.no/v1/wmts/1.0.0/sjokartraster/default/webmercator/{z}/{y}/{x}.png'

const OPENSEAMAP_URL = 'https://tiles.openseamap.org/seamark/{z}/{x}/{y}.png'

const MAP_STYLE = {
  version: 8 as const,
  sources: {
    kartverket: { type: 'raster' as const, tiles: [KARTVERKET_URL], tileSize: 256, attribution: '© Kartverket' },
    openseamap: { type: 'raster' as const, tiles: [OPENSEAMAP_URL], tileSize: 256, attribution: '© OpenSeaMap contributors' },
  },
  layers: [
    { id: 'kartverket', type: 'raster' as const, source: 'kartverket' },
    { id: 'openseamap', type: 'raster' as const, source: 'openseamap', paint: { 'raster-opacity': 0.9 as number } },
  ],
}

// Approximate Oslofjord coords: Solvik brygge → Drøbak
const ROUTE_COORDS: [number, number][] = [
  [10.590, 59.875],
  [10.598, 59.832],
  [10.618, 59.790],
  [10.624, 59.748],
  [10.633, 59.675],
]

const OWN_VESSEL = { lon: 10.73358849174145, lat: 59.89893013655055, hdg: 0 }

const ROUTE_GEOJSON = {
  type: 'FeatureCollection' as const,
  features: [{ type: 'Feature' as const, geometry: { type: 'LineString' as const, coordinates: ROUTE_COORDS }, properties: {} }],
}

function OwnVesselMarker({ hdg }: { hdg: number }): ReactElement {
  return (
    <div style={{ transform: `rotate(${hdg}deg)`, pointerEvents: 'none' }}>
      <svg width="44" height="44" viewBox="-22 -22 44 44">
        <circle r="18" fill="rgba(255,122,26,0.18)" stroke="#ff7a1a" strokeWidth="1" opacity="0.7" />
        <line x1="0" y1="-18" x2="0" y2="-38" stroke="#ff7a1a" strokeWidth="1.5" strokeDasharray="2 4" opacity="0.7" />
        <path d="M0 -13 L9 9 L0 4 L-9 9 Z" fill="#ff7a1a" stroke="#0b0500" strokeWidth="1.2" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

function projectPos(lat: number, lon: number, cogDeg: number, sog: number, minutes: number): [number, number] {
  const t = minutes / 60
  const r = cogDeg * Math.PI / 180
  return [lon + sog * t * Math.sin(r) / (60 * Math.cos(lat * Math.PI / 180)), lat + sog * t * Math.cos(r) / 60]
}

function AisMarker({ vessel, onClick }: { vessel: AisVessel; onClick?: () => void }): ReactElement {
  const isRisk = vessel.cpa < 0.5 && vessel.tcpa > 0 && vessel.tcpa < 20
  const col = isRisk ? '#ff4d4d' : '#3ad2ff'
  return (
    <div onClick={e => { e.stopPropagation(); onClick?.() }} style={{ cursor: 'pointer', padding: 6 }}>
      <div style={{ transform: `rotate(${vessel.cog}deg)` }}>
        <svg width="20" height="20" viewBox="0 0 24 24">
          <path d="M12 4 L17 19 L12 16 L7 19 Z" fill={col} stroke="#060d13" strokeWidth="1.2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  )
}

function SeilMap({ route = false, vessels = [], own = OWN_VESSEL_DEFAULT, onVesselSelect }: { route?: boolean; vessels?: AisVessel[]; own?: OwnVessel; onVesselSelect?: (v: AisVessel) => void }): ReactElement {
  const PROJ = 10 // minutes to project ahead
  const vectorData = {
    type: 'FeatureCollection' as const,
    features: [
      ...(own.sog > 0.3 ? [{
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: [[own.lon, own.lat], projectPos(own.lat, own.lon, own.cog, own.sog, PROJ)] },
        properties: { kind: 'own' }
      }] : []),
      ...vessels.filter(v => v.sog > 0.3).map(v => ({
        type: 'Feature' as const,
        geometry: { type: 'LineString' as const, coordinates: [[v.lon, v.lat], projectPos(v.lat, v.lon, v.cog, v.sog, PROJ)] },
        properties: { kind: v.cpa < 0.5 && v.tcpa > 0 && v.tcpa < 20 ? 'risk' : 'normal' }
      }))
    ]
  }

  return (
    <MapLibre
      initialViewState={{ longitude: OWN_VESSEL.lon, latitude: OWN_VESSEL.lat, zoom: 11 }}
      style={{ width: '100%', height: '100%' }}
      mapStyle={MAP_STYLE}
      attributionControl={false}
    >
      <Source id="vectors" type="geojson" data={vectorData}>
        <Layer id="vec-normal" type="line" filter={['==', ['get', 'kind'], 'normal']}
          paint={{ 'line-color': '#3ad2ff', 'line-width': 1.5, 'line-opacity': 0.65, 'line-dasharray': [2, 4] }} />
        <Layer id="vec-risk" type="line" filter={['==', ['get', 'kind'], 'risk']}
          paint={{ 'line-color': '#ff4d4d', 'line-width': 2.5, 'line-opacity': 0.95, 'line-dasharray': [2, 3] }} />
        <Layer id="vec-own" type="line" filter={['==', ['get', 'kind'], 'own']}
          paint={{ 'line-color': '#ff7a1a', 'line-width': 2, 'line-opacity': 0.85, 'line-dasharray': [3, 5] }} />
      </Source>
      {route && (
        <Source id="route" type="geojson" data={ROUTE_GEOJSON}>
          <Layer id="route-line" type="line" paint={{ 'line-color': '#ff7a1a', 'line-width': 2.5, 'line-dasharray': [1, 4] }} />
        </Source>
      )}
      {route && ROUTE_COORDS.map((coord, i) => (
        <Marker key={i} longitude={coord[0]} latitude={coord[1]} anchor="center">
          <div style={{
            width: 18, height: 18, borderRadius: 9,
            background: i === 0 || i === ROUTE_COORDS.length - 1 ? '#ff7a1a' : '#060d13',
            border: '2px solid #ff7a1a',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 8.5, fontWeight: 700, color: '#0b0500',
            fontFamily: 'Barlow Semi Condensed, Barlow, sans-serif',
          }}>
            {i > 0 && i < ROUTE_COORDS.length - 1 ? i : ''}
          </div>
        </Marker>
      ))}
      {vessels.map(v => (
        <Marker key={v.mmsi} longitude={v.lon} latitude={v.lat} anchor="center">
          <AisMarker vessel={v} onClick={() => onVesselSelect?.(v)} />
        </Marker>
      ))}
      <Marker longitude={own.lon} latitude={own.lat} anchor="center">
        <OwnVesselMarker hdg={own.cog || own.hdg} />
      </Marker>
    </MapLibre>
  )
}

// ─── Live data types ──────────────────────────────────────────
interface AisVessel {
  mmsi: number; name: string; lon: number; lat: number
  sog: number; cog: number; hdg: number; type: number
  status: number; cls: string; length: number
  callsign: string; destination: string
  dist: number; brg: number; cpa: number; tcpa: number
}
interface WindData { tws: number; twd: number; temp: number }

// ─── Utils ────────────────────────────────────────────────────
function distNm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2
  return 3440.065 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
function bearingTo(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLon = (lon2 - lon1) * Math.PI / 180
  const y = Math.sin(dLon) * Math.cos(lat2 * Math.PI / 180)
  const x = Math.cos(lat1 * Math.PI / 180) * Math.sin(lat2 * Math.PI / 180) - Math.sin(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.cos(dLon)
  return ((Math.atan2(y, x) * 180 / Math.PI) + 360) % 360
}
function computeCpa(olat: number, olon: number, osog: number, ocog: number, vlat: number, vlon: number, vsog: number, vcog: number): { cpa: number; tcpa: number } {
  const r = Math.PI / 180
  const dx = (vlon - olon) * Math.cos(olat * r) * 60, dy = (vlat - olat) * 60
  const ovx = osog * Math.sin(ocog * r) / 60, ovy = osog * Math.cos(ocog * r) / 60
  const vvx = vsog * Math.sin(vcog * r) / 60, vvy = vsog * Math.cos(vcog * r) / 60
  const rx = vvx - ovx, ry = vvy - ovy, rv2 = rx * rx + ry * ry
  const cur = Math.sqrt(dx * dx + dy * dy)
  if (rv2 < 0.00001) return { cpa: cur, tcpa: 9999 }
  const t = -(dx * rx + dy * ry) / rv2
  if (t < 0) return { cpa: cur, tcpa: 0 }
  return { cpa: Math.sqrt((dx + rx * t) ** 2 + (dy + ry * t) ** 2), tcpa: t }
}
function shipTypeLabel(t: number): string {
  if (t >= 60 && t < 70) return 'Passasjerskip'
  if (t >= 70 && t < 80) return 'Lasteskip'
  if (t >= 80 && t < 90) return 'Tanker'
  if (t === 36 || t === 37) return 'Seilbåt'
  if (t >= 30 && t < 37) return 'Fiskefartøy'
  if (t >= 50 && t < 60) return 'Servicefartøy'
  if (t >= 20 && t < 30) return 'Fritidsbåt'
  return 'Fartøy'
}

// ─── Hooks ────────────────────────────────────────────────────
interface OwnVessel { lon: number; lat: number; hdg: number; sog: number; cog: number; gps: boolean }
const OWN_VESSEL_DEFAULT: OwnVessel = { lon: 10.73358849174145, lat: 59.89893013655055, hdg: 0, sog: 0, cog: 0, gps: false }

function useOwnVessel(): OwnVessel {
  const [v, setV] = useState<OwnVessel>(OWN_VESSEL_DEFAULT)
  const hist = useRef<{ lon: number; lat: number; t: number }[]>([])
  useEffect(() => {
    if (!navigator.geolocation) return
    const id = navigator.geolocation.watchPosition(p => {
      const lon = p.coords.longitude, lat = p.coords.latitude, now = Date.now()
      hist.current.push({ lon, lat, t: now })
      if (hist.current.length > 6) hist.current.shift()
      let sog = 0, cog = 0
      if (hist.current.length >= 2) {
        const prev = hist.current[hist.current.length - 2]
        const dt = (now - prev.t) / 3_600_000
        const moved = distNm(prev.lat, prev.lon, lat, lon)
        if (dt > 0.0005 && moved > 0.005) { sog = moved / dt; cog = bearingTo(prev.lat, prev.lon, lat, lon) }
      }
      setV({ lon, lat, hdg: p.coords.heading ?? cog, sog, cog, gps: true })
    }, () => {}, { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 })
    return () => navigator.geolocation.clearWatch(id)
  }, [])
  return v
}

function useAis(own: OwnVessel) {
  const ownRef = useRef(own)
  ownRef.current = own
  const posHist = useRef<Map<number, { lon: number; lat: number; t: number }[]>>(new Map())
  const [vessels, setVessels] = useState<AisVessel[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updated, setUpdated] = useState<Date | null>(null)

  useEffect(() => {
    async function load() {
      const o = ownRef.current
      const now = Date.now()
      try {
        const r = await fetch('https://kystdatahuset.no/ws/api/ais/realtime/geojson')
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const d = await r.json()
        const parsed: AisVessel[] = (d.features as any[]).flatMap((f: any) => {
          try {
            const raw = f.geometry?.coordinates
            if (!raw?.length) return []
            let lon: number, lat: number
            if (Array.isArray(raw[0])) {
              const last = raw[raw.length - 1]
              if (!last) return []
              ;[lon, lat] = last
            } else {
              ;[lon, lat] = raw
            }
            if (typeof lon !== 'number' || typeof lat !== 'number') return []
            const p = f.properties
            const mmsi: number = p.mmsi

            // Track position history and derive COG/SOG
            const hist = posHist.current.get(mmsi) ?? []
            hist.push({ lon, lat, t: now })
            if (hist.length > 8) hist.shift()
            posHist.current.set(mmsi, hist)
            let sog = p.speed ?? 0, cog = p.cog ?? 0
            if (hist.length >= 2) {
              const prev = hist[hist.length - 2]
              const dt = (now - prev.t) / 3_600_000
              const moved = distNm(prev.lat, prev.lon, lat, lon)
              if (dt > 0.005 && moved > 0.02) { sog = moved / dt; cog = bearingTo(prev.lat, prev.lon, lat, lon) }
            }

            const dist = distNm(o.lat, o.lon, lat, lon)
            const brg = bearingTo(o.lat, o.lon, lat, lon)
            const { cpa, tcpa } = computeCpa(o.lat, o.lon, o.sog, o.cog, lat, lon, sog, cog)
            return [{ mmsi, name: (p.ship_name ?? 'Ukjent').trim() || 'Ukjent', lon, lat, sog, cog, hdg: p.true_heading ?? cog, type: p.ship_type ?? 0, status: p.status ?? 0, cls: p.ais_class ?? 'B', length: p.length ?? 0, callsign: (p.callsign ?? '').trim(), destination: (p.destination ?? '').trim(), dist, brg, cpa, tcpa }]
          } catch { return [] }
        }).filter(v => v.dist < 20).sort((a, b) => a.dist - b.dist).slice(0, 30)
        setVessels(parsed); setUpdated(new Date()); setError(null)
      } catch (e) { console.error('AIS fetch failed:', e); setError('Kunne ikke laste AIS') }
      finally { setLoading(false) }
    }
    load()
    const id = setInterval(load, 60_000)
    return () => clearInterval(id)
  }, [])

  return { vessels, loading, error, updated }
}

function useWind(own: OwnVessel) {
  const [wind, setWind] = useState<WindData | null>(null)
  useEffect(() => {
    async function load() {
      try {
        const r = await fetch(
          `https://api.met.no/weatherapi/locationforecast/2.0/compact?lat=${own.lat.toFixed(4)}&lon=${own.lon.toFixed(4)}`,
          { headers: { 'User-Agent': 'SeilApp/0.1 github.com/aharvik-nam/seil' } }
        )
        if (!r.ok) throw new Error(`HTTP ${r.status}`)
        const d = await r.json()
        const det = d.properties?.timeseries?.[0]?.data?.instant?.details
        if (det) setWind({ tws: +(det.wind_speed * 1.944).toFixed(1), twd: Math.round(det.wind_from_direction), temp: +det.air_temperature.toFixed(1) })
      } catch { /* silent */ }
    }
    load()
    const id = setInterval(load, 600_000)
    return () => clearInterval(id)
  }, [])
  return wind
}

// ─── Vessel info sheet ────────────────────────────────────────
const NAV_STATUS: Record<number, string> = {
  0: 'Under motor', 1: 'For anker', 2: 'Ikke manøverdyktig', 3: 'Begrenset manøvreevne',
  5: 'Fortøyd', 6: 'På grunn', 7: 'Engasjert i fiske', 15: 'Udefinert'
}

function VesselSheet({ vessel, onClose }: { vessel: AisVessel; onClose: () => void }): ReactElement {
  const isRisk = vessel.cpa < 0.5 && vessel.tcpa > 0 && vessel.tcpa < 20
  const isWarn = !isRisk && vessel.cpa < 1 && vessel.tcpa > 0 && vessel.tcpa < 30
  const cpaColor = isRisk ? 'var(--danger)' : isWarn ? 'var(--warn)' : 'var(--go)'
  const tcpaStr = vessel.tcpa >= 9000 ? '–' : vessel.tcpa < 1 ? '<1 min' : `${Math.round(vessel.tcpa)} min`
  const statusStr = NAV_STATUS[vessel.status] ?? `Status ${vessel.status}`
  const Row = ({ label, value, color }: { label: string; value: string; color?: string }) => (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid var(--hairline)' }}>
      <span className="sectlabel" style={{ fontSize: 11 }}>{label}</span>
      <span className="disp tnum" style={{ fontSize: 15, fontWeight: 600, color: color ?? 'var(--text)' }}>{value}</span>
    </div>
  )
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 40 }}
      onClick={e => e.stopPropagation()}>
      <div style={{ background: 'var(--panel)', borderTop: '1px solid var(--hairline-strong)',
        borderTopLeftRadius: 22, borderTopRightRadius: 22, boxShadow: '0 -16px 48px rgba(0,0,0,0.55)' }}>
        {/* Handle + close */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 18px 0' }}>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--hairline-strong)', marginRight: 12, cursor: 'pointer' }} onClick={onClose} />
          <div onClick={onClose} style={{ width: 28, height: 28, borderRadius: 14, background: 'var(--panel-3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-dim)', flexShrink: 0 }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M2 2l10 10M12 2L2 12"/>
            </svg>
          </div>
        </div>
        {/* Name + type */}
        <div style={{ padding: '10px 20px 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 22, fontWeight: 700, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{vessel.name}</span>
            {isRisk && <span style={{ fontSize: 9.5, fontWeight: 800, color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: 4, padding: '2px 6px', flexShrink: 0 }}>KOLLISJON</span>}
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 14 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ais)', background: 'var(--ais-soft)', borderRadius: 6, padding: '2px 8px' }}>{shipTypeLabel(vessel.type)}</span>
            <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>AIS-{vessel.cls}</span>
            {vessel.length > 0 && <span style={{ fontSize: 12, color: 'var(--text-faint)' }}>{vessel.length} m</span>}
          </div>
        </div>
        {/* Data rows */}
        <div style={{ padding: '0 20px 6px' }}>
          <Row label="MMSI" value={String(vessel.mmsi)} />
          {vessel.callsign && <Row label="Kallesignal" value={vessel.callsign} />}
          <Row label="Fart · SOG" value={`${vessel.sog.toFixed(1)} kn`} />
          <Row label="Kurs · COG" value={`${Math.round(vessel.cog)}°`} />
          <Row label="Avstand" value={`${vessel.dist.toFixed(2)} nm`} />
          <Row label="Peiling" value={`${Math.round(vessel.brg)}°`} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '7px 0', borderBottom: '1px solid var(--hairline)' }}>
            <span className="sectlabel" style={{ fontSize: 11 }}>CPA · TCPA</span>
            <span className="disp tnum" style={{ fontSize: 15, fontWeight: 700, color: cpaColor }}>
              {vessel.cpa.toFixed(2)} nm · {tcpaStr}
            </span>
          </div>
          <Row label="Navigasjonsstatus" value={statusStr} color="var(--text-dim)" />
          {vessel.destination && <Row label="Destinasjon" value={vessel.destination} />}
        </div>
        {/* Safe padding for home indicator */}
        <div style={{ height: 16 }} />
      </div>
    </div>
  )
}

// ─── Screen 1: Chart ──────────────────────────────────────────
function windCardinal(deg: number): string {
  const dirs = ['N','NNØ','NØ','ØNØ','Ø','ØSØ','SØ','SSØ','S','SSV','SV','VSV','V','VNV','NV','NNV']
  return dirs[Math.round(deg / 22.5) % 16]
}
function windBeaufort(kn: number): number {
  const scale = [1,3,6,10,16,21,27,33,40,47,55,63]
  return scale.findIndex(v => kn <= v) + (kn > 63 ? 12 : 0)
}

function ChartScreen({ night, onTab, onNightToggle, vessels, own, wind }: { night: boolean; onTab: (s: Screen) => void; onNightToggle: () => void; vessels?: AisVessel[]; own?: OwnVessel; wind?: WindData | null }) {
  const [selected, setSelected] = useState<AisVessel | null>(null)
  return (
    <div className={'scr' + (night ? ' seil-night' : '')} onClick={() => setSelected(null)}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <SeilMap vessels={vessels} own={own} onVesselSelect={v => { setSelected(v); }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(to bottom, var(--scrim), transparent)', zIndex: 10 }} />
        <StatusBar over time={night ? '02:14' : '13:42'} />

        <div style={{ position: 'absolute', top: 50, left: 14, right: 14, zIndex: 20,
          display: 'flex', gap: 10, alignItems: 'center' }}>
          <div className="pill" style={{ flex: 1, height: 46, justifyContent: 'flex-start',
            color: 'var(--text-dim)', background: 'var(--scrim)', backdropFilter: 'blur(8px)' }}>
            <Icon name="search" size={19} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Søk havn eller posisjon</span>
          </div>
          <div className="fab" style={{ width: 46, height: 46 }}><Icon name="layers" size={21} /></div>
        </div>

        {night && (
          <div style={{ position: 'absolute', top: 108, left: 14, zIndex: 20,
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px',
            background: 'var(--scrim)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-pill)',
            color: 'var(--accent)', fontSize: 11, fontWeight: 700, letterSpacing: 1, cursor: 'pointer' }}
            onClick={onNightToggle}>
            <Icon name="moon" size={13} /> NATTSYN
          </div>
        )}

        <div style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
          zIndex: 20, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
          <div className="fab" style={{ width: 48, height: 48 }} onClick={onNightToggle}>
            <Icon name={night ? 'sun' : 'moon'} size={21} style={{ color: night ? 'var(--accent)' : undefined }} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', boxShadow: '0 4px 16px rgba(0,0,0,.3)' }}>
            <div className="fab" style={{ width: 48, height: 48, borderRadius: '14px 14px 0 0',
              borderBottom: '1px solid var(--hairline)' }}><Icon name="plus" size={22} /></div>
            <div className="fab" style={{ width: 48, height: 48, borderRadius: '0 0 14px 14px' }}><Icon name="minus" size={22} /></div>
          </div>
          <div className="fab accent" style={{ width: 52, height: 52, borderRadius: 16 }}>
            <Icon name="crosshair" size={24} sw={2} />
          </div>
        </div>

        {wind && (
          <div style={{ position: 'absolute', left: 14, bottom: 170, zIndex: 20,
            background: 'var(--scrim)', backdropFilter: 'blur(10px)',
            border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)',
            padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ position: 'relative', width: 44, height: 44 }}>
              <svg width="44" height="44" viewBox="0 0 44 44">
                <circle cx="22" cy="22" r="20" fill="none" stroke="var(--hairline-strong)" strokeWidth="1.5" />
                {['N','Ø','S','V'].map((d, i) => (
                  <text key={d} x="22" y="22" textAnchor="middle" dominantBaseline="middle"
                    fontSize="7" fontWeight="700" fill="var(--text-faint)" fontFamily="var(--ui)"
                    transform={`rotate(${i*90} 22 22) translate(0 -12)`}>{d}</text>
                ))}
                <g transform={`rotate(${wind.twd} 22 22)`}>
                  <path d="M22 6 L25 18 L22 16 L19 18 Z" fill="var(--ais)" />
                  <path d="M22 38 L25 26 L22 28 L19 26 Z" fill="var(--text-faint)" opacity="0.5" />
                </g>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: 1.2, color: 'var(--text-faint)', textTransform: 'uppercase' }}>Vind · Bf {windBeaufort(wind.tws)}</div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                <span className="disp" style={{ fontSize: 26, fontWeight: 700, lineHeight: 1, color: 'var(--ais)' }}>{wind.tws}</span>
                <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)' }}>kn</span>
              </div>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)' }}>fra {windCardinal(wind.twd)} · {wind.temp}°C</div>
            </div>
          </div>
        )}

        <div style={{ position: 'absolute', left: 18, bottom: 116, zIndex: 20 }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8 }}>
            <svg width="86" height="14" viewBox="0 0 86 14">
              <path d="M1 4 V13 M85 4 V13 M1 13 H85" stroke="var(--text)" strokeWidth="1.6" fill="none" strokeOpacity=".85" />
              <path d="M43 8 V13" stroke="var(--text)" strokeWidth="1.4" strokeOpacity=".6" />
            </svg>
            <span className="mono tnum" style={{ fontSize: 11, fontWeight: 600 }}>500 m</span>
          </div>
          <div className="mono tnum" style={{ fontSize: 10.5, color: 'var(--text-dim)', marginTop: 6 }}>
            59°54.32′N&nbsp;&nbsp;10°43.18′E
          </div>
        </div>

        <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 20,
          display: 'flex', alignItems: 'center', gap: 4, padding: '12px 18px 14px',
          background: 'linear-gradient(to top, var(--bg) 28%, transparent)' }}>
          {[
            { lab: 'SOG', val: own?.sog ? own.sog.toFixed(1) : '0.0', unit: 'kn', color: 'var(--accent)' },
            { lab: 'COG', val: own?.cog ? String(Math.round(own.cog)).padStart(3,'0') : '000', unit: '°', color: '' },
            { lab: 'Dybde', val: '18.4', unit: 'm', color: '' },
            { lab: 'TWS', val: wind ? String(wind.tws) : '–', unit: 'kn', color: '' },
          ].map(({ lab, val, unit, color }, i) => (
            <React.Fragment key={lab}>
              {i > 0 && <div style={{ width: 1, height: 30, background: 'var(--hairline-strong)' }} />}
              <div className="dchip" style={{ flex: 1 }}>
                <span className="lab">{lab}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span className="val" style={{ fontSize: 26, color: color || 'var(--text)' }}>{val}</span>
                  <span className="unit">{unit}</span>
                </span>
              </div>
            </React.Fragment>
          ))}
        </div>
        {selected && <VesselSheet vessel={selected} onClose={() => setSelected(null)} />}
      </div>
      <TabNav active="chart" onTab={onTab} />
      <div className="home-ind" />
    </div>
  )
}

// ─── Screen 2: Instruments ────────────────────────────────────
function CompassDial({ hdg = 34 }: { hdg?: number }) {
  const ticks: ReactElement[] = []
  for (let a = 0; a < 360; a += 10) {
    const major = a % 30 === 0
    const r1 = 54, r2 = major ? 45 : 49
    const rad = (a - 90) * Math.PI / 180
    ticks.push(<line key={a} x1={60 + r1 * Math.cos(rad)} y1={60 + r1 * Math.sin(rad)}
      x2={60 + r2 * Math.cos(rad)} y2={60 + r2 * Math.sin(rad)}
      stroke="var(--text-faint)" strokeWidth={major ? 1.6 : 1} opacity={major ? 0.9 : 0.5} />)
  }
  return (
    <svg viewBox="0 0 120 120" width="116" height="116">
      <g transform={`rotate(${-hdg} 60 60)`}>
        {ticks}
        {([['N',0],['Ø',90],['S',180],['V',270]] as [string,number][]).map(([l,a]) => {
          const rad = (a - 90) * Math.PI / 180
          return <text key={l} x={60 + 36 * Math.cos(rad)} y={60 + 36 * Math.sin(rad) + 4}
            textAnchor="middle" fontSize="13" fontWeight="700" fontFamily="Barlow Semi Condensed"
            fill={l === 'N' ? 'var(--accent)' : 'var(--text-dim)'}>{l}</text>
        })}
      </g>
      <path d="M60 3 l5 9 h-10 z" fill="var(--accent)" />
      <text x="60" y="58" textAnchor="middle" fontSize="30" fontWeight="700" fontFamily="Barlow Semi Condensed"
        fill="var(--text)" style={{ fontVariantNumeric: 'tabular-nums' }}>{String(hdg).padStart(3,'0')}</text>
      <text x="60" y="74" textAnchor="middle" fontSize="11" fontWeight="600" fill="var(--text-faint)">COG</text>
    </svg>
  )
}

function WindDial() {
  const awa = 52
  const rad = (awa - 90) * Math.PI / 180
  const R = 86, cx = 110, cy = 110
  return (
    <svg viewBox="0 0 220 220" width="100%" height="222" style={{ display: 'block' }} preserveAspectRatio="xMidYMid meet">
      <circle cx={cx} cy={cy} r={R} fill="none" stroke="var(--hairline-strong)" strokeWidth="2" />
      <path d={`M${cx} ${cy-R} A${R} ${R} 0 0 0 ${cx} ${cy+R}`} fill="none" stroke="var(--port)" strokeWidth="4" opacity="0.85" />
      <path d={`M${cx} ${cy-R} A${R} ${R} 0 0 1 ${cx} ${cy+R}`} fill="none" stroke="var(--stbd)" strokeWidth="4" opacity="0.85" />
      {Array.from({length:36}).map((_,i) => {
        const a=(i*10-90)*Math.PI/180, r2=i%3===0?R-12:R-7
        return <line key={i} x1={cx+(R-2)*Math.cos(a)} y1={cy+(R-2)*Math.sin(a)}
          x2={cx+r2*Math.cos(a)} y2={cy+r2*Math.sin(a)} stroke="var(--text-faint)" strokeWidth="1" opacity="0.5"/>
      })}
      <path d={`M${cx} ${cy-40} C${cx+13} ${cy-18},${cx+13} ${cy+24},${cx} ${cy+34} C${cx-13} ${cy+24},${cx-13} ${cy-18},${cx} ${cy-40}Z`}
        fill="var(--panel-3)" stroke="var(--hairline-strong)" strokeWidth="1.4" />
      <line x1={cx+(R-4)*Math.cos(rad)} y1={cy+(R-4)*Math.sin(rad)} x2={cx} y2={cy}
        stroke="var(--accent)" strokeWidth="3" strokeLinecap="round" />
      <path d={`M${cx+(R-4)*Math.cos(rad)} ${cy+(R-4)*Math.sin(rad)} l${-8*Math.cos(rad-0.5)} ${-8*Math.sin(rad-0.5)} M${cx+(R-4)*Math.cos(rad)} ${cy+(R-4)*Math.sin(rad)} l${-8*Math.cos(rad+0.5)} ${-8*Math.sin(rad+0.5)}`}
        stroke="var(--accent)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x={cx} y={cy-2} textAnchor="middle" fontSize="34" fontWeight="700" fontFamily="Barlow Semi Condensed"
        fill="var(--text)" style={{ fontVariantNumeric: 'tabular-nums' }}>52°</text>
      <text x={cx} y={cy+16} textAnchor="middle" fontSize="11" fontWeight="700" fill="var(--text-faint)" letterSpacing="1.5">AWA · STB</text>
    </svg>
  )
}

function DepthSpark() {
  const h = [30,26,22,24,19,16,18,14,12,15]
  return (
    <svg viewBox="0 0 120 40" width="100%" height="40" preserveAspectRatio="none">
      {h.map((v,i) => (
        <rect key={i} x={i*12+1} y={40-v} width="9" height={v} rx="1.5"
          fill={v<14?'var(--warn)':'var(--accent)'} opacity={0.35+i*0.06}/>
      ))}
    </svg>
  )
}

function InstrumentScreen({ onTab, wind }: { onTab: (s: Screen) => void; wind?: WindData | null }) {
  const Tile = ({ children, style, pad = 16 }: { children: React.ReactNode; style?: CSSProperties; pad?: number }) => (
    <div style={{ background:'var(--panel)', border:'1px solid var(--hairline)', borderRadius:'var(--r-lg)', padding:pad, position:'relative', ...style }}>{children}</div>
  )
  const Mini = ({ lab, val, unit, color }: { lab:string; val:string; unit:string; color?:string }) => (
    <div style={{ flex:1, padding:'12px 14px', background:'var(--panel)', border:'1px solid var(--hairline)', borderRadius:'var(--r-md)' }}>
      <div className="sectlabel" style={{ fontSize:10, marginBottom:6 }}>{lab}</div>
      <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
        <span className="disp" style={{ fontSize:22, fontWeight:700, color:color||'var(--text)' }}>{val}</span>
        <span style={{ fontSize:11, fontWeight:600, color:'var(--text-dim)' }}>{unit}</span>
      </div>
    </div>
  )
  return (
    <div className="scr">
      <StatusBar />
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'4px 20px 10px' }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700, letterSpacing:-0.4 }}>Instrumenter</h1>
        <div className="fab" style={{ width:40, height:40, borderRadius:12, background:'var(--panel)' }}><Icon name="sliders" size={20} /></div>
      </div>
      <div style={{ flex:1, minHeight:0, padding:'0 16px', display:'flex', flexDirection:'column', gap:10, overflowY:'auto' }}>
        <Tile style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div className="sectlabel" style={{ color:'var(--accent)', marginBottom:8 }}>Fart over grunn · SOG</div>
            <div style={{ display:'flex', alignItems:'baseline', gap:6 }}>
              <span className="disp" style={{ fontSize:60, fontWeight:700, lineHeight:0.9, color:'var(--accent)' }}>6.2</span>
              <span style={{ fontSize:18, fontWeight:600, color:'var(--text-dim)' }}>kn</span>
            </div>
          </div>
          <div style={{ textAlign:'right', display:'flex', flexDirection:'column', gap:10 }}>
            <div><div className="sectlabel" style={{ fontSize:10 }}>Maks</div><div className="disp tnum" style={{ fontSize:18 }}>8.1</div></div>
            <div><div className="sectlabel" style={{ fontSize:10 }}>Snitt</div><div className="disp tnum" style={{ fontSize:18 }}>5.4</div></div>
          </div>
        </Tile>
        <Tile pad={14}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
            <div className="sectlabel" style={{ marginBottom:8 }}>Vind</div>
            <span className="sectlabel" style={{ fontSize:10, color:'var(--accent)' }}>SANN ⇄ TILSYN.</span>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
            <div style={{ flex:'0 0 52%' }}><WindDial /></div>
            <div style={{ flex:1, display:'flex', flexDirection:'column', gap:12 }}>
              {([['TWS', wind ? String(wind.tws) : '–', 'kn'], ['TWD', wind ? String(wind.twd)+'°' : '–', ''], ['Temp', wind ? String(wind.temp)+'°' : '–', 'C']] as [string,string,string][]).map(([l,v,u]) => (
                <div key={l} style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between' }}>
                  <span className="sectlabel" style={{ fontSize:11 }}>{l}</span>
                  <span><span className="disp" style={{ fontSize:22, fontWeight:700 }}>{v}</span>
                    <span style={{ fontSize:11, color:'var(--text-dim)', marginLeft:3 }}>{u}</span></span>
                </div>
              ))}
            </div>
          </div>
        </Tile>
        <div style={{ display:'flex', gap:10 }}>
          <Tile style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center' }} pad={12}>
            <div className="sectlabel" style={{ marginBottom:8 }}>Kurs over grunn</div>
            <CompassDial hdg={34} />
          </Tile>
          <Tile style={{ flex:1, display:'flex', flexDirection:'column' }} pad={14}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div className="sectlabel" style={{ marginBottom:8 }}>Dybde</div>
              <Icon name="drop" size={15} style={{ color:'var(--text-faint)' }} />
            </div>
            <div style={{ display:'flex', alignItems:'baseline', gap:4 }}>
              <span className="disp" style={{ fontSize:40, fontWeight:700, lineHeight:0.9 }}>18.4</span>
              <span style={{ fontSize:14, color:'var(--text-dim)' }}>m</span>
            </div>
            <div style={{ flex:1 }} />
            <div style={{ margin:'8px 0 6px' }}><DepthSpark /></div>
            <div style={{ fontSize:11, color:'var(--text-faint)', fontWeight:600 }}>Alarm &lt; 3,0 m · offset 0,8 m</div>
          </Tile>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          <Mini lab="VMG" val="4.8" unit="kn" color="var(--accent)" />
          <Mini lab="Vanntemp" val="14.2" unit="°C" />
          <Mini lab="Tur" val="12.7" unit="nm" />
        </div>
      </div>
      <TabNav active="instr" onTab={onTab} />
      <div className="home-ind" />
    </div>
  )
}

// ─── Screen 3: Route ──────────────────────────────────────────
const ROUTE_DATA = [
  { x:188, y:486, name:'Solvik brygge', tag:'Start' as string|undefined },
  { x:214, y:402, name:'Veipunkt 1', tag:undefined },
  { x:244, y:322, name:'Steilene Ø', tag:undefined },
  { x:212, y:244, name:'Veipunkt 3', tag:undefined },
  { x:252, y:168, name:'Drøbak gjestehavn', tag:'Mål' as string|undefined },
]
const LEGS = [
  { brg:'028°', dist:'1,9', eta:'14:02' },
  { brg:'019°', dist:'2,3', eta:'14:24' },
  { brg:'347°', dist:'1,8', eta:'14:41' },
  { brg:'022°', dist:'2,4', eta:'15:04' },
]

function RouteScreen({ onTab }: { onTab: (s: Screen) => void }) {
  return (
    <div className="scr">
      <div style={{ position:'relative', flex:1, minHeight:0 }}>
        <SeilMap route />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:110,
          background:'linear-gradient(to bottom, var(--scrim), transparent)', zIndex:10 }} />
        <StatusBar over />
        <div style={{ position:'absolute', top:50, left:14, right:14, zIndex:20,
          display:'flex', alignItems:'center', gap:10 }}>
          <div className="fab" style={{ width:44, height:44 }} onClick={() => onTab('chart')}><Icon name="back" size={22} /></div>
          <div className="pill" style={{ flex:1, justifyContent:'space-between', height:44,
            background:'var(--scrim)', backdropFilter:'blur(8px)' }}>
            <span style={{ fontWeight:700, whiteSpace:'nowrap' }}>Rute · Drøbak</span>
            <Icon name="more" size={20} style={{ color:'var(--text-dim)' }} />
          </div>
        </div>
        <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:20,
          height:392, background:'var(--panel)', borderTopLeftRadius:22, borderTopRightRadius:22,
          borderTop:'1px solid var(--hairline)', boxShadow:'0 -12px 40px rgba(0,0,0,.45)',
          display:'flex', flexDirection:'column' }}>
          <div style={{ width:40, height:5, borderRadius:3, background:'var(--hairline-strong)', margin:'10px auto 8px' }} />
          <div style={{ display:'flex', padding:'4px 18px 14px', gap:10, borderBottom:'1px solid var(--hairline)' }}>
            {([['Distanse','8,4','nm'],['Seiltid','1:22','t'],['ETA','15:04','']] as [string,string,string][]).map(([l,v,u],i) => (
              <div key={l} style={{ flex:1, borderLeft:i?'1px solid var(--hairline)':'none', paddingLeft:i?12:0 }}>
                <div className="sectlabel" style={{ fontSize:10, marginBottom:4 }}>{l}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
                  <span className="disp" style={{ fontSize:24, fontWeight:700, color:i===0?'var(--accent)':'var(--text)' }}>{v}</span>
                  <span style={{ fontSize:11, color:'var(--text-dim)' }}>{u}</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ flex:1, overflow:'hidden', padding:'6px 18px 0' }}>
            {ROUTE_DATA.map((wp, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'9px 0',
                borderBottom:i<ROUTE_DATA.length-1?'1px solid var(--hairline)':'none' }}>
                <div style={{ width:22, height:22, borderRadius:11,
                  border:'2px solid var(--accent)', background:wp.tag?'var(--accent)':'var(--panel)',
                  color:wp.tag?'#0b0500':'var(--accent)', display:'flex', alignItems:'center',
                  justifyContent:'center', fontSize:11, fontWeight:700, flexShrink:0 }}>
                  {wp.tag==='Start' ? <Icon name="boat" size={12} /> : wp.tag==='Mål' ? <Icon name="flag" size={12} /> : i}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:15, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{wp.name}</div>
                  {wp.tag && <div className="sectlabel" style={{ fontSize:9.5, color:'var(--accent)' }}>{wp.tag}</div>}
                </div>
                {i < LEGS.length && (
                  <div style={{ textAlign:'right' }}>
                    <div className="mono tnum" style={{ fontSize:13, fontWeight:600 }}>{LEGS[i].dist} nm · {LEGS[i].brg}</div>
                    <div className="mono tnum" style={{ fontSize:11, color:'var(--text-faint)' }}>ETA {LEGS[i].eta}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <div style={{ display:'flex', gap:10, padding:'12px 18px 16px', borderTop:'1px solid var(--hairline)' }}>
            <div className="fab" style={{ width:52, height:52, borderRadius:16, background:'var(--panel-2)' }}>
              <Icon name="plus" size={22} />
            </div>
            <button style={{ flex:1, height:52, border:'none', borderRadius:16, background:'var(--accent)',
              color:'#0b0500', fontFamily:'Barlow, sans-serif', fontWeight:700, fontSize:16,
              display:'flex', alignItems:'center', justifyContent:'center', gap:8, cursor:'pointer' }}>
              <svg width="18" height="18" viewBox="0 0 18 18" fill="#0b0500"><path d="M4 3l11 6-11 6z"/></svg>
              Start navigasjon
            </button>
          </div>
        </div>
      </div>
      <TabNav active="route" onTab={onTab} />
      <div className="home-ind" />
    </div>
  )
}

// ─── Screen 4: Weather ────────────────────────────────────────
function WeatherScreen({ onTab }: { onTab: (s: Screen) => void }) {
  const hours = ['10','13','16','19','22','01','04']
  const active = 1
  return (
    <div className="scr">
      <div style={{ position:'relative', flex:1, minHeight:0 }}>
        <SeilMap />
        <div style={{ position:'absolute', top:0, left:0, right:0, height:110,
          background:'linear-gradient(to bottom, var(--scrim), transparent)', zIndex:10 }} />
        <StatusBar over />
        <div style={{ position:'absolute', top:50, left:14, right:14, zIndex:20, display:'flex', alignItems:'center', gap:10 }}>
          <div className="fab" style={{ width:44, height:44 }} onClick={() => onTab('chart')}><Icon name="back" size={22} /></div>
          <div className="pill" style={{ flex:1, justifyContent:'space-between', height:44,
            background:'var(--scrim)', backdropFilter:'blur(8px)' }}>
            <span style={{ fontWeight:700, whiteSpace:'nowrap' }}>Væroverlegg</span>
            <span className="sectlabel" style={{ fontSize:10, color:'var(--accent)', whiteSpace:'nowrap' }}>SV 12 KN · G18</span>
          </div>
        </div>
        <div style={{ position:'absolute', top:104, left:14, right:14, zIndex:20,
          display:'flex', gap:6, padding:4, background:'var(--scrim)', backdropFilter:'blur(8px)',
          border:'1px solid var(--hairline)', borderRadius:'var(--r-pill)' }}>
          {['Vind','Bølger','Regn','Trykk'].map((l,i) => (
            <div key={l} style={{ flex:1, height:34, borderRadius:'var(--r-pill)',
              display:'flex', alignItems:'center', justifyContent:'center',
              background:i===0?'var(--accent)':'transparent',
              color:i===0?'#0b0500':'var(--text-dim)', fontWeight:700, fontSize:13 }}>{l}</div>
          ))}
        </div>
        <div style={{ position:'absolute', left:16, bottom:132, zIndex:20,
          padding:'10px 12px', background:'var(--scrim)', backdropFilter:'blur(8px)',
          border:'1px solid var(--hairline)', borderRadius:'var(--r-md)' }}>
          <div className="sectlabel" style={{ fontSize:9.5, marginBottom:7 }}>Vindstyrke · kn</div>
          <div style={{ width:132, height:8, borderRadius:4,
            background:'linear-gradient(90deg, #5fb8c8, var(--go), var(--warn), var(--danger))' }} />
          <div className="mono tnum" style={{ display:'flex', justifyContent:'space-between',
            fontSize:9.5, color:'var(--text-dim)', marginTop:4, width:132 }}>
            <span>0</span><span>10</span><span>20</span><span>30+</span>
          </div>
        </div>
        <div style={{ position:'absolute', left:0, right:0, bottom:0, zIndex:20,
          background:'linear-gradient(to top, var(--bg) 64%, transparent)', padding:'24px 16px 12px' }}>
          <div style={{ background:'var(--panel)', border:'1px solid var(--hairline)', borderRadius:'var(--r-lg)', padding:'12px 14px' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:8 }}>
                <span style={{ fontSize:15, fontWeight:700 }}>I dag 13:00</span>
                <span className="sectlabel" style={{ fontSize:10 }}>MET · varsel +0t</span>
              </div>
              <div className="fab accent" style={{ width:34, height:34, borderRadius:10 }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="#0b0500"><path d="M3 2l9 5-9 5z"/></svg>
              </div>
            </div>
            <div style={{ position:'relative', height:30 }}>
              <div style={{ position:'absolute', top:14, left:0, right:0, height:3, borderRadius:2, background:'var(--panel-3)' }} />
              <div style={{ position:'absolute', top:14, left:0, width:'18%', height:3, borderRadius:2, background:'var(--accent)' }} />
              <div style={{ display:'flex', justifyContent:'space-between', position:'relative' }}>
                {hours.map((h,i) => (
                  <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                    <div style={{ width:i===active?14:7, height:i===active?14:7, borderRadius:8,
                      background:i===active?'var(--accent)':'var(--panel-3)',
                      border:i===active?'3px solid var(--bg)':'none',
                      boxShadow:i===active?'0 0 0 1.5px var(--accent)':'none',
                      marginTop:i===active?3:7 }} />
                    <span className="mono tnum" style={{ fontSize:11, fontWeight:600,
                      color:i===active?'var(--text)':'var(--text-faint)' }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <TabNav active="chart" onTab={onTab} />
      <div className="home-ind" />
    </div>
  )
}

// ─── Screen 5: AIS ────────────────────────────────────────────
function AisScreen({ onTab, vessels, loading, error, updated }: {
  onTab: (s: Screen) => void
  vessels: AisVessel[]
  loading: boolean
  error: string | null
  updated: Date | null
}) {
  const riskCount = vessels.filter(v => v.cpa < 0.5 && v.tcpa < 20).length
  return (
    <div className="scr">
      <StatusBar />
      <div style={{ padding:'4px 18px 12px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, letterSpacing:-0.4, whiteSpace:'nowrap' }}>Fartøy i nærheten</h1>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
            {loading
              ? <span style={{ fontSize:13, color:'var(--text-faint)' }}>Laster AIS…</span>
              : error
                ? <span style={{ fontSize:13, color:'var(--danger)' }}>{error}</span>
                : <>
                    <span style={{ fontSize:13, color:'var(--ais)', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
                      <span style={{ width:7, height:7, borderRadius:4, background:'var(--ais)', display:'inline-block' }} /> {vessels.length} mål
                    </span>
                    <span style={{ fontSize:13, color:'var(--text-faint)' }}>· innen 20 nm</span>
                    {updated && <span style={{ fontSize:11, color:'var(--text-faint)' }}>· {updated.getHours()}:{String(updated.getMinutes()).padStart(2,'0')}</span>}
                  </>
            }
            {riskCount > 0 && <span style={{ fontSize:11, fontWeight:800, color:'var(--danger)', border:'1px solid var(--danger)', borderRadius:4, padding:'1px 5px' }}>{riskCount} FARE</span>}
          </div>
        </div>
        <div className="fab" style={{ width:40, height:40, borderRadius:12, background:'var(--panel)', flexShrink:0 }}>
          <Icon name="radio" size={20} />
        </div>
      </div>
      <div style={{ display:'flex', gap:8, padding:'0 18px 12px' }}>
        {['Avstand','CPA','Navn'].map((s,i) => (
          <div key={s} style={{ height:32, padding:'0 14px', borderRadius:'var(--r-pill)',
            display:'flex', alignItems:'center', gap:5, fontSize:13, fontWeight:600,
            background:i===0?'var(--accent-soft)':'var(--panel)',
            border:'1px solid '+(i===0?'var(--accent)':'var(--hairline)'),
            color:i===0?'var(--accent)':'var(--text-dim)' }}>
            {i===0 && <Icon name="chevD" size={13} sw={2.2} />}{s}
          </div>
        ))}
      </div>
      <div style={{ flex:1, minHeight:0, overflowY:'auto', borderTop:'1px solid var(--hairline)' }}>
        {vessels.map(v => {
          const isRisk = v.cpa < 0.5 && v.tcpa < 20
          const isNear = !isRisk && v.cpa < 1 && v.tcpa < 30
          const isAnchored = v.sog < 0.3
          const cpaCol = isRisk?'var(--danger)':isNear?'var(--warn)':'var(--text-dim)'
          const col = isRisk?'var(--danger)':isAnchored?'var(--text-faint)':'var(--ais)'
          const bg = isRisk?'rgba(255,77,77,0.14)':isAnchored?'rgba(150,178,196,0.10)':'var(--ais-soft)'
          const tcpaStr = v.tcpa >= 9000 ? '–' : v.tcpa < 1 ? '<1 min' : `${Math.round(v.tcpa)} min`
          return (
            <div key={v.mmsi} style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 18px',
              background:isRisk?'rgba(255,77,77,0.06)':'transparent',
              borderBottom:'1px solid var(--hairline)',
              boxShadow:isRisk?'inset 3px 0 0 var(--danger)':'none' }}>
              <div style={{ width:46, height:46, borderRadius:13, background:bg, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {isAnchored
                  ? <Icon name="anchor" size={22} style={{ color:col }} />
                  : <svg width="24" height="24" viewBox="0 0 24 24">
                      <g transform={`rotate(${v.cog} 12 12)`}>
                        <path d="M12 4 L17 19 L12 16 L7 19 Z" fill={col} />
                      </g>
                    </svg>}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <span style={{ fontSize:16, fontWeight:700, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{v.name}</span>
                  {isRisk && <span style={{ fontSize:9.5, fontWeight:800, color:'var(--danger)',
                    border:'1px solid var(--danger)', borderRadius:4, padding:'1px 5px', flexShrink:0 }}>FARE</span>}
                </div>
                <div className="sectlabel" style={{ fontSize:10.5, marginTop:2, color:'var(--text-dim)', letterSpacing:0.6 }}>{shipTypeLabel(v.type)} · {v.cls}</div>
                <div className="mono" style={{ fontSize:10.5, color:'var(--text-faint)', marginTop:3 }}>MMSI {v.mmsi}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:4, justifyContent:'flex-end' }}>
                  <span className="disp tnum" style={{ fontSize:19, fontWeight:700 }}>{v.dist.toFixed(1)}</span>
                  <span style={{ fontSize:11, color:'var(--text-dim)' }}>nm</span>
                </div>
                <div className="mono tnum" style={{ fontSize:11, color:'var(--text-faint)', marginTop:1 }}>{Math.round(v.brg)}° · {v.sog.toFixed(1)} kn</div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:5, padding:'2px 7px',
                  borderRadius:'var(--r-pill)', background:isRisk?'rgba(255,77,77,0.16)':'var(--panel-2)' }}>
                  <span className="mono tnum" style={{ fontSize:10.5, fontWeight:600, color:cpaCol }}>CPA {v.cpa.toFixed(1)} nm · {tcpaStr}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
      <TabNav active="ais" onTab={onTab} />
      <div className="home-ind" />
    </div>
  )
}

// ─── Screen 6: Settings ───────────────────────────────────────
function SettingsScreen({ onTab, night, onNightToggle }: { onTab: (s: Screen) => void; night: boolean; onNightToggle: () => void }) {
  const SRow = ({ icon, label, value, chev, toggle, on, last }: {
    icon:string; label:string; value?:string; chev?:boolean; toggle?:boolean; on?:boolean; last?:boolean
  }) => (
    <div style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 15px', minHeight:54,
      borderBottom:last?'none':'1px solid var(--hairline)' }}>
      <div style={{ width:32, height:32, borderRadius:9, background:'var(--panel-2)', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text-dim)' }}>
        <Icon name={icon} size={18} />
      </div>
      <span style={{ flex:1, fontSize:15, fontWeight:500 }}>{label}</span>
      {value && <span className="tnum" style={{ fontSize:14, color:'var(--text-dim)', fontWeight:500, whiteSpace:'nowrap' }}>{value}</span>}
      {toggle && (
        <div style={{ width:46, height:28, borderRadius:14, padding:3, flexShrink:0,
          background:on?'var(--accent)':'var(--panel-3)', display:'flex',
          justifyContent:on?'flex-end':'flex-start', alignItems:'center', cursor:'pointer' }}>
          <div style={{ width:22, height:22, borderRadius:11, background:on?'#0b0500':'var(--text-dim)' }} />
        </div>
      )}
      {chev && <Icon name="chevR" size={16} sw={2} style={{ color:'var(--text-faint)' }} />}
    </div>
  )
  const Group = ({ title, children }: { title:string; children:React.ReactNode }) => (
    <div style={{ marginBottom:18 }}>
      <div className="sectlabel" style={{ margin:'0 6px 8px' }}>{title}</div>
      <div style={{ background:'var(--panel)', border:'1px solid var(--hairline)', borderRadius:'var(--r-lg)', overflow:'hidden' }}>
        {children}
      </div>
    </div>
  )
  return (
    <div className="scr">
      <StatusBar />
      <div style={{ padding:'4px 20px 12px' }}>
        <h1 style={{ margin:0, fontSize:24, fontWeight:700, letterSpacing:-0.4 }}>Innstillinger</h1>
      </div>
      <div style={{ flex:1, minHeight:0, overflowY:'auto', padding:'0 16px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:14, padding:15, marginBottom:18,
          background:'var(--panel)', border:'1px solid var(--hairline)', borderRadius:'var(--r-lg)' }}>
          <div style={{ width:54, height:54, borderRadius:15, background:'var(--accent-soft)',
            display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Icon name="boat" size={28} style={{ color:'var(--accent)' }} />
          </div>
          <div style={{ flex:1, minWidth:0 }}>
            <div style={{ fontSize:18, fontWeight:700 }}>Seil av Drøbak</div>
            <div className="sectlabel" style={{ fontSize:11, marginTop:2 }}>Seilbåt · Bavaria 34</div>
          </div>
          <div style={{ padding:'7px 14px', borderRadius:'var(--r-pill)', background:'var(--panel-2)',
            border:'1px solid var(--hairline)', fontSize:13, fontWeight:600, color:'var(--text-dim)' }}>Rediger</div>
        </div>
        <div style={{ display:'flex', gap:10, marginBottom:18 }}>
          {([['Lengde','11,4','m'],['Bredde','3,6','m'],['Dypgang','1,9','m']] as [string,string,string][]).map(([l,v,u]) => (
            <div key={l} style={{ flex:1, padding:'12px 14px', background:'var(--panel)',
              border:'1px solid var(--hairline)', borderRadius:'var(--r-md)' }}>
              <div className="sectlabel" style={{ fontSize:10, marginBottom:6 }}>{l}</div>
              <div style={{ display:'flex', alignItems:'baseline', gap:3 }}>
                <span className="disp tnum" style={{ fontSize:22, fontWeight:700 }}>{v}</span>
                <span style={{ fontSize:11, color:'var(--text-dim)' }}>{u}</span>
              </div>
            </div>
          ))}
        </div>
        <Group title="Visning">
          <div style={{ display:'flex', gap:6, padding:13 }}>
            {([['moon','Mørk'],['drop','Nattsyn'],['sun','Auto']] as [string,string][]).map(([ic,l],i) => (
              <div key={l} style={{ flex:1, height:62, borderRadius:'var(--r-md)',
                display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:6,
                background:(i===0&&!night)||(i===1&&night)?'var(--accent-soft)':'var(--panel-2)',
                border:'1.5px solid '+((i===0&&!night)||(i===1&&night)?'var(--accent)':'transparent'),
                color:(i===0&&!night)||(i===1&&night)?'var(--accent)':i===1?'var(--danger)':'var(--text-dim)',
                cursor:'pointer' }}
                onClick={i===1?onNightToggle:i===0?()=>{if(night)onNightToggle()}:undefined}>
                <Icon name={ic} size={20} />
                <span style={{ fontSize:12, fontWeight:700 }}>{l}</span>
              </div>
            ))}
          </div>
          <div style={{ borderTop:'1px solid var(--hairline)' }} />
          <SRow icon="ruler" label="Enheter" value="kn · nm · m" chev />
          <SRow icon="layers" label="Sjøkart" value="Norge · NO" chev />
          <SRow icon="sun" label="Hold skjerm våken" toggle on last />
        </Group>
        <Group title="Sikkerhet">
          <SRow icon="drop" label="Dybdealarm" value="3,0 m" chev />
          <SRow icon="alert" label="Grunnvarsel" toggle on />
          <SRow icon="ais" label="AIS-fareavstand (CPA)" value="0,5 nm" chev last />
        </Group>
        <Group title="Fartøy · AIS">
          <SRow icon="radio" label="MMSI" value="257 199 040" chev />
          <SRow icon="info" label="Kallesignal" value="LA1234" chev last />
        </Group>
      </div>
      <TabNav active="more" onTab={onTab} />
      <div className="home-ind" />
    </div>
  )
}

// ─── App shell ────────────────────────────────────────────────
export default function App() {
  const [screen, setScreen] = useState<Screen>('chart')
  const [night, setNight] = useState(false)
  const own = useOwnVessel()
  const { vessels, loading: aisLoading, error: aisError, updated: aisUpdated } = useAis(own)
  const wind = useWind(own)

  const onTab = (s: Screen) => setScreen(s)
  const onNightToggle = () => setNight(n => !n)

  return (
    <div style={{
      minHeight: '100dvh',
      background: '#111',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px 16px',
      gap: 16,
    }}>
      {/* label */}
      <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, fontFamily: 'system-ui', letterSpacing: '0.5px' }}>
        SEIL — tap tabs to navigate · moon icon toggles night vision
      </div>

      {/* phone frame */}
      <div style={{
        width: 390,
        height: 844,
        borderRadius: 44,
        overflow: 'hidden',
        boxShadow: '0 40px 100px rgba(0,0,0,0.8), inset 0 0 0 1.5px rgba(255,255,255,0.1)',
        position: 'relative',
        flexShrink: 0,
      }}>
        {screen === 'chart'   && <ChartScreen night={night} onTab={onTab} onNightToggle={onNightToggle} vessels={vessels} own={own} wind={wind} />}
        {screen === 'instr'   && <InstrumentScreen onTab={onTab} wind={wind} />}
        {screen === 'route'   && <RouteScreen onTab={onTab} />}
        {screen === 'weather' && <WeatherScreen onTab={onTab} />}
        {screen === 'ais'     && <AisScreen onTab={onTab} vessels={vessels} loading={aisLoading} error={aisError} updated={aisUpdated} />}
        {screen === 'more'    && <SettingsScreen onTab={onTab} night={night} onNightToggle={onNightToggle} />}
      </div>
    </div>
  )
}
