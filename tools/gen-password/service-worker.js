const CACHE = {
    key_prefix: "gen-password",
    key: "20200409-01",
    files: [
        "./",
        "./index.html",
        "./app.js",
        "./style.css",
        "./icon.png",
        "./manifest.json",
        "./worker.js",
        "https://comame.xyz/assets/script/sw-template.js"
    ]
}

self.importScripts("https://comame.xyz/assets/script/sw-template.js")
