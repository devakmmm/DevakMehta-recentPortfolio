import { Component, type ReactNode } from 'react'

// Catches an error thrown below it (a 3D asset that did not load: the model, the lighting file) and
// renders `fallback` instead, so one failed request cannot blank the whole page. It says so in the
// console, and `onError` lets the page react (App shows the way to the one-page version).
export default class ErrorBoundary extends Component<
  { fallback: ReactNode; onError?: (error: unknown) => void; children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.warn('[desk] part of the 3D scene failed to load; showing its fallback instead:', error)
    this.props.onError?.(error)
  }

  render() {
    return this.state.failed ? this.props.fallback : this.props.children
  }
}
