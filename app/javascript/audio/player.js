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

// Seconds per beat at a given tempo (BPM).
export function beatSeconds(bpm) {
  return 60 / bpm
}

// Total seconds a `play()` call will take, so a loop knows when to re-trigger.
export function playbackDuration(notes, { mode = 'scale', bpm = 120 } = {}) {
  const beat = beatSeconds(bpm)
  if (mode === 'chord') return beat * 2
  return upAndDown(ascendingMidi(notes)).length * beat
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

// Play a note set through `ctx` at `bpm`. Chords sound together; scales/notes
// arpeggiate up to the octave and back. Returns the (possibly resumed) context.
export function play(ctx, notes, { mode = 'scale', bpm = 120 } = {}) {
  if (ctx.state === 'suspended') ctx.resume()
  const beat = beatSeconds(bpm)
  const now = ctx.currentTime + 0.05
  if (mode === 'chord') {
    ascendingMidi(notes).forEach((m) => tone(ctx, midiToFreq(m), now, beat * 2 * 0.95))
  } else {
    upAndDown(ascendingMidi(notes)).forEach((m, i) => tone(ctx, midiToFreq(m), now + i * beat, beat * 0.9))
  }
  return ctx
}

// Sound a single pitch (for click-to-play on a note/key/fingering).
export function playNote(ctx, midi) {
  if (ctx.state === 'suspended') ctx.resume()
  tone(ctx, midiToFreq(midi), ctx.currentTime + 0.02, 0.6)
  return ctx
}

// Play a sequence of chords (each a note set) as blocks, `beatsPerChord` beats each.
export function playChordSequence(ctx, noteSets, { bpm = 120, beatsPerChord = 2 } = {}) {
  if (ctx.state === 'suspended') ctx.resume()
  const chordDur = beatSeconds(bpm) * beatsPerChord
  let t = ctx.currentTime + 0.05
  noteSets.forEach((notes) => {
    ascendingMidi(notes).forEach((m) => tone(ctx, midiToFreq(m), t, chordDur * 0.92))
    t += chordDur
  })
  return ctx
}

// Play raw MIDI notes: `harmonic` sounds them together (a chord), otherwise they
// play one per beat (a melodic line / interval). For the ear-training quiz.
export function playMidis(ctx, midis, { harmonic = false, bpm = 120 } = {}) {
  if (ctx.state === 'suspended') ctx.resume()
  const beat = beatSeconds(bpm)
  const now = ctx.currentTime + 0.05
  midis.forEach((m, i) => {
    tone(ctx, midiToFreq(m), harmonic ? now : now + i * beat, harmonic ? beat * 2 : beat * 0.9)
  })
  return ctx
}

// A short metronome click; accented beats are higher and louder.
export function metronomeClick(ctx, { accent = false, time } = {}) {
  if (ctx.state === 'suspended') ctx.resume()
  const t = time != null ? time : ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.frequency.value = accent ? 1600 : 1000
  gain.gain.setValueAtTime(0.0001, t)
  gain.gain.exponentialRampToValueAtTime(accent ? 0.5 : 0.32, t + 0.001)
  gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
  osc.connect(gain).connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.06)
  return ctx
}
