export default [{
    ignores: ['dist/**', 'node_modules/**', 'Exploration/**']
}, {
    files: ['src/**/*.js', 'tests/**/*.js', '*.config.js'],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: Object.fromEntries([
        'window', 'document', 'console', 'fetch', 'Event', 'Option', 'AbortController', 'process', 'setTimeout',
        'requestAnimationFrame', 'structuredClone', 'URL'
    ].map(name => [name, 'readonly'])) },
    rules: { 'no-undef': 'error', 'no-unreachable': 'error', 'no-dupe-class-members': 'error', 'constructor-super': 'error', 'valid-typeof': 'error' }
}]
