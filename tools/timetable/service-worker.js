const CACHE = {
    key_prefix: "timetable",
    key: "20200409-01",
    files: [
        "./",
        "./index.html",
        "./app.js",
        "./style.css",
        "./icon-144.png",
        "./manifest.json",
        "https://comame.xyz/assets/script/sw-template.js",
        'https://comame.xyz/assets/script/standard.js'
    ]
}

self.importScripts("https://comame.xyz/assets/script/sw-template.js")
