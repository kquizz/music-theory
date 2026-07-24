import { scaleNotes } from 'theory/scales'
import { chordNotes } from 'theory/chords'
import { noteToNumber, normalize } from 'theory/notes'

export function noteSet({ mode, root, name }) {
  if (mode === 'scale') return scaleNotes(root, name)
  if (mode === 'chord') return chordNotes(root, name)
  if (mode === 'notes') {
    const rootNumber = noteToNumber(root)
    return Array.from({ length: 12 }, (_, degree) => ({
      semitone: normalize(rootNumber + degree),
      degree,
    }))
  }
  throw new Error(`Unknown mode: ${mode}`)
}
