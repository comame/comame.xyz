if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(registration => {
        registration && registration.unregister()
        console.log('SW unregistered')
    })
}
