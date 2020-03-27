const CACHE = {
    key_prefix: "dice",
    key: "20190613-01",
    files: [
        "./",
        "./index.html",
        "./app.js",
        "./style.css",
        "./manifest.json",
        "https://comame.xyz/assets/script/sw-template.js",
        'https://comame.xyz/assets/script/standard.js'
    ]
}

self.importScripts("https://comame.xyz/assets/script/sw-template.js")
