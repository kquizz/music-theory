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
// ascending. Returns the (possibly resumed) AudioContext.
export function play(ctx, notes, { mode = 'scale' } = {}) {
  if (ctx.state === 'suspended') ctx.resume()
  const midis = ascendingMidi(notes)
  const now = ctx.currentTime + 0.05
  if (mode === 'chord') {
    midis.forEach((m) => tone(ctx, midiToFreq(m), now, 1.2))
  } else {
    const step = 0.28
    midis.forEach((m, i) => tone(ctx, midiToFreq(m), now + i * step, 0.34))
  }
  return ctx
}
