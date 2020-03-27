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
