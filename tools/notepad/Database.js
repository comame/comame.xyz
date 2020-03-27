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
