import { Controller } from '@hotwired/stimulus'
import { INSTRUMENTS } from 'instruments/config'
import { SCALES } from 'theory/scales'
import { CHORDS } from 'theory/chords'
import { noteSet } from 'theory/note_set'
import { defaultAccidental } from 'theory/spelling'
import * as fretboard from 'renderers/fretboard_renderer'
import * as keyboard from 'renderers/keyboard_renderer'
import * as staff from 'renderers/staff_renderer'

export default class extends Controller {
  static targets = ['canvas', 'instrument', 'mode', 'root', 'name', 'accidental']
  static values = { instrument: String, mode: String, root: String, name: String }

  connect() {
    this.accidentalOverridden = false
    this.accidental = this.keyAccidental()
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
      const opt = document.createElement('option')
      opt.value = key
      opt.textContent = table[key].name
      this.nameTarget.appendChild(opt)
    })
    if (mode !== 'notes' && (!this.nameValue || !table[this.nameValue])) {
      this.nameValue = Object.keys(table)[0]
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
    const notes = noteSet({ mode: this.modeValue, root: this.rootValue, name: this.nameValue })
    const canvas = this.canvasTarget
    const ctx = canvas.getContext('2d')

    // Size for the instrument view first, then reserve space for the staff below.
    const drawInstrument = config.type === 'keyboard' ? keyboard.draw : fretboard.draw
    // Measure by drawing to an offscreen pass would be ideal; instead use fixed generous canvas.
    canvas.width = 900
    canvas.height = 460
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    ctx.save()
    const dims = drawInstrument(ctx, config, notes, { accidental: this.accidental })
    ctx.restore()

    ctx.save()
    ctx.translate(0, (dims && dims.height ? dims.height : 220))
    staff.draw(ctx, notes, { accidental: this.accidental })
    ctx.restore()
  }

  pushUrl() {
    let path
    if (this.modeValue === 'notes') path = `/${this.instrumentValue}/notes/${this.rootValue}`
    else path = `/${this.instrumentValue}/${this.modeValue}/${this.rootValue}/${this.nameValue}`
    window.history.pushState({}, '', path)
  }

  syncFromLocation() {
    const parts = window.location.pathname.split('/').filter(Boolean)
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
