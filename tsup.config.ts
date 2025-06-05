import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm', 'iife'],
  outDir: 'dist',
  outExtension({ format }) {
    return {
      js: format === 'cjs' ? '.cjs' : format === 'esm' ? '.mjs' : '.js'
    }
  },
  globalName: 'Validra',
  dts: true,
  splitting: true,
  clean: true,
  minify: process.env.NODE_ENV === 'production',
  sourcemap: true,
  keepNames: true,
  target: 'es2020',
  external: [],
  env: {
    NODE_ENV: process.env.NODE_ENV || 'development'
  },
  banner: {
    js: '/*! Validra v0.1.0 | MIT License | https://github.com/Fmanuel809/validra */'
  }
})
