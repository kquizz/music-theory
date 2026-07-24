import { Controller } from '@hotwired/stimulus'
import { INSTRUMENTS } from 'instruments/config'
import { SCALES } from 'theory/scales'
import { CHORDS } from 'theory/chords'
import { noteSet } from 'theory/note_set'
import { defaultAccidental, isMinorKey } from 'theory/spelling'
import * as fretboard from 'renderers/fretboard_renderer'
import * as keyboard from 'renderers/keyboard_renderer'
import * as fingering from 'renderers/fingering_renderer'
import * as staff from 'renderers/staff_renderer'
import * as circle from 'renderers/circle_of_fifths_renderer'

const RENDERERS = { fretboard: fretboard.draw, keyboard: keyboard.draw, brass: fingering.draw }

export default class extends Controller {
  static targets = ['canvas', 'instrument', 'mode', 'root', 'name', 'accidental', 'octaves']
  static values = { instrument: String, mode: String, root: String, name: String }

  connect() {
    this.octaves = 1
    this.accidentalOverridden = false
    this.accidental = this.keyAccidental()
    this.updateOctavesLabel()
    this.populateInstrumentOptions()
    this.instrumentTarget.value = this.instrumentValue
    this.modeTarget.value = this.modeValue
    this.rootTarget.value = this.rootValue
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
    const geo = circle.geometry()
    const hit = circle.hitTest(mx - geo.cx, my - geo.cy)
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

  onInstrument() { this.instrumentValue = this.instrumentTarget.value; this.update() }
  onMode() { this.modeValue = this.modeTarget.value; this.populateNameOptions(); this.captureName(); this.update() }
  onRoot() { this.rootValue = this.rootTarget.value; this.update() }
  onName() { this.captureName(); this.update() }
  toggleAccidental() {
    this.accidentalOverridden = true
    this.accidental = this.accidental === 'sharp' ? 'flat' : 'sharp'
    this.render()
  }

  toggleOctaves() {
    this.octaves = this.octaves === 1 ? 2 : 1
    this.updateOctavesLabel()
    this.render()
  }

  updateOctavesLabel() {
    if (this.hasOctavesTarget) this.octavesTarget.textContent = `${this.octaves} Octave${this.octaves > 1 ? 's' : ''}`
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
    if (!this.accidentalOverridden) this.accidental = this.keyAccidental()
    this.render()
    this.pushUrl()
  }

  render() {
    const config = INSTRUMENTS[this.instrumentValue]
    const canvas = this.canvasTarget
    const ctx = canvas.getContext('2d')

    canvas.width = 900
    canvas.height = 560
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const groups = this.octaveGroups()
    const flat = groups.flat()
    ctx.save()
    // Brass wraps fingerings into one row per octave; other views take the flat line.
    const dims = config.type === 'brass'
      ? fingering.draw(ctx, config, groups, { accidental: this.accidental })
      : (RENDERERS[config.type] || fretboard.draw)(ctx, config, flat, { accidental: this.accidental })
    ctx.restore()

    ctx.save()
    ctx.translate(0, (dims && dims.height ? dims.height : 220))
    // Notes stay on a single staff — the second octave simply sits higher.
    staff.draw(ctx, [flat], { accidental: this.accidental, clef: config.clef || 'treble' })
    ctx.restore()

    // Always-visible circle of fifths (bottom-right), lighting the current key.
    ctx.save()
    circle.draw(ctx, {
      highlightRoot: this.rootValue,
      highlightMinor: isMinorKey({ mode: this.modeValue, name: this.nameValue }),
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
    this.modeTarget.value = this.modeValue
    this.rootTarget.value = this.rootValue
    this.populateNameOptions()
    if (this.modeValue !== 'notes' && name) this.nameTarget.value = name
    this.accidentalOverridden = false
    this.accidental = this.keyAccidental()
    this.render()
  }
}
