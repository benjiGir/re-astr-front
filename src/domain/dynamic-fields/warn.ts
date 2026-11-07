/**
 * D1/B-style probe (docs/PLAN.md §2.1): the dynamic-fields contract is
 * interpreted, not hardened — anything we can't honor (irrelevant
 * validation, malformed regex, depth overflow, ...) is dropped silently in
 * prod and surfaced here in DEV only.
 */
export function devWarn(message: string, detail?: unknown): void {
  if (!import.meta.env.DEV) return
  if (detail !== undefined) {
    console.warn(`[dynamic-fields] ${message}`, detail)
  } else {
    console.warn(`[dynamic-fields] ${message}`)
  }
}
