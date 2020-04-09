const CACHE = {
    key_prefix: 'todo',
    key: '20200409-1',
    files: [
        './',
        './app.js',
        './database.js',
        './icon.png',
        './index.html',
        './style.css',
        './manifest.json',
        'https://comame.xyz/assets/script/sw-template.js'
    ]
}

self.importScripts("https://comame.xyz/assets/script/sw-template.js")
