import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Nur das echte Testverzeichnis. Ohne diese Einschraenkung sammelt Vitest
    // auch die Testkopien unter .superpowers/sdd/snapshots/ ein, die der
    // Review-Mechanismus dieses Projekts anlegt - die Suite liefe dann doppelt.
    include: ['tests/**/*.test.mjs'],
    exclude: ['node_modules/**', '.superpowers/**']
  }
})
