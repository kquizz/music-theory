import { Controller } from '@hotwired/stimulus'
import { playMidis, playNote } from 'audio/player'
import { createTonnetzScene } from 'renderers/tonnetz_scene'
import { neighbors, triadName, triadMidis, noteName, triadAt } from 'theory/tonnetz'

export default class extends Controller {
  static targets = ['stage', 'name', 'neighbors', 'fifths', 'unroll']

  connect() {
    this.selected = null
    this.fifthsOn = false
    this.flat = false
    this.scene = createTonnetzScene(this.stageTarget, {
      onPickTriad: (t) => this.select(t),
      onPickNote: (pc) => playNote(this.ensureAudio(), 60 + pc),
    })
    this.renderInfo()
    // Arriving from the circle (?root=<pc>&quality=major|minor): preselect that
    // chord silently — browsers block audio before a user gesture.
    const params = new URLSearchParams(window.location.search)
    const start = triadAt(Number(params.get('root')), params.get('quality'))
    if (params.has('root') && start) this.select(start, { play: false })
  }

  disconnect() {
    this.scene?.dispose()
    this.scene = null
    this.audioCtx?.close?.()
    this.audioCtx = null
  }

  // Created lazily so it starts on a user gesture.
  ensureAudio() {
    if (!this.audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext
      this.audioCtx = new Ctx()
    }
    return this.audioCtx
  }

  select(triad, { play = true } = {}) {
    this.selected = triad
    this.scene.setSelection(triad, neighbors(triad).map((n) => n.triad))
    if (play) playMidis(this.ensureAudio(), triadMidis(triad), { harmonic: true })
    this.renderInfo()
  }

  pickNeighbor(event) {
    const { quality, root } = event.currentTarget.dataset
    const match = neighbors(this.selected).find((n) => n.triad.quality === quality && n.triad.root === Number(root))
    if (match) this.select(match.triad)
  }

  toggleFifths() {
    this.fifthsOn = !this.fifthsOn
    this.scene.setFifths(this.fifthsOn)
    this.fifthsTarget.setAttribute('aria-pressed', String(this.fifthsOn))
    this.fifthsTarget.classList.toggle('on', this.fifthsOn)
  }

  toggleUnroll() {
    this.flat = !this.flat
    this.scene.setUnrolled(this.flat)
    this.unrollTarget.textContent = this.flat ? 'Roll up' : 'Unroll'
  }

  renderInfo() {
    const t = this.selected
    if (!t) {
      this.nameTarget.textContent = 'Click a triangle to hear a chord'
      this.neighborsTarget.replaceChildren()
      return
    }
    this.nameTarget.textContent = triadName(t)
    const items = neighbors(t).map(({ triad, relation, shared }) => {
      const b = document.createElement('button')
      b.type = 'button'
      b.className = `nb ${triad.quality}`
      b.dataset.root = triad.root
      b.dataset.quality = triad.quality
      b.dataset.action = 'click->tonnetz#pickNeighbor'
      b.textContent = `${triadName(triad)} — ${relation} (shares ${shared.map(noteName).join(', ')})`
      return b
    })
    this.neighborsTarget.replaceChildren(...items)
  }
}
