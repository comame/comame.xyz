//TODO: Error Handling

class NoteDatabase {
    // returns an instance of NoteDatabase
    static async open(dbName, dbVersion) {
        const noteDatabase = new NoteDatabase()
        const openReq = indexedDB.open(dbName, dbVersion)
 
        openReq.onupgradeneeded = (event) => {
            const db = event.target.result

            if (event.oldVersion < 1) {
                const objectStore = db.createObjectStore("notes", {
                    keyPath: "id",
                    autoIncrement: true
                })
            }

            if (event.oldVersion < 3) {
                const transaction = event.target.transaction
                const objectStore = transaction.objectStore("notes")
                const time = new Date().getTime()
                objectStore.add({
                    createAt: time,
                    modifiedAt: time,
                    title: "Notepad へようこそ",
                    body: "Notepad へようこそ。\nhttps://github.com/comame/pwa_tools/tree/master/notepad"
                })
            }
        }

        return new Promise((resolve, reject) => {
            openReq.onsuccess = (event) => {
                noteDatabase.db = event.target.result
                resolve(noteDatabase)
            }
        })
    }

    // returns new Note
    async add(title, body) {
        const transaction = this.db.transaction(["notes"], "readwrite")
        const objectStore = transaction.objectStore("notes")

        const time = new Date().getTime()
        const newNote = {
            title: title,
            body: body,
            createAt: time,
            modifiedAt: time
        }

        const addRequest = objectStore.add(newNote)

        let id = 0

        addRequest.onsuccess = (event) => {
            id = event.target.result
        }

        return new Promise((resolve, reject) => {
            transaction.oncomplete = () => {
                resolve(Object.assign({id: id}, newNote))
            }
        })
    }

    // returns Note object
    async get(id) {
        const transaction = this.db.transaction(["notes"], "readonly")
        const objectStore = transaction.objectStore("notes")

        const getRequest = objectStore.get(id)

        return new Promise((resolve, reject) => {
            getRequest.onsuccess = (event) => {
                resolve(event.target.result)
            }
        })
    }

    // if update succeeded returns Note, else returns undefined
    async update(id, title, body) {
        const transaction = this.db.transaction(["notes"], "readwrite")
        const objectStore = transaction.objectStore("notes")

        const getRequest = objectStore.get(id)

        return new Promise((resolve, reject) => {
            getRequest.onsuccess = (event) => {
                const note = event.target.result

                if (!note) {
                    resolve(undefined)
                } else {
                    const newNote = {
                        id: note.id,
                        createAt: note.createAt,
                        modifiedAt: new Date().getTime(),
                        title: title,
                        body: body
                    }
                    const putRequest = objectStore.put(newNote)

                    putRequest.onsuccess = (event) => {
                        resolve(newNote)
                    }
                }
            }

        })
    }

    // returns nothing
    async delete(id) {
        const transaction = this.db.transaction(["notes"], "readwrite")
        const objectStore = transaction.objectStore("notes")

        const deleteRequest = objectStore.delete(id)

        return new Promise((resolve, reject) => {
            deleteRequest.onsuccess = (event) => {
                resolve()
            }
        })
    }

    // returns an array of Notes
    async list() {
        const transaction = this.db.transaction(["notes"], "readonly")
        const objectStore = transaction.objectStore("notes")

        const notes = []

        return new Promise((resolve, reject) => {
            objectStore.openCursor().onsuccess = (event) => {
                const cursor = event.target.result
                if (!cursor) {
                    resolve(notes)
                } else {
                    notes.push(cursor.value)
                    cursor.continue()
                }
            }
        })
    }
}
class Note {
    constructor(id, createAt, modifiedAt, title,  body) {
        this.id = id
        this.createAt = createAt
        this.modifiedAt = modifiedAt
        this.title = title
        this.body = body
    }
}

class NoteRepository {
    static getInstance() {
        if (!NoteRepository.instance) {
            NoteRepository.instance = new NoteRepository()
        }
        return NoteRepository.instance
    }

    async _open() {
        if (!NoteRepository.db) {
            NoteRepository.db = await NoteDatabase.open("notes", 3)
        }
        return NoteRepository.db
    }

    async list() {
        const db = await this._open()
        return await db.list()
    }

    async get(id) {
        const db = await this._open()
        return await db.get(id)
    }

    async update(id, title, body) {
        const db = await this._open()
        return await db.update(id, title, body)
    }

    async create(title, body) {
        const db = await this._open()
        return await db.add(title, body)
    }

    async delete(id) {
        const db = await this._open()
        return await db.delete(id)
    }
}
const templates = Object.freeze({
    list: `<header><h1>ノート一覧 - Notepad</h1></header><ul>$ITEMS</ul><a id="compose" href="#edit">+</a>`,
    listItem: `<a href="#edit/$ID"><li><h3>$TITLE</h3></li></a>`,
    edit: `<header><a id="back" href="#list">&lt;&nbsp;戻る</a><h1>ノート編集 - Notepad</h1></header><div id="note-edit"><input placeholder="タイトル"></input><button>削除</button><textarea placeholder="本文"></textarea></div>`
})

class ListView {
    static async init(noteRepository) {
        const listView = new ListView()
        listView.repository = noteRepository
        listView.notes = await noteRepository.list()

        // 編集順に並び替え
        listView.notes.sort((a, b) => {
            return b.modifiedAt - a.modifiedAt
        })

        return listView
    }

    async createView() {
        let listItems = ""

        for (const note of this.notes) {
            listItems += templates.listItem
                .replace("$TITLE",
                    note.title ?
                    // XSS 対策
                    note.title.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") :
                    // タイトルが入力されていなければ「無題のノート」と表示する
                    "無題のノート"
                )
                .replace("$ID", note.id)
        }

        document.body.innerHTML = 
            templates.list.replace("$ITEMS", listItems)
        document.title = "ノート一覧 - Notepad"
        document.body.classList.add("list")
    }

    async destroyView() {
        document.body.innerHTML = ""
        document.body.classList.remove("list")
        document.title = "Notepad"
    }
}

class EditView {
    static async init(noteRepository, id) {
        const editView = new EditView()
        editView.repository = noteRepository

        const result = await noteRepository.get(id)

        if (result) {
          editView.note = result
        } else {
            throw Error("NotFound")
        }

        return editView
    }

    async createView() {
        document.body.innerHTML = templates.edit
        this.refreshDocumentTitle()
        document.body.classList.add("edit")

        document.querySelector("input").value = this.note.title
        document.querySelector("textarea").value = this.note.body

        document.querySelector("textarea").focus()

        document.querySelector("input").oninput = () => {
            this.updateThisNote()
            this.saveNote()
            this.refreshDocumentTitle()
        }
        document.querySelector("textarea").oninput = () => {
            this.updateThisNote()
            this.saveNote()
        }
        document.querySelector("button").onclick = async (event) => {
            if (confirm("削除しますか？")) {
                await this.repository.delete(this.note.id)
                location.replace("#list")
            }
        }
        document.getElementById("back").onclick = () => {
            if (history.length != 1) {
                history.back()
            } else {
                location.replace("#list")
            }
        }
    }

    async destroyView() {
        document.body.innerHTML = ""
        document.title = "Notepad"
        document.body.classList.remove("edit")

        if (this.note.title == "" && this.note.body == "") {
            await this.repository.delete(this.note.id)
        }
    }

    refreshDocumentTitle() {
        document.title = (this.note.title ? this.note.title : "無題のノート") + " - Notepad"
    }

    updateThisNote() {
        this.note.title = document.querySelector("input").value.trim()
        this.note.body = document.querySelector("textarea").value
    }

    async saveNote() {
        await this.repository.update(
            this.note.id,
            this.note.title,
            this.note.body
        )
    }
}
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
