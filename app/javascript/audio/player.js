// Web Audio playback for note sets. The pure helpers (midiToFreq, ascendingMidi)
// are unit-tested; scheduling runs only in the browser (no AudioContext in Node).

// Equal-tempered frequency of a MIDI note number (A4 = 69 = 440 Hz).
export function midiToFreq(midi) {
  return 440 * Math.pow(2, (midi - 69) / 12)
}

// Voice a degree-tagged note set (pitch classes) as strictly ascending MIDI
// numbers starting in the octave of `baseMidi` (default C4 = 60), so a scale
// climbs and a chord spreads upward instead of collapsing to one octave.
export function ascendingMidi(notes, baseMidi = 60) {
  const octaveFloor = baseMidi - (baseMidi % 12)
  let prev = -Infinity
  return notes.map((n) => {
    let midi = octaveFloor + n.semitone
    while (midi <= prev) midi += 12
    prev = midi
    return midi
  })
}

// Turn an ascending run into "up then back down": add the octave tonic as the
// peak when the top note isn't already the tonic, then mirror the descent without
// repeating the peak. A single note stays a single note.
export function upAndDown(midis) {
  if (!midis.length) return []
  const up = midis.slice()
  if (up[up.length - 1] % 12 !== up[0] % 12) up.push(up[0] + 12)
  return [...up, ...up.slice(0, -1).reverse()]
}

// One enveloped tone; short attack/release avoids clicks.
function tone(ctx, freq, start, duration) {
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freq
  const peak = 0.22
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(peak, start + 0.02)
  gain.gain.setValueAtTime(peak, start + duration - 0.06)
  gain.gain.linearRampToValueAtTime(0, start + duration)
  osc.connect(gain).connect(ctx.destination)
  osc.start(start)
  osc.stop(start + duration)
}

// Play a note set through `ctx`. Chords sound together; scales/notes arpeggiate
// up to the octave and back down. Returns the (possibly resumed) AudioContext.
export function play(ctx, notes, { mode = 'scale' } = {}) {
  if (ctx.state === 'suspended') ctx.resume()
  const now = ctx.currentTime + 0.05
  if (mode === 'chord') {
    ascendingMidi(notes).forEach((m) => tone(ctx, midiToFreq(m), now, 1.2))
  } else {
    const step = 0.28
    upAndDown(ascendingMidi(notes)).forEach((m, i) => tone(ctx, midiToFreq(m), now + i * step, 0.34))
  }
  return ctx
}

// Sound a single pitch (for click-to-play on a note/key/fingering).
export function playNote(ctx, midi) {
  if (ctx.state === 'suspended') ctx.resume()
  tone(ctx, midiToFreq(midi), ctx.currentTime + 0.02, 0.6)
  return ctx
}

// Play a sequence of chords (each a note set) as blocks, one per beat.
export function playChordSequence(ctx, noteSets, { chordDur = 1.0 } = {}) {
  if (ctx.state === 'suspended') ctx.resume()
  let t = ctx.currentTime + 0.05
  noteSets.forEach((notes) => {
    ascendingMidi(notes).forEach((m) => tone(ctx, midiToFreq(m), t, chordDur * 0.92))
    t += chordDur
  })
  return ctx
}
