const CACHE = {
    key_prefix: "comame.xyz",
    key:        "20190306-01",
    files:      [
        "./",
        "./index.html",

        "./sw.js",
        "./sw-register.js",
        "./manifest.json",

        "./assets/style/ubuntu-font.css",
        "./assets/img/prof-icon.png",
        "./assets/img/prof-icon.png.webp",
        "./assets/img/prof-icon-144.png"
    ]
}

self.importScripts("./assets/script/sw-template.js")
