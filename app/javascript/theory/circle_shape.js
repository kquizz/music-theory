// Describes a scale's footprint on the circle of fifths: how many of its notes
// sit next to each other, and how many are off by themselves.

// Pure: lengths of each run of occupied circle slots, wrapping past slot 11.
function runs(occupied) {
  const n = occupied.length
  if (occupied.every(Boolean)) return [n]
  const start = occupied.findIndex((o) => !o) // begin on a gap so no run is split
  const lengths = []
  let run = 0
  for (let i = 1; i <= n; i++) {
    if (occupied[(start + i) % n]) run++
    else if (run) { lengths.push(run); run = 0 }
  }
  return lengths
}

const GROUP_WORDS = { 1: 'single notes', 2: 'pairs', 3: 'groups of 3' }

// Pure: plain-English circle footprint for a scale's semitone intervals.
export function circleShape(intervals) {
  const occupied = Array(12).fill(false)
  intervals.forEach((pc) => { occupied[(pc * 7) % 12] = true })
  const count = occupied.filter(Boolean).length
  const lengths = runs(occupied)
  const run = Math.max(...lengths)
  if (run === count) return `${count} neighbors in a row on the circle`
  // Symmetric scales (whole tone, diminished) split into equal groups.
  if (lengths.every((l) => l === run)) {
    if (run === 1 && count === 6) return 'every other spot on the circle'
    return `${lengths.length} ${GROUP_WORDS[run] || `groups of ${run}`}, spread evenly around the circle`
  }
  const rest = count - run
  return `${run} neighbors in a row + ${rest} ${rest === 1 ? 'note' : 'notes'} elsewhere on the circle`
}
