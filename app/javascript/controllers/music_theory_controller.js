import { Controller } from '@hotwired/stimulus'
import { INSTRUMENTS, defaultTuningKey, tuningStrings } from 'instruments/config'
import { SCALES } from 'theory/scales'
import { CHORDS } from 'theory/chords'
import { noteSet } from 'theory/note_set'
import { diatonicChords } from 'theory/diatonic'
import { play } from 'audio/player'
import { defaultAccidental, isMinorKey, parentMajorRoot, keySignature } from 'theory/spelling'
import { numberToNote, noteToNumber } from 'theory/notes'
import * as fretboard from 'renderers/fretboard_renderer'
import * as keyboard from 'renderers/keyboard_renderer'
import * as fingering from 'renderers/fingering_renderer'
import * as staff from 'renderers/staff_renderer'
import * as circle from 'renderers/circle_of_fifths_renderer'

const RENDERERS = { fretboard: fretboard.draw, keyboard: keyboard.draw, brass: fingering.draw }

export default class extends Controller {
  static targets = ['canvas', 'instrument', 'mode', 'root', 'name', 'accidental', 'octaves', 'labels', 'tuning', 'diatonic', 'play']
  static values = { instrument: String, mode: String, root: String, name: String }

  connect() {
    this.octaves = 1
    this.labelMode = 'names'
    this.accidental = this.keyAccidental()
    this.updateOctavesLabel()
    this.updateLabelsLabel()
    this.populateInstrumentOptions()
    this.instrumentTarget.value = this.instrumentValue
    this.tuningKey = defaultTuningKey(INSTRUMENTS[this.instrumentValue])
    this.populateTuningOptions()
    this.modeTarget.value = this.modeValue
    this.syncRootSpelling()
    this.populateNameOptions()
    if (this.modeValue !== 'notes') this.nameTarget.value = this.nameValue
    this.popstateHandler = () => this.syncFromLocation()
    window.addEventListener('popstate', this.popstateHandler)
    this.clickHandler = (e) => this.onCanvasClick(e)
    this.canvasTarget.addEventListener('click', this.clickHandler)
    this.render()
  }

  disconnect() {
    window.removeEventListener('popstate', this.popstateHandler)
    this.canvasTarget.removeEventListener('click', this.clickHandler)
  }

  // Clicking a key on the always-visible circle jumps the app to that key's scale
  // (outer ring = major, inner ring = relative minor).
  onCanvasClick(event) {
    const canvas = this.canvasTarget
    const rect = canvas.getBoundingClientRect()
    const mx = (event.clientX - rect.left) * (canvas.width / rect.width)
    const my = (event.clientY - rect.top) * (canvas.height / rect.height)
    const center = this.circleCenter || { cx: 700, cy: 300 }
    const hit = circle.hitTest(mx - center.cx, my - center.cy)
    if (!hit) return
    this.modeValue = 'scale'
    this.rootValue = hit.isMinor ? hit.entry.minorRoot : hit.entry.root
    this.nameValue = hit.isMinor ? 'aeolian' : 'major'
    this.modeTarget.value = 'scale'
    this.rootTarget.value = this.rootValue
    this.populateNameOptions()
    this.nameTarget.value = this.nameValue
    this.update()
  }

  onInstrument() {
    this.instrumentValue = this.instrumentTarget.value
    this.tuningKey = defaultTuningKey(INSTRUMENTS[this.instrumentValue])
    this.populateTuningOptions()
    this.update()
  }

  onTuning() { this.tuningKey = this.tuningTarget.value; this.render() }

  // Sound the current note set: chords play together, scales/notes arpeggiate.
  // The AudioContext is created lazily on this click (a user gesture).
  onPlay() {
    if (!this.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      this.audioCtx = new Ctx()
    }
    play(this.audioCtx, this.octaveGroups().flat(), { mode: this.modeValue })
  }
  onMode() { this.modeValue = this.modeTarget.value; this.populateNameOptions(); this.captureName(); this.update() }
  onRoot() { this.rootValue = this.rootTarget.value; this.update() }
  onName() { this.captureName(); this.update() }
  // Manual override for the current view only; any key change re-applies the
  // automatic circle-of-fifths spelling (see keyAccidental / update).
  toggleAccidental() {
    this.accidental = this.accidental === 'sharp' ? 'flat' : 'sharp'
    this.syncRootSpelling()
    this.render()
  }

  // Populate the root dropdown with the 12 notes spelled per the current
  // accidental, and re-spell the current root to match (C# <-> Db, etc.).
  syncRootSpelling() {
    this.rootValue = numberToNote(noteToNumber(this.rootValue), this.accidental)
    this.rootTarget.innerHTML = ''
    for (let i = 0; i < 12; i += 1) {
      const name = numberToNote(i, this.accidental)
      const opt = document.createElement('option')
      opt.value = name
      opt.textContent = name
      this.rootTarget.appendChild(opt)
    }
    this.rootTarget.value = this.rootValue
  }

  toggleOctaves() {
    this.octaves = this.octaves === 1 ? 2 : 1
    this.updateOctavesLabel()
    this.render()
  }

  updateOctavesLabel() {
    if (this.hasOctavesTarget) this.octavesTarget.textContent = `${this.octaves} Octave${this.octaves > 1 ? 's' : ''}`
  }

  toggleLabels() {
    this.labelMode = this.labelMode === 'names' ? 'degrees' : 'names'
    this.updateLabelsLabel()
    this.render()
  }

  updateLabelsLabel() {
    if (this.hasLabelsTarget) this.labelsTarget.textContent = this.labelMode === 'names' ? 'Names' : 'Degrees'
  }

  keyAccidental() {
    return defaultAccidental({ mode: this.modeValue, root: this.rootValue, name: this.nameValue })
  }

  // One note array per octave to display. The staff draws each on its own stacked
  // staff; the instrument view flattens them into a single ascending line.
  octaveGroups() {
    const base = noteSet({ mode: this.modeValue, root: this.rootValue, name: this.nameValue })
    if (this.octaves === 1) return [base]
    const second = base.map((n) => ({ ...n }))
    if (this.modeValue === 'scale') second.push({ ...base[0] })
    return [base, second]
  }

  populateInstrumentOptions() {
    this.instrumentTarget.innerHTML = ''
    Object.keys(INSTRUMENTS).forEach((key) => {
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = INSTRUMENTS[key].name
      this.instrumentTarget.appendChild(opt)
    })
  }

  // Show the tuning dropdown only for fretboard instruments with named tunings;
  // hide it entirely for keyboard/brass.
  populateTuningOptions() {
    if (!this.hasTuningTarget) return
    const config = INSTRUMENTS[this.instrumentValue]
    const tunings = config.tunings
    if (!tunings) { this.tuningTarget.style.display = 'none'; return }
    this.tuningTarget.style.display = ''
    this.tuningTarget.innerHTML = ''
    Object.keys(tunings).forEach((key) => {
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = tunings[key].name
      this.tuningTarget.appendChild(opt)
    })
    this.tuningTarget.value = this.tuningKey
  }

  // Config with the active tuning resolved into a flat `tuning` array for renderers.
  effectiveConfig() {
    const config = INSTRUMENTS[this.instrumentValue]
    if (config.type !== 'fretboard') return config
    return { ...config, tuning: tuningStrings(config, this.tuningKey) }
  }

  // A clickable row of the current key's diatonic triads (scale mode, 7-note
  // scales only). Clicking one loads that chord on the same instrument.
  populateDiatonic() {
    if (!this.hasDiatonicTarget) return
    this.diatonicTarget.innerHTML = ''
    if (this.modeValue !== 'scale') return
    diatonicChords(this.rootValue, this.nameValue, this.accidental).forEach((chord) => {
      const btn = document.createElement('button')
      btn.type = 'button'
      btn.innerHTML = `<span class="roman">${chord.roman}</span><span class="chord">${chord.label}</span>`
      btn.addEventListener('click', () => this.selectDiatonic(chord))
      this.diatonicTarget.appendChild(btn)
    })
  }

  selectDiatonic(chord) {
    this.modeValue = 'chord'
    this.modeTarget.value = 'chord'
    this.rootValue = chord.chordRoot
    this.populateNameOptions()
    this.nameValue = chord.quality
    this.nameTarget.value = chord.quality
    this.update()
  }

  captureName() {
    if (this.modeValue === 'notes') { this.nameValue = ''; return }
    this.nameValue = this.nameTarget.value
  }

  populateNameOptions() {
    const mode = this.modeValue
    this.nameTarget.disabled = mode === 'notes'
    const table = mode === 'chord' ? CHORDS : mode === 'scale' ? SCALES : {}
    this.nameTarget.innerHTML = ''
    Object.keys(table).forEach((key) => {
      if (table[key].alias) return
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = table[key].name
      this.nameTarget.appendChild(opt)
    })
    const usesName = mode === 'scale' || mode === 'chord'
    if (usesName && (!this.nameValue || !table[this.nameValue])) {
      this.nameValue = Object.keys(table).find((key) => !table[key].alias)
    }
    if (usesName) this.nameTarget.value = this.nameValue
  }

  update() {
    this.accidental = this.keyAccidental() // auto sharp/flat from the key
    this.syncRootSpelling()
    this.render()
    this.pushUrl()
  }

  // Brass wraps fingerings into one row per octave; other views take the flat line.
  drawInstrumentView(ctx, config, groups, flat) {
    const opts = { accidental: this.accidental, labelMode: this.labelMode }
    return config.type === 'brass'
      ? fingering.draw(ctx, config, groups, opts)
      : (RENDERERS[config.type] || fretboard.draw)(ctx, config, flat, opts)
  }

  render() {
    this.populateDiatonic()
    const config = this.effectiveConfig()
    const canvas = this.canvasTarget
    const ctx = canvas.getContext('2d')

    const groups = this.octaveGroups()
    const flat = groups.flat()
    const { outerR } = circle.radii()

    // Measure the instrument view on a throwaway pass to size the canvas.
    canvas.width = 900
    canvas.height = 900
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    const dims = this.drawInstrumentView(ctx, config, groups, flat)
    ctx.restore()

    const belowY = (dims && dims.height ? dims.height : 220) + 15
    const circleCx = 705
    const circleCy = belowY + outerR
    this.circleCenter = { cx: circleCx, cy: circleCy }

    // Compact the canvas to just fit the tallest lower element (the circle).
    canvas.height = circleCy + outerR + 20
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.save()
    this.drawInstrumentView(ctx, config, groups, flat)
    ctx.restore()

    // Notes on a single staff (left), second octave simply sits higher.
    ctx.save()
    ctx.translate(0, belowY)
    staff.draw(ctx, [flat], {
      accidental: this.accidental,
      clef: config.clef || 'treble',
      keySig: keySignature({ mode: this.modeValue, root: this.rootValue, name: this.nameValue }),
    })
    ctx.restore()

    // Circle of fifths (right, beside the staff): parent-key wedge + tonic marker.
    ctx.save()
    circle.draw(ctx, circleCx, circleCy, {
      highlightRoot: parentMajorRoot({ mode: this.modeValue, root: this.rootValue, name: this.nameValue }),
      tonicRoot: this.rootValue,
      tonicMinor: isMinorKey({ mode: this.modeValue, name: this.nameValue }),
    })
    ctx.restore()
  }

  pushUrl() {
    const enc = encodeURIComponent
    let path
    if (this.modeValue === 'notes') path = `/${this.instrumentValue}/notes/${enc(this.rootValue)}`
    else path = `/${this.instrumentValue}/${this.modeValue}/${enc(this.rootValue)}/${enc(this.nameValue)}`
    window.history.pushState({}, '', path)
  }

  syncFromLocation() {
    const parts = window.location.pathname.split('/').filter(Boolean).map(decodeURIComponent)
    if (parts.length === 0) return
    const [instrument, mode, root, name] = parts
    this.instrumentValue = instrument
    this.modeValue = mode === 'notes' ? 'notes' : mode
    this.rootValue = root
    this.nameValue = name || ''
    this.instrumentTarget.value = this.instrumentValue
    this.tuningKey = defaultTuningKey(INSTRUMENTS[this.instrumentValue])
    this.populateTuningOptions()
    this.modeTarget.value = this.modeValue
    this.populateNameOptions()
    if (this.modeValue !== 'notes' && name) this.nameTarget.value = name
    this.accidental = this.keyAccidental()
    this.syncRootSpelling()
    this.render()
  }
}
