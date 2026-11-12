// three.js scene for the Tonnetz torus. All geometry is described in grid
// coordinates (u along the tube / major thirds, v along the ring / minor thirds,
// plus a small offset off the surface) and mapped to 3D each frame, blending a
// torus position with a flat-grid position by t in [0,1] (the "unroll").
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { TRIADS, SIZE_I, SIZE_J, pcAt, noteName, fifthsPath } from 'theory/tonnetz'

const R = 3          // ring radius
const TUBE = 1.2     // tube radius
const SX = (2 * Math.PI * R) / SIZE_J          // flat spacing per v step
const SY = (2 * Math.PI * TUBE) / SIZE_I       // flat spacing per u step
const FACE_OFF = 0.03
const EDGE_OFF = 0.05
const NODE_OFF = 0.06
const SUBDIV = 6
const EDGE_SEGS = 12
const BEADS_PER_STEP = 14

const COLORS = { major: 0xf0903a, minor: 0x3d8fe0 }
const CAM_TORUS = new THREE.Vector3(0, -9.5, 7.5)
const CAM_FLAT = new THREE.Vector3(0, -1.5, 13)

const TAU = Math.PI * 2
const ease = (x) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2)

const _a = new THREE.Vector3()
const _b = new THREE.Vector3()

// Position of grid point (u, v) lifted `off` above the surface, blended by e.
function surfacePoint(u, v, off, e, out) {
  const th = (TAU * u) / SIZE_I
  const ph = (TAU * v) / SIZE_J
  const rr = TUBE + off
  const rho = R + rr * Math.cos(th)
  _a.set(rho * Math.cos(ph), rho * Math.sin(ph), rr * Math.sin(th))
  _b.set((v - (SIZE_J) / 2) * SX, (u - SIZE_I / 2) * SY, off)
  return out.copy(_a).lerp(_b, e)
}

function surfaceNormal(u, v, e, out) {
  const th = (TAU * u) / SIZE_I
  const ph = (TAU * v) / SIZE_J
  _a.set(Math.cos(th) * Math.cos(ph), Math.cos(th) * Math.sin(ph), Math.sin(th))
  _b.set(0, 0, 1)
  return out.copy(_a).lerp(_b, e).normalize()
}

function labelTexture(text, { size = 128, color = '#fff', stroke = 'rgba(10,12,20,0.9)', font = 'bold 64px system-ui, sans-serif' } = {}) {
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')
  g.font = font
  g.textAlign = 'center'
  g.textBaseline = 'middle'
  g.lineWidth = 10
  g.strokeStyle = stroke
  g.strokeText(text, size / 2, size / 2 + 4)
  g.fillStyle = color
  g.fillText(text, size / 2, size / 2 + 4)
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export function createTonnetzScene(container, { onPickTriad, onPickNote, onInteract } = {}) {
  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100)
  camera.up.set(0, 0, 1)
  camera.position.copy(CAM_TORUS)

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setClearColor(0x000000, 0)
  container.appendChild(renderer.domElement)
  renderer.domElement.style.display = 'block'
  renderer.domElement.style.touchAction = 'none'

  const controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.autoRotate = true
  controls.autoRotateSpeed = 1.2
  controls.minDistance = 6
  controls.maxDistance = 25
  controls.addEventListener('start', () => { controls.autoRotate = false; onInteract?.() })

  scene.add(new THREE.AmbientLight(0xffffff, 1.0))

  // --- deformable geometry registry ---------------------------------------
  // Each entry: { geometry, uvo: Float32Array of (u, v, off) per vertex }
  const deformables = []
  function track(geometry, uvo) {
    geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array((uvo.length / 3) * 3), 3))
    const d = { geometry, uvo }
    deformables.push(d)
    return d
  }
  const _p = new THREE.Vector3()
  function updateDeformable(d, e) {
    const pos = d.geometry.attributes.position
    const a = pos.array
    for (let k = 0, n = d.uvo.length / 3; k < n; k++) {
      surfacePoint(d.uvo[3 * k], d.uvo[3 * k + 1], d.uvo[3 * k + 2], e, _p)
      a[3 * k] = _p.x; a[3 * k + 1] = _p.y; a[3 * k + 2] = _p.z
    }
    pos.needsUpdate = true
    d.geometry.computeBoundingSphere()
    d.geometry.computeBoundingBox()
  }

  // Base translucent surface over u in [0,3], v in [0,4].
  const baseGeo = new THREE.BufferGeometry()
  {
    const NU = 36, NV = 48
    const uvo = []
    const index = []
    for (let a = 0; a <= NU; a++) {
      for (let b = 0; b <= NV; b++) uvo.push((a / NU) * SIZE_I, (b / NV) * SIZE_J, -0.04)
    }
    for (let a = 0; a < NU; a++) {
      for (let b = 0; b < NV; b++) {
        const p = a * (NV + 1) + b
        index.push(p, p + 1, p + NV + 1, p + 1, p + NV + 2, p + NV + 1)
      }
    }
    baseGeo.setIndex(index)
    track(baseGeo, new Float32Array(uvo))
  }
  const base = new THREE.Mesh(baseGeo, new THREE.MeshBasicMaterial({
    color: 0x6a7388, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false,
  }))
  scene.add(base)

  // Triangle faces.
  const faces = TRIADS.map((t, index) => {
    const n = SUBDIV
    const ids = {}
    const uvo = []
    let count = 0
    for (let a = 0; a <= n; a++) {
      for (let b = 0; a + b <= n; b++) {
        const w0 = 1 - (a + b) / n, w1 = a / n, w2 = b / n
        uvo.push(
          w0 * t.uv[0][0] + w1 * t.uv[1][0] + w2 * t.uv[2][0],
          w0 * t.uv[0][1] + w1 * t.uv[1][1] + w2 * t.uv[2][1],
          FACE_OFF,
        )
        ids[`${a},${b}`] = count++
      }
    }
    const idx = []
    for (let a = 0; a < n; a++) {
      for (let b = 0; a + b < n; b++) {
        idx.push(ids[`${a},${b}`], ids[`${a + 1},${b}`], ids[`${a},${b + 1}`])
        if (a + b < n - 1) idx.push(ids[`${a + 1},${b}`], ids[`${a + 1},${b + 1}`], ids[`${a},${b + 1}`])
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setIndex(idx)
    track(geo, new Float32Array(uvo))
    const mat = new THREE.MeshBasicMaterial({
      color: COLORS[t.quality], transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false,
    })
    const mesh = new THREE.Mesh(geo, mat)
    mesh.userData.triadIndex = index
    scene.add(mesh)
    return mesh
  })

  // Edge builder: line segments around a set of triangles.
  function edgeSegments(triads, off) {
    const uvo = []
    for (const t of triads) {
      for (let k = 0; k < 3; k++) {
        const [u0, v0] = t.uv[k]
        const [u1, v1] = t.uv[(k + 1) % 3]
        for (let s = 0; s < EDGE_SEGS; s++) {
          const f0 = s / EDGE_SEGS, f1 = (s + 1) / EDGE_SEGS
          uvo.push(u0 + (u1 - u0) * f0, v0 + (v1 - v0) * f0, off, u0 + (u1 - u0) * f1, v0 + (v1 - v0) * f1, off)
        }
      }
    }
    const geo = new THREE.BufferGeometry()
    const d = track(geo, new Float32Array(uvo))
    return { geo, d }
  }
  const edges = edgeSegments(TRIADS, EDGE_OFF)
  const edgeLines = new THREE.LineSegments(edges.geo, new THREE.LineBasicMaterial({ color: 0xdfe6f5, transparent: true, opacity: 0.45 }))
  scene.add(edgeLines)

  // Selection outline (rebuilt on each selection).
  let outline = null
  function setOutline(triad) {
    if (outline) {
      scene.remove(outline.line)
      outline.line.geometry.dispose()
      outline.line.material.dispose()
      deformables.splice(deformables.indexOf(outline.d), 1)
      outline = null
    }
    if (!triad) return
    const { geo, d } = edgeSegments([triad], EDGE_OFF + 0.02)
    const line = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0xffffff }))
    scene.add(line)
    outline = { line, d }
    updateDeformable(d, blend)
  }

  // --- nodes and labels ----------------------------------------------------
  const nodeGeo = new THREE.SphereGeometry(0.17, 20, 14)
  const nodeMat = new THREE.MeshBasicMaterial({ color: 0xf4f6fb })
  const textures = []
  const nodes = [] // { u, v, mesh, sprite, ghost }
  const spriteMats = []
  function makeNode(u, v, ghost) {
    const pc = pcAt(u, v)
    const tex = labelTexture(noteName(pc), ghost ? { color: 'rgba(255,255,255,0.7)' } : {})
    textures.push(tex)
    const smat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: ghost ? 0 : 1 })
    spriteMats.push(smat)
    const sprite = new THREE.Sprite(smat)
    const sc = ghost ? 0.7 : 0.95
    sprite.scale.set(sc, sc, 1)
    sprite.renderOrder = 10
    scene.add(sprite)
    let mesh = null
    if (!ghost) {
      mesh = new THREE.Mesh(nodeGeo, nodeMat)
      mesh.userData.pc = pc
      scene.add(mesh)
    }
    const n = { u, v, pc, mesh, sprite, ghost }
    nodes.push(n)
    return n
  }
  for (let u = 0; u < SIZE_I; u++) for (let v = 0; v < SIZE_J; v++) makeNode(u, v, false)
  // Seam duplicates, shown only when flat, where triangles extend past the grid.
  for (let u = 0; u <= SIZE_I; u++) {
    for (let v = 0; v <= SIZE_J; v++) if (u === SIZE_I || v === SIZE_J) makeNode(u, v, true)
  }
  const _n = new THREE.Vector3()
  function updateNodes(e) {
    for (const n of nodes) {
      surfacePoint(n.u, n.v, NODE_OFF, e, _p)
      n.mesh?.position.copy(_p)
      surfaceNormal(n.u, n.v, e, _n)
      n.sprite.position.copy(_p).addScaledVector(_n, n.ghost ? 0.3 : 0.38)
      if (n.ghost) {
        n.sprite.material.opacity = Math.max(0, (e - 0.6) / 0.4)
        n.sprite.visible = e > 0.6
      }
    }
  }

  // --- circle-of-fifths coil -----------------------------------------------
  const path = fifthsPath()
  const beadCount = path.length * BEADS_PER_STEP
  const beads = new THREE.InstancedMesh(
    new THREE.SphereGeometry(0.07, 8, 6),
    new THREE.MeshBasicMaterial({ color: 0xffe066 }),
    beadCount,
  )
  beads.visible = false
  scene.add(beads)
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), new THREE.MeshBasicMaterial({ color: 0xffffff }))
  dot.visible = false
  scene.add(dot)
  const dummy = new THREE.Object3D()
  // Along segment k the coordinates run (k%3 + f, k%4 + f): one diagonal step.
  const coil = (k, f) => [path[k].i + f, path[k].j + f]
  function updateCoil(e) {
    for (let s = 0; s < beadCount; s++) {
      const k = Math.floor(s / BEADS_PER_STEP)
      const [u, v] = coil(k, (s % BEADS_PER_STEP) / BEADS_PER_STEP)
      surfacePoint(u, v, 0.1, e, dummy.position)
      dummy.updateMatrix()
      beads.setMatrixAt(s, dummy.matrix)
    }
    beads.instanceMatrix.needsUpdate = true
  }
  let fifthsOn = false

  // --- state ---------------------------------------------------------------
  let blend = 0
  let target = 0
  let anim = null // { from, to, start, camFrom, camTo }
  let selected = null
  let neighborSet = []

  function refresh() {
    for (const d of deformables) updateDeformable(d, blend)
    updateNodes(blend)
    if (fifthsOn) updateCoil(blend)
  }
  refresh()

  function applyFaceStyles() {
    faces.forEach((m, i) => {
      const t = TRIADS[i]
      let op = 0.28
      if (t === selected) op = 0.9
      else if (neighborSet.includes(t)) op = 0.6
      else if (selected) op = 0.16
      m.material.opacity = op
    })
  }

  function setSelection(triad, neighborTriads = []) {
    selected = triad
    neighborSet = neighborTriads
    applyFaceStyles()
    setOutline(triad)
  }

  function setFifths(on) {
    fifthsOn = on
    beads.visible = on
    dot.visible = on
    if (on) updateCoil(blend)
  }

  function setUnrolled(flat) {
    target = flat ? 1 : 0
    anim = {
      from: blend, to: target, start: performance.now(),
      camFrom: camera.position.clone(), camTo: (flat ? CAM_FLAT : CAM_TORUS).clone(),
    }
    controls.autoRotate = false
  }

  // --- picking -------------------------------------------------------------
  const raycaster = new THREE.Raycaster()
  const ndc = new THREE.Vector2()
  let downAt = null
  const el = renderer.domElement
  const onDown = (ev) => { downAt = [ev.clientX, ev.clientY] }
  const onUp = (ev) => {
    if (!downAt) return
    const moved = Math.hypot(ev.clientX - downAt[0], ev.clientY - downAt[1])
    downAt = null
    if (moved > 5) return
    const rect = el.getBoundingClientRect()
    ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1)
    raycaster.setFromCamera(ndc, camera)
    const targets = [...faces, ...nodes.filter((n) => n.mesh).map((n) => n.mesh)]
    const hit = raycaster.intersectObjects(targets, false)[0]
    if (!hit) return
    if (hit.object.userData.pc !== undefined) onPickNote?.(hit.object.userData.pc)
    else onPickTriad?.(TRIADS[hit.object.userData.triadIndex])
  }
  el.addEventListener('pointerdown', onDown)
  el.addEventListener('pointerup', onUp)

  // --- sizing & loop -------------------------------------------------------
  function resize() {
    const w = Math.max(container.clientWidth, 1)
    const h = Math.max(container.clientHeight, 1)
    renderer.setSize(w, h, false)
    el.style.width = '100%'
    el.style.height = '100%'
    camera.aspect = w / h
    camera.updateProjectionMatrix()
  }
  const ro = new ResizeObserver(resize)
  ro.observe(container)
  resize()

  let raf = 0
  let disposed = false
  const t0 = performance.now()
  function frame(now) {
    if (disposed) return
    raf = requestAnimationFrame(frame)
    if (anim) {
      const x = Math.min((now - anim.start) / 1500, 1)
      const k = ease(x)
      blend = anim.from + (anim.to - anim.from) * k
      camera.position.lerpVectors(anim.camFrom, anim.camTo, k)
      if (x >= 1) { blend = anim.to; anim = null }
      refresh()
    }
    if (fifthsOn) {
      const s = (((now - t0) / 650) % path.length)
      const k = Math.floor(s)
      const [u, v] = coil(k, s - k)
      surfacePoint(u, v, 0.14, blend, dot.position)
    }
    controls.update()
    renderer.render(scene, camera)
  }
  raf = requestAnimationFrame(frame)

  function dispose() {
    disposed = true
    cancelAnimationFrame(raf)
    ro.disconnect()
    el.removeEventListener('pointerdown', onDown)
    el.removeEventListener('pointerup', onUp)
    controls.dispose()
    scene.traverse((o) => {
      o.geometry?.dispose?.()
      if (o.material && !Array.isArray(o.material)) o.material.dispose()
    })
    textures.forEach((t) => t.dispose())
    spriteMats.forEach((m) => m.dispose())
    renderer.dispose()
    el.remove()
  }

  return { setSelection, setFifths, setUnrolled, dispose }
}
