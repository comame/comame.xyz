if (navigator.serviceWorker) {
    navigator.serviceWorker.register("./sw.js")
}

window.addEventListener("beforeinstallprompt", event => {
    // Don't show install banner
    event.preventDefault()
    return false
})
