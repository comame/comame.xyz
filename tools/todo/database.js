class Database {
    static async init() {
        return new Promise((resolve, reject) => {
            const openRequest = indexedDB.open('todos', 1)
            openRequest.onerror = (e) => {
                console.error(e)
                reject()
            }
            openRequest.onsuccess = (e) => {
                const db = e.target.result
                this.db = db
                resolve(db)
            }

            openRequest.onupgradeneeded = (e) => {
                console.log('upgradeneeded')
                const db = e.target.result
                db.createObjectStore('todos', {
                    keyPath: 'id',
                    autoIncrement: true
                })
            }
        })
    }

    static async add(todo) {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ 'todos' ], 'readwrite')
            transaction.onerror = (e) => {
                console.error(e)
                reject()
            }

            const addRequest = transaction.objectStore('todos').add(todo)
            addRequest.onsuccess = (e) => {
                resolve(e.target.result)
            }
        })
    }

    static async put(todo) {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ 'todos' ], 'readwrite')
            transaction.onerror = (e) => {
                console.error(e)
                reject()
            }

            const putRequest = transaction.objectStore('todos').put(todo)
            putRequest.onsuccess = (e) => {
                resolve(e.target.result)
            }
        })
    }

    static async delete(id) {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ 'todos' ], 'readwrite')
            transaction.onerror = (e) => {
                console.error(e)
                reject()
            }

            const deleteRequest = transaction.objectStore('todos').delete(id)
            deleteRequest.onsuccess = () => {
                resolve()
            }
        })
    }

    static async get(id) {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ 'todos' ], 'readonly')
            transaction.onerror = (e) => {
                console.error(e)
                reject()
            }

            const getRequest = transaction.objectStore('todos').get(id)
            getRequest.onsuccess = (e) => {
                resolve(e.target.result)
            }
        })
    }

    static async listAll() {
        if (!this.db) await this.init()

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([ 'todos' ], 'readonly')
            transaction.onerror = (e) => {
                console.error(e)
                reject()
            }

            const results = []

            const cursorRequest = transaction.objectStore('todos').openCursor()
            cursorRequest.onsuccess = (e) => {
                const cursor = e.target.result
                if (cursor) {
                    results.push(cursor.value)
                    cursor.continue()
                } else {
                    resolve(results)
                }
            }
        })
    }
}
