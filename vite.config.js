import { defineConfig } from 'vite'
import glsl from 'vite-plugin-glsl'

export default defineConfig({
    root: 'src',
    publicDir: '../static',
    base: './',
    resolve: { dedupe: ['three'] },
    server: { host: '127.0.0.1', open: false },
    build: {
        outDir: '../dist',
        emptyOutDir: true,
        sourcemap: true
    },
    plugins: [glsl()]
})
