import { defineConfig } from '@playwright/test'

const production = process.env.TEST_PRODUCTION === '1'
const port = production ? 5180 : 5174

export default defineConfig({
    testDir: './tests/browser',
    workers: 1,
    timeout: 45000,
    use: { baseURL: `http://127.0.0.1:${port}`, viewport: { width: 1440, height: 1000 },
        launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } },
    webServer: { command: `node node_modules/vite/bin/vite.js ${production ? 'preview' : ''} --host 127.0.0.1 --port ${port} --strictPort`, url: `http://127.0.0.1:${port}`, reuseExistingServer: !process.env.CI },
    reporter: 'list'
})
