/**
 * Pure deterministic scoring for MCQ attempts. No I/O, no LLM —
 * the correct answer never leaves the server; this just compares indices.
 */

export function scoreMcq(selectedIndex: number | null | undefined, correctIndex: number): boolean {
  if (!Number.isInteger(selectedIndex)) return false;
  return selectedIndex === correctIndex;
}

/** Timeout/skip (null selection) is always incorrect. */
export function isAnswered(selectedIndex: number | null | undefined): boolean {
  return Number.isInteger(selectedIndex);
}
