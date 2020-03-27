 const CACHE = {
     key_prefix: "notepad",
     key: "20190508-01",
     files: [
         "./",

        "./manifest.json",
        "./sw.js",
        "./icon.png",
        "https://comame.xyz/assets/script/sw-template.js",

         "./index.html",
         "./bundle.js",
         "./style.css"
     ]
 }

importScripts("https://comame.xyz/assets/script/sw-template.js")
