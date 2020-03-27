/*
 * Copyright 2018 comame
 */

(function() {
    // Deprecated
    window.insertCssOnLoad = function(paths) {
        console.error("Deprecated. Use window.loadDeferredStyles()");
        window.insertCssPaths = paths;
        addEventListener("load", insertCss);
    }

    // Deprecated
    window.insertImgOnLoad = function(imgs /* { id, path, webp } */) {
        console.error("deprecated. User <picture> tag.");
        window.insertImgs = imgs;

        addEventListener("load", function() {
            supportsWebp(insertImgs);
        });
    }

    window.loadDeferredStyles = function() {
        var addStylesNodes = document.getElementById("deferred-styles").textContent;
        document.head.innerHTML += addStylesNodes;
    };

    function insertCss() {
        window.insertCssPaths.forEach(function(path) {
            let elem = document.createElement("link");
            elem.rel = "stylesheet";
            elem.href = path;

            document.head.appendChild(elem);
        });
    }

    function insertImgs(supportsWebp) {
        window.insertImgs.forEach(function(img) {
            let elementId = img.elementId;
            let path = img.path;
            let webp = img.webp;

            if (supportsWebp && webp) path += ".webp";
            let elem = document.getElementById(elementId);
            elem.src = path;
        });
    }

    function supportsWebp(callback) {
        let webP = new Image();
        webP.src = 'data:image/webp;base64,UklGRi4AAABXRUJQVlA4TCEAAAAvAUAAEB8wA' + 'iMwAgSSNtse/cXjxyCCmrYNWPwmHRH9jwMA';
        webP.onload = function() { callback(true); }
        webP.onerror = function() { callback(false); }
    }
})();
