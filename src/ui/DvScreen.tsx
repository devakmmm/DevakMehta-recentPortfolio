import { Html } from '@react-three/drei'
import { useStore } from '../store'

// The floating "click me" tag above the laptop screen. The board itself is a canvas texture on the
// screen mesh (ui/dvBoard.ts); this tag is screen-space HTML anchored to the glass. It stays on the
// desk for every visit and hides only while the camera is at the screen (store.pov).
export default function DvScreen({ onTap }: { onTap?: () => void }) {
  const pov = useStore((s) => s.pov)
  if (pov) return null
  return (
    <Html position={[0, 0.082, 0]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'auto' }}>
      <div
        className="dv-tag"
        role="button"
        onPointerDown={(e) => {
          e.stopPropagation()
          if (onTap) onTap()
        }}
        style={{
          cursor: 'pointer',
          fontFamily: 'Helvetica Neue, system-ui, sans-serif',
          fontSize: 14,
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
        Click me
      </div>
    </Html>
  )
}
