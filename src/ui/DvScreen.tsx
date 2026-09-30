import { useEffect, useState } from 'react'
import { Html } from '@react-three/drei'

// The floating "click me" tag above the laptop screen. The board itself is a canvas texture on the
// screen mesh (ui/dvBoard.ts); this tag is screen-space HTML anchored to the glass, hidden after the
// first run (dvBoard emits `dv-runs`).
export default function DvScreen() {
  const [runs, setRuns] = useState(0)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    const onRuns = (e: any) => {
      setRuns(e.detail || 0)
      setRunning(false)
    }
    const onState = (e: any) => {
      if (e.detail && e.detail !== 'idle') setRunning(true)
    }
    window.addEventListener('dv-runs', onRuns)
    window.addEventListener('dv-state', onState)
    return () => {
      window.removeEventListener('dv-runs', onRuns)
      window.removeEventListener('dv-state', onState)
    }
  }, [])
  if (runs > 0 || running) return null
  return (
    <Html position={[0, 0.125, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
      <div
        style={{
          fontFamily: 'Helvetica Neue, system-ui, sans-serif',
          fontSize: 12,
          letterSpacing: '.28em',
          textTransform: 'uppercase',
          color: '#f4f1ea',
          background: 'rgba(12,16,24,.72)',
          border: '1px solid rgba(244,241,234,.14)',
          borderRadius: 999,
          padding: '6px 12px',
          whiteSpace: 'nowrap',
          animation: 'dv-bob 1.6s ease-in-out infinite',
        }}
      >
        <style>{`@keyframes dv-bob{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}`}</style>
        click me ↓
      </div>
    </Html>
  )
}
