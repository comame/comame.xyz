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
