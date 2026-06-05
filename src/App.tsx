import React, { useState } from 'react'
import type { CSSProperties, ReactElement } from 'react'
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

// ─── ChartMap ─────────────────────────────────────────────────
const LAND_A = "M -30 -30 L 168 -30 C 170 48, 104 78, 130 138 C 150 186, 92 214, 44 236 C 14 250, -30 236 -30 236 Z"
const LAND_B = "M 430 860 L 430 452 C 372 452, 338 506, 306 548 C 274 590, 306 644, 262 686 C 230 716, 252 806, 232 860 Z"
const ISLE   = "M 286 150 C 312 142, 338 158, 332 178 C 326 198, 300 206, 282 196 C 266 187, 264 158, 286 150 Z"
const ROUTE_PTS = [
  { x: 188, y: 486 }, { x: 214, y: 402 }, { x: 244, y: 322 },
  { x: 212, y: 244 }, { x: 252, y: 168 },
]

function WindBarb({ x, y, dir, kn }: { x: number; y: number; dir: number; kn: number }): ReactElement {
  const col = kn < 8 ? '#5fb8c8' : kn < 16 ? 'var(--go)' : kn < 24 ? 'var(--warn)' : 'var(--danger)'
  return (
    <g transform={`translate(${x} ${y}) rotate(${dir})`} opacity="0.92">
      <line x1="0" y1="-13" x2="0" y2="11" stroke={col} strokeWidth="1.7" strokeLinecap="round" />
      <path d="M0 11 l -3.4 -5 M0 11 l 3.4 -5" stroke={col} strokeWidth="1.7" fill="none" strokeLinecap="round" />
      {kn >= 16 && <line x1="0" y1="-13" x2="6" y2="-16" stroke={col} strokeWidth="1.7" strokeLinecap="round" />}
      {kn >= 8 && <line x1="0" y1="-9" x2="6" y2="-12" stroke={col} strokeWidth="1.7" strokeLinecap="round" />}
    </g>
  )
}

function ChartMap({ boat = { x: 196, y: 432, hdg: 34 }, route = false, wind = false, marks = true, grid = true }: {
  boat?: { x: number; y: number; hdg: number }
  route?: boolean; wind?: boolean; marks?: boolean; grid?: boolean
}) {
  const winds: ReactElement[] = []
  if (wind) {
    let i = 0
    for (let gy = 110; gy <= 700; gy += 96) {
      for (let gx = 60; gx <= 340; gx += 92) {
        const jitter = ((gx * 7 + gy * 3) % 18) - 9
        const kn = 9 + ((gx + gy) % 5) * 3 + (gy > 460 ? 5 : 0)
        winds.push(<WindBarb key={i++} x={gx + (i % 2 ? 16 : 0)} y={gy} dir={28 + jitter} kn={kn} />)
      }
    }
  }
  return (
    <svg className="chartmap" viewBox="0 0 390 820" preserveAspectRatio="xMidYMid slice">
      <defs>
        <radialGradient id="water" cx="46%" cy="40%" r="80%">
          <stop offset="0%" stopColor="var(--water-mid)" />
          <stop offset="100%" stopColor="var(--water-deep)" />
        </radialGradient>
      </defs>
      <rect x="0" y="0" width="390" height="820" fill="url(#water)" />
      {grid && (
        <g stroke="var(--hairline)" strokeWidth="1">
          <line x1="0" y1="250" x2="390" y2="250" /><line x1="0" y1="560" x2="390" y2="560" />
          <line x1="130" y1="0" x2="130" y2="820" /><line x1="285" y1="0" x2="285" y2="820" />
        </g>
      )}
      <g fill="none" stroke="var(--water-shallow)" strokeWidth="26" strokeLinejoin="round" opacity="0.9">
        <path d={LAND_A} /><path d={LAND_B} /><path d={ISLE} />
      </g>
      <g fill="none" stroke="var(--water-shallow)" strokeWidth="12" strokeLinejoin="round" opacity="0.65">
        <path d={LAND_A} /><path d={LAND_B} /><path d={ISLE} />
      </g>
      <g fill="none" stroke="var(--depth-line)" strokeWidth="1" strokeDasharray="2 5">
        <path d="M -10 200 C 70 196 92 250 70 300 C 50 344 -4 350 -20 360" />
        <path d="M 320 470 C 286 506 300 556 256 600 C 224 632 252 690 236 740" />
        <path d="M 250 150 C 300 130 360 168 348 196" opacity=".7" />
      </g>
      <g stroke="var(--land-edge)" strokeWidth="1.4" strokeLinejoin="round">
        <path d={LAND_A} fill="var(--land)" />
        <path d={LAND_B} fill="var(--land)" />
        <path d={ISLE} fill="var(--land-2)" />
      </g>
      <g>
        {[{x:150,y:330,n:'12'},{x:210,y:250,n:'24'},{x:196,y:470,n:'31'},{x:262,y:392,n:'28'},
          {x:96,y:430,n:'8'},{x:300,y:300,n:'6'},{x:150,y:560,n:'22'},{x:250,y:520,n:'19'},
          {x:330,y:420,n:'34'},{x:120,y:620,n:'15'}].map(({x,y,n}) => (
          <text key={`${x}${y}`} x={x} y={y} fill="var(--depth-text)" fontSize="11"
            fontFamily="IBM Plex Mono" textAnchor="middle" style={{ fontVariantNumeric: 'tabular-nums' }}>{n}</text>
        ))}
      </g>
      {marks && (
        <g>
          <g>
            <line x1="120" y1="300" x2="120" y2="286" stroke="var(--stbd)" strokeWidth="1.6"/>
            <path d="M120 278 l5 7 h-10 z" fill="var(--stbd)"/>
            <circle cx="120" cy="300" r="2" fill="var(--stbd)"/>
            <text x="128" y="287" fill="var(--text-dim)" fontSize="9.5" fontFamily="IBM Plex Mono">G5</text>
          </g>
          <g>
            <line x1="262" y1="360" x2="262" y2="346" stroke="var(--port)" strokeWidth="1.6"/>
            <rect x="257.5" y="339" width="9" height="7" fill="var(--port)"/>
            <circle cx="262" cy="360" r="2" fill="var(--port)"/>
            <text x="270" y="347" fill="var(--text-dim)" fontSize="9.5" fontFamily="IBM Plex Mono">R6</text>
          </g>
          <g>
            <line x1="232" y1="560" x2="232" y2="546" stroke="var(--warn)" strokeWidth="1.6"/>
            <circle cx="232" cy="543" r="4.5" fill="var(--warn)"/>
            <circle cx="232" cy="560" r="2" fill="var(--warn)"/>
            <text x="240" y="547" fill="var(--text-dim)" fontSize="9.5" fontFamily="IBM Plex Mono">Skjær</text>
          </g>
        </g>
      )}
      {wind && <g>{winds}</g>}
      {route && (
        <g>
          <polyline points={ROUTE_PTS.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="var(--accent)" strokeWidth="2.4"
            strokeDasharray="1 8" strokeLinecap="round" opacity="0.95" />
          {ROUTE_PTS.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r={i === 0 ? 5 : 6.5} fill="var(--bg)" stroke="var(--accent)" strokeWidth="2.2" />
              {i > 0 && <text x={p.x} y={p.y + 3.3} textAnchor="middle" fontSize="8.5"
                fontWeight="700" fill="var(--accent)" fontFamily="Barlow Semi Condensed">{i}</text>}
            </g>
          ))}
        </g>
      )}
      <g transform={`translate(${boat.x} ${boat.y})`}>
        <circle r="46" fill="var(--accent-soft)" />
        <circle r="46" fill="none" stroke="var(--accent)" strokeWidth="1" strokeOpacity="0.4" />
        <g transform={`rotate(${boat.hdg})`}>
          <line x1="0" y1="0" x2="0" y2="-118" stroke="var(--accent)" strokeWidth="1.6"
            strokeDasharray="2 6" opacity="0.8" />
          <path d="M0 -16 L9 10 L0 4 L-9 10 Z" fill="var(--accent)"
            stroke="#0b0500" strokeWidth="1.2" strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  )
}

// ─── Screen 1: Chart ──────────────────────────────────────────
function ChartScreen({ night, onTab, onNightToggle }: { night: boolean; onTab: (s: Screen) => void; onNightToggle: () => void }) {
  return (
    <div className={'scr' + (night ? ' seil-night' : '')}>
      <div style={{ position: 'relative', flex: 1, minHeight: 0 }}>
        <ChartMap />
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
            { lab: 'SOG', val: '6.2', unit: 'kn', color: 'var(--accent)' },
            { lab: 'COG', val: '034', unit: '°', color: '' },
            { lab: 'Dybde', val: '18.4', unit: 'm', color: '' },
            { lab: 'TWS', val: '12', unit: 'kn', color: '' },
          ].map(({ lab, val, unit, color }, i) => (
            <>
              {i > 0 && <div key={`d${i}`} style={{ width: 1, height: 30, background: 'var(--hairline-strong)' }} />}
              <div key={lab} className="dchip" style={{ flex: 1 }}>
                <span className="lab">{lab}</span>
                <span style={{ display: 'flex', alignItems: 'baseline', gap: 3 }}>
                  <span className="val" style={{ fontSize: 26, color: color || 'var(--text)' }}>{val}</span>
                  <span className="unit">{unit}</span>
                </span>
              </div>
            </>
          ))}
        </div>
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

function InstrumentScreen({ onTab }: { onTab: (s: Screen) => void }) {
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
              {([['AWS','14.6','kn'],['TWS','12.1','kn'],['TWA','38°','stb'],['TWD','215°','']] as [string,string,string][]).map(([l,v,u]) => (
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
        <ChartMap route marks={false} />
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
        <ChartMap wind marks={false} grid={false} />
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
const VESSELS = [
  { name:'Color Hybrid', type:'Passasjerferge · NOR', mmsi:'257234000', dist:'1,2', brg:'047°', sog:'14.2', cpa:'0,3', tcpa:'4 min', risk:true },
  { name:'Sjøblomst', type:'Seilbåt', mmsi:'257901230', dist:'0,4', brg:'305°', sog:'5.1', cpa:'0,9', tcpa:'21 min', near:true },
  { name:'Nordic Star', type:'Lasteskip · NOR', mmsi:'259187000', dist:'2,6', brg:'118°', sog:'11.4', cpa:'1,1', tcpa:'17 min' },
  { name:'Drøbak I', type:'Rutebåt', mmsi:'257660010', dist:'1,9', brg:'088°', sog:'9.6', cpa:'1,5', tcpa:'12 min' },
  { name:'Havørn II', type:'Fiskefartøy', mmsi:'257445120', dist:'3,1', brg:'201°', sog:'3.8', cpa:'2,4', tcpa:'31 min' },
  { name:'Frøya', type:'Fritidsbåt · ankret', mmsi:'257120880', dist:'0,8', brg:'342°', sog:'0.0', cpa:'—', tcpa:'Ankret', anchored:true },
] as const

function AisScreen({ onTab }: { onTab: (s: Screen) => void }) {
  return (
    <div className="scr">
      <StatusBar />
      <div style={{ padding:'4px 18px 12px', display:'flex', alignItems:'center', gap:12 }}>
        <div style={{ flex:1, minWidth:0 }}>
          <h1 style={{ margin:0, fontSize:24, fontWeight:700, letterSpacing:-0.4, whiteSpace:'nowrap' }}>Fartøy i nærheten</h1>
          <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:6 }}>
            <span style={{ fontSize:13, color:'var(--ais)', fontWeight:600, display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ width:7, height:7, borderRadius:4, background:'var(--ais)', display:'inline-block' }} /> 14 mål
            </span>
            <span style={{ fontSize:13, color:'var(--text-faint)' }}>· innen 6 nm</span>
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
        {VESSELS.map((v,i) => {
          const isRisk = 'risk' in v && v.risk
          const isNear = 'near' in v && v.near
          const isAnchored = 'anchored' in v && v.anchored
          const cpaCol = isRisk?'var(--danger)':isNear?'var(--warn)':'var(--text-dim)'
          const col = isRisk?'var(--danger)':isAnchored?'var(--text-faint)':'var(--ais)'
          const bg = isRisk?'rgba(255,77,77,0.14)':isAnchored?'rgba(150,178,196,0.10)':'var(--ais-soft)'
          const rot = parseInt(v.brg) || 0
          return (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:13, padding:'13px 18px',
              background:isRisk?'rgba(255,77,77,0.06)':'transparent',
              borderBottom:'1px solid var(--hairline)',
              boxShadow:isRisk?'inset 3px 0 0 var(--danger)':'none' }}>
              <div style={{ width:46, height:46, borderRadius:13, background:bg, flexShrink:0,
                display:'flex', alignItems:'center', justifyContent:'center' }}>
                {isAnchored
                  ? <Icon name="anchor" size={22} style={{ color:col }} />
                  : <svg width="24" height="24" viewBox="0 0 24 24">
                      <g transform={`rotate(${rot} 12 12)`}>
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
                <div className="sectlabel" style={{ fontSize:10.5, marginTop:2, color:'var(--text-dim)', letterSpacing:0.6 }}>{v.type}</div>
                <div className="mono" style={{ fontSize:10.5, color:'var(--text-faint)', marginTop:3 }}>MMSI {v.mmsi}</div>
              </div>
              <div style={{ textAlign:'right', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'baseline', gap:4, justifyContent:'flex-end' }}>
                  <span className="disp tnum" style={{ fontSize:19, fontWeight:700 }}>{v.dist}</span>
                  <span style={{ fontSize:11, color:'var(--text-dim)' }}>nm</span>
                </div>
                <div className="mono tnum" style={{ fontSize:11, color:'var(--text-faint)', marginTop:1 }}>{v.brg} · {v.sog} kn</div>
                <div style={{ display:'inline-flex', alignItems:'center', gap:4, marginTop:5, padding:'2px 7px',
                  borderRadius:'var(--r-pill)', background:isRisk?'rgba(255,77,77,0.16)':'var(--panel-2)' }}>
                  <span className="mono tnum" style={{ fontSize:10.5, fontWeight:600, color:cpaCol }}>CPA {v.cpa} · {v.tcpa}</span>
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
        {screen === 'chart'   && <ChartScreen night={night} onTab={onTab} onNightToggle={onNightToggle} />}
        {screen === 'instr'   && <InstrumentScreen onTab={onTab} />}
        {screen === 'route'   && <RouteScreen onTab={onTab} />}
        {screen === 'weather' && <WeatherScreen onTab={onTab} />}
        {screen === 'ais'     && <AisScreen onTab={onTab} />}
        {screen === 'more'    && <SettingsScreen onTab={onTab} night={night} onNightToggle={onNightToggle} />}
      </div>
    </div>
  )
}
