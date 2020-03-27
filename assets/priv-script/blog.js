function indexPage() {
    document.getElementById("header-links").children[0].addEventListener("click", function(event) {
        event.preventDefault();
        window.scroll(0, 0);
    })
    document.getElementById("header-links").children[1].addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("search-box").focus();
    });
    if (location.pathname == "/search") {
        document.getElementById("search-box").value = decodeURIComponent(location.search.split("?")[1].split("&").filter(function(it) {
            return it.startsWith("q=");
        })[0].split("=")[1]).replace(/\+/g, " ").replace(/\s{2,}/g, " ").replace(/^\s*/g, "").replace(/\s$/g, "");
    }
}

function postPage() {
    // Header buttons
    document.getElementById("header-links").children[0].addEventListener("click", function(event) {
        event.preventDefault();
        window.scroll(0, 0);
    })
    document.getElementById("header-links").children[1].addEventListener("click", function(event) {
        event.preventDefault();
        document.getElementById("search-box").focus();
    });
    document.getElementById("header-links").children[2].addEventListener("click", function(event) {
        event.preventDefault();
        window.scroll(0, document.getElementById("share").offsetTop);
    });

    // Enable sharing
    document.querySelectorAll("#share a").forEach(function(element) {
        element.style.display = "inline-block";
    });
    document.querySelector("#share p").style.display = "none";
    document.querySelectorAll("#share a")[0].href = "https://twitter.com/intent/tweet?text="+ encodeURIComponent(document.getElementById("article-title").innerText) + "%0a&url=" + encodeURIComponent("https://" + location.host + location.pathname) + "&related=comameito";
    document.querySelectorAll("#share a")[1].href = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent("https://" + location.host + location.pathname);

    // Copy
    var coping = false;
    document.getElementById("share").children[3].addEventListener("click", function() {
        if (coping) return;
        coping = true;
        var tmp = document.createElement("div");
        tmp.appendChild(document.createElement("pre")).textContent = "https://" + location.host + location.pathname;
        tmp.style.position = "fixed";
        tmp.style.left = "-100%";
        document.body.appendChild(tmp);
        document.getSelection().selectAllChildren(tmp);
        var result = document.createElement("div");
        result.style = "position: fixed; bottom: 0; color: white; padding: 0.5em 1em; width: 100%;";
        if (document.execCommand("copy")) {
            result.innerText = "URL をコピーしました";
            result.setAttribute("style", "position: fixed; bottom: 0; color: white; padding: 0.5em 1em; width: 100%; background: rgba(32, 33, 35, 0.8);");
            document.body.appendChild(result);
            setTimeout(function() {
                document.body.removeChild(result);
                coping = false;
            }, 3000);
        } else {
            result.innerText = "URL をコピーできませんでした";
            result.setAttribute("style", "position: fixed; bottom: 0; color: white; padding: 0.5em 1em; width: 100%; background: rgba(214, 11, 11, 0.6);");
            document.body.appendChild(result);
            setTimeout(function() {
                document.body.removeChild(result);
                coping = false;
            }, 3000);
        }
        document.body.removeChild(tmp);
    });
}