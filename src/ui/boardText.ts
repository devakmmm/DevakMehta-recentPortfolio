// What the D.V board says about itself while it works, and how an answer wraps. Pure functions, no
// canvas, so they run under node:test (tests/board-text.test.mjs); ui/dvBoard.ts draws with them.

// A prompt chip reads RUNNING while its answer is being written, so the visitor sees the click landed.
export function chipLabel(label: string, index: number, answering: number | null): string {
  return answering === index ? 'RUNNING' : label
}

// The pill that runs the demo investigation.
export function pillLabel(running: boolean, runs: number): string {
  if (running) return 'RUNNING'
  return runs === 0 ? 'Watch D.V work' : 'Run it again'
}

// The header word after "Ops floor": thinking and speaking both show as running.
export function stateWord(state: string): string {
  return state === 'idle' ? 'all quiet' : 'running'
}

// Greedy word wrap: as many whole words per line as fit maxWidth, measured by the caller's font.
export function wrapText(text: string, maxWidth: number, measure: (s: string) => number): string[] {
  const lines: string[] = []
  let line = ''
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const next = line ? `${line} ${word}` : word
    if (line && measure(next) > maxWidth) {
      lines.push(line)
      line = word
    } else {
      line = next
    }
  }
  if (line) lines.push(line)
  return lines
}
