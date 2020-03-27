function main() {
    const hash = location.hash.split("#")[1]
    if (!hash) {
        location.replace("#list")
        return
    } else {
        const pageName = hash.split("/")[0]

        switch (pageName) {
            case "list": 
                launchListView()
                break
            case "edit":
                const id = parseInt(hash.split("/")[1])
                if (isNaN(id)) {
                    launchEditView(null)
                } else {
                    launchEditView(parseInt(id))
                }
               break
           default:
                location.replace("#list")
        }
    }
}

function showError(message) {
    console.warn(message)
    const duration = 3000

    setTimeout(() => {
        //TODO: show error
    }, duration)
}

async function launchListView() {
    if (window.currentView) {
        await window.currentView.destroyView()
        window.currentView = null
    }
    const listView = await ListView.init(
        NoteRepository.getInstance()
    )
    await listView.createView()
    window.currentView = listView
}

async function launchEditView(id) {
    if (window.currentView) {
        await window.currentView.destroyView()
        window.currentView = null
    }
    if (!id) {
        // 空のノートを作成
        id = (await NoteRepository.getInstance().create("", "")).id
        location.replace("#edit/" + id)
        return 
    }
    try {
        const editView = await EditView.init(
            NoteRepository.getInstance(),
            id
        )
        editView.createView()
        window.currentView = editView
    } catch (err) {
        if (err.message == "NotFound") {
            launchEditView(null)
        } else {
            throw err
        }
    }
}

window.addEventListener("load", main)
window.addEventListener("hashchange", main)

navigator.serviceWorker.register("./sw.js")
