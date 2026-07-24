import { Controller } from '@hotwired/stimulus'
import { INSTRUMENTS } from 'instruments/config'
import { SCALES } from 'theory/scales'
import { CHORDS } from 'theory/chords'
import { noteSet } from 'theory/note_set'
import { defaultAccidental } from 'theory/spelling'
import { normalize } from 'theory/notes'
import * as fretboard from 'renderers/fretboard_renderer'
import * as keyboard from 'renderers/keyboard_renderer'
import * as fingering from 'renderers/fingering_renderer'
import * as staff from 'renderers/staff_renderer'

const RENDERERS = { fretboard: fretboard.draw, keyboard: keyboard.draw, brass: fingering.draw }

export default class extends Controller {
  static targets = ['canvas', 'instrument', 'mode', 'root', 'name', 'accidental']
  static values = { instrument: String, mode: String, root: String, name: String }

  connect() {
    this.accidentalOverridden = false
    this.accidental = this.keyAccidental()
    this.populateInstrumentOptions()
    this.instrumentTarget.value = this.instrumentValue
    this.modeTarget.value = this.modeValue
    this.rootTarget.value = this.rootValue
    this.populateNameOptions()
    if (this.modeValue !== 'notes') this.nameTarget.value = this.nameValue
    this.popstateHandler = () => this.syncFromLocation()
    window.addEventListener('popstate', this.popstateHandler)
    this.render()
  }

  disconnect() {
    window.removeEventListener('popstate', this.popstateHandler)
  }

  onInstrument() { this.instrumentValue = this.instrumentTarget.value; this.update() }
  onMode() { this.modeValue = this.modeTarget.value; this.populateNameOptions(); this.captureName(); this.update() }
  onRoot() { this.rootValue = this.rootTarget.value; this.update() }
  onName() { this.captureName(); this.update() }
  toggleAccidental() {
    this.accidentalOverridden = true
    this.accidental = this.accidental === 'sharp' ? 'flat' : 'sharp'
    this.render()
  }

  keyAccidental() {
    return defaultAccidental({ mode: this.modeValue, root: this.rootValue, name: this.nameValue })
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
    if (mode !== 'notes' && (!this.nameValue || !table[this.nameValue])) {
      this.nameValue = Object.keys(table).find((key) => !table[key].alias)
    }
    if (mode !== 'notes') this.nameTarget.value = this.nameValue
  }

  update() {
    if (!this.accidentalOverridden) this.accidental = this.keyAccidental()
    this.render()
    this.pushUrl()
  }

  render() {
    const config = INSTRUMENTS[this.instrumentValue]
    const concertNotes = noteSet({ mode: this.modeValue, root: this.rootValue, name: this.nameValue })
    // Transposing instruments read WRITTEN pitches; concert instruments read as-is.
    const transpose = config.transpose || 0
    const notes = transpose
      ? concertNotes.map((n) => ({ ...n, semitone: normalize(n.semitone + transpose) }))
      : concertNotes
    const canvas = this.canvasTarget
    const ctx = canvas.getContext('2d')

    const drawInstrument = RENDERERS[config.type] || fretboard.draw
    canvas.width = 900
    canvas.height = 460
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    const dims = drawInstrument(ctx, config, notes, { accidental: this.accidental })
    ctx.restore()

    ctx.save()
    ctx.translate(0, (dims && dims.height ? dims.height : 220))
    staff.draw(ctx, notes, { accidental: this.accidental, clef: config.clef || 'treble' })
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
    this.modeTarget.value = this.modeValue
    this.rootTarget.value = this.rootValue
    this.populateNameOptions()
    if (this.modeValue !== 'notes' && name) this.nameTarget.value = name
    this.accidentalOverridden = false
    this.accidental = this.keyAccidental()
    this.render()
  }
}
