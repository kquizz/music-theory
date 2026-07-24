import { defineConfig } from 'vitest/config'
import { fileURLToPath } from 'node:url'

const js = (p) => fileURLToPath(new URL(`./app/javascript/${p}`, import.meta.url))

export default defineConfig({
  resolve: {
    alias: [
      { find: /^theory\//, replacement: `${js('theory')}/` },
      { find: /^instruments\//, replacement: `${js('instruments')}/` },
      { find: /^renderers\//, replacement: `${js('renderers')}/` },
    ],
  },
  test: { environment: 'node', include: ['test/javascript/**/*.test.js'] },
})
