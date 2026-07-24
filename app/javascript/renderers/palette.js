// Carried over from the original getColorByNumber palette; index 0 = root.
const PALETTE = [
  '#E94B3C', '#ECDB54', '#6F9FD8', '#944743', '#DBB1CD', '#EC9787',
  '#00A591', '#6B5B95', '#6C4F3D', '#EADEDB', '#BC70A4', '#BFD641',
]

export const ROOT_COLOR = PALETTE[0]

export function colorForDegree(degree) {
  return PALETTE[((degree % PALETTE.length) + PALETTE.length) % PALETTE.length]
}
