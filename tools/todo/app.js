setInitialEventListeners()
initializeTodos()

async function addNewTodo(todoWithoutId) {
    const id = await Database.add(todoWithoutId)
    const todo = { id, ...todoWithoutId }
    appendTodoToUI(todo)
}

async function updateTodo(todo) {
    await Database.put(todo)
    updateTodoUI(todo)
}

async function filterTodos(filterRegex) {
    document.querySelector('.todos').innerHTML = ''
    const regexObj = new RegExp(filterRegex, 'i')
    const allTodos = await Database.listAll()
    const fileteredTodos = allTodos.filter(todo => {
        return regexObj.test(todo.title) || regexObj.test(todo.detail)
    })
    for (const todo of fileteredTodos) {
        if ('requires' in todo) continue
        appendTodoToUI(todo)
    }
    for (const todo of fileteredTodos) {
        if ('requires' in todo) appendTodoToUI(todo)
    }
}

async function deleteTodo(id) {
    if (!confirm('Delete?')) return
    await Database.delete(id)
    initializeTodos()
}

async function initializeTodos() {
    const todos = await Database.listAll()
    document.querySelector('.todos').innerHTML = ''
    for (const todo of todos) {
        if ('requires' in todo) continue
        appendTodoToUI(todo)
    }
    for (const todo of todos) {
        if ('requires' in todo) appendTodoToUI(todo)
    }
}

async function submitTodoUI() {
    const todoEditorElement = document.getElementById('todo-editor')
    const todoTitleElement = document.querySelector('#todo-editor .todo-title')
    const todoDetailElement = document.querySelector('#todo-editor .todo-detail')
    const todoRequireElement = document.querySelector('#todo-editor .todo-requires')

    const title = todoTitleElement.value
    const detail = todoDetailElement.value
    const requires =
        todoRequireElement.value == '' ?
        undefined :
        Number.parseInt(todoRequireElement.value)

    if (!(title)) return

    const editingTodoId = todoEditorElement.getAttribute('edit-todo-id')
    if (editingTodoId == null) {
        const newTodo = {
            title,
            detail,
            requires
        }
        await addNewTodo(newTodo)
    } else {
        const newTodo = {
            title,
            detail,
            requires,
            id: Number.parseInt(editingTodoId)
        }
        await updateTodo(newTodo)
    }
}

async function openEditor(optionalEditTodoId) {
    const todoEditorElement = document.getElementById('todo-editor')
    const todoTitleElement = document.querySelector('#todo-editor .todo-title')
    const todoDetailElement = document.querySelector('#todo-editor .todo-detail')
    const todoRequiresElement = document.querySelector('#todo-editor .todo-requires')

    if (optionalEditTodoId) {
        const todo = await Database.get(optionalEditTodoId)

        todoTitleElement.value = todo.title
        todoDetailElement.value = todo.detail
        todoRequiresElement.value = todo.requires || ''
        todoRequiresElement.disabled = true

        todoEditorElement.setAttribute('edit-todo-id', todo.id)
    }

    todoTitleElement.placeholder = 'Summary'

    todoEditorElement.classList.add('open')
    todoTitleElement.focus()
}

function closeEditor(optionalClearEditor = false) {
    const todoEditorElement = document.getElementById('todo-editor')
    const todoTitleElement = document.querySelector('#todo-editor .todo-title')
    const todoDetailElement = document.querySelector('#todo-editor .todo-detail')
    const todoRequiresElement = document.querySelector('#todo-editor .todo-requires')

    if (optionalClearEditor) {
        todoTitleElement.value = ''
        todoDetailElement.value = ''
        todoRequiresElement.value = ''
    }

    todoRequiresElement.disabled = false
    todoEditorElement.removeAttribute('edit-todo-id')
    todoTitleElement.placeholder = 'Add...'

    todoEditorElement.classList.remove('open')
}

function updateTodoUI(todo) {
    const id = todo.id
    const li = document.querySelector(`.todos li[todo-id='${id}']`)

    const h2 = li.querySelector('h2.title')
    const p = li.querySelector('p.detail')
    const editButton = li.querySelector('button.edit-button')
    const doneButton = li.querySelector('button.done-button')

    h2.textContent = todo.title
    p.textContent = todo.detail

    editButton.textContent = 'EDIT'

    if (todo.done) {
        li.setAttribute('todo-done', '')
        doneButton.textContent = 'UNDONE'
    } else {
        li.removeAttribute('todo-done')
        doneButton.textContent = 'DONE'
    }

    const requriesOption =
        document.querySelector(`#todo-editor .todo-requires option[value='${id}']`)
    if (requriesOption) {
        requriesOption.textContent = `${id}: ${todo.title}`
    }

    const ul = li.parentElement
    const threadTodos = ul.querySelectorAll(':scope > li')
    const threadDone = Array.from(threadTodos).every(todoLi => {
        return todoLi.hasAttribute('todo-done')
    })
    if (threadDone) {
        ul.setAttribute('thread-done', '')
    } else {
        ul.removeAttribute('thread-done')
    }
}

function appendTodoToUI(todo) {
    const parentElement = document.querySelector('div.todos')

    const editButtonOnClick = (e) => {
        const todoElement = e.target.parentElement.parentElement
        const id = Number.parseInt(todoElement.getAttribute('todo-id'))
        openEditor(id)
    }

    const doneButtonOnClick = async () => {
        const newDone = !todo.done
        todo.done = newDone
        await updateTodo(todo)
    }

    const deleteButtonOnClick = async () => {
        const id = todo.id
        await deleteTodo(id)
    }

    const createLi = (todo) => {
        const li = document.createElement('li')
        const h2 = document.createElement('h2')
        const p = document.createElement('p')
        const buttons = document.createElement('div')
        const deleteButton = document.createElement('button')
        const editButton = document.createElement('button')
        const doneButton = document.createElement('button')

        h2.classList.add('title')
        p.classList.add('detail')
        buttons.classList.add('buttons')
        deleteButton.classList.add('delete-button')
        editButton.classList.add('edit-button')
        doneButton.classList.add('done-button')

        deleteButton.addEventListener('click', deleteButtonOnClick)
        editButton.addEventListener('click', editButtonOnClick)
        doneButton.addEventListener('click', doneButtonOnClick)

        deleteButton.textContent = 'DELETE'

        li.setAttribute('todo-id', todo.id)

        li.appendChild(h2)
        li.appendChild(p)
        li.appendChild(buttons)
        buttons.appendChild(doneButton)
        buttons.appendChild(editButton)
        buttons.appendChild(deleteButton)

        return li
    }

    const appendStandaloneTodo = (todo) => {
        const ul = document.createElement('ul')
        const li = createLi(todo)

        ul.setAttribute('thread-todo-ids', todo.id)

        parentElement.insertBefore(ul, parentElement.children[0])
        ul.appendChild(li)

        const requireSelectElement = document.querySelector('#todo-editor .todo-requires')
        const option = document.createElement('option')
        option.textContent = todo.id + ': ' + todo.title
        option.value = todo.id
        requireSelectElement.appendChild(option)

        updateTodoUI(todo)
    }

    const appendChildTodo = (todo) => {
        const threads = Array.from(document.querySelectorAll('.todos > ul'))
        const targetThread = threads.find(thread => {
            const ids = thread.getAttribute('thread-todo-ids')
                .split(' ')
                .map(Number.parseInt)
            if (ids.includes(todo.requires)) return thread
        })
        if (!targetThread) return false

        targetThread.appendChild(createLi(todo))
        const threadTodoIds = targetThread.getAttribute('thread-todo-ids') + ' ' + todo.id
        targetThread.setAttribute('thread-todo-ids', threadTodoIds)

        updateTodoUI(todo)

        return true
    }

    if ('requires' in todo) {
        if (!appendChildTodo(todo)) {
            appendStandaloneTodo(todo)
        }
    } else {
        appendStandaloneTodo(todo)
    }
}

function setInitialEventListeners() {
    const todoEditorElement = document.getElementById('todo-editor')
    const todosElement = document.querySelector('.todos')
    const todoTitleElement = document.querySelector('#todo-editor .todo-title')
    const todoDetailElement = document.querySelector('#todo-editor .todo-detail')
    const submitElement = document.querySelector('#todo-editor .todo-save')
    const toggleShowDoneElement = document.getElementById('toggle-show-done')
    const searchFilterElement = document.getElementById('filter')

    todoEditorElement.addEventListener('click', (e) => {
        if (!todoEditorElement.classList.contains('open')) {
            openEditor()
        }
        e.stopPropagation()
    })

    todoTitleElement.addEventListener('input', () => {
        if (!todoEditorElement.classList.contains('open')) {
            openEditor()
        }
    })

    window.addEventListener('click', () => {
        closeEditor(true)
    })

    window.addEventListener('keydown', (e) => {
        if (e.code == 'Escape') {
            closeEditor()
        }
    })

    // Adjust textarea height
    todoDetailElement.addEventListener('input', () => {
        const rows = todoDetailElement.value.split('\n').length
        const min = todoDetailElement.getAttribute('min-rows')
        if (rows > min) {
            todoDetailElement.setAttribute('rows', rows)
        } else {
            todoDetailElement.setAttribute('rows', min)
        }
    })

    // Press Enter to focus detail
    todoTitleElement.addEventListener('keypress', (e) => {
        if (e.code == 'Enter') {
            todoDetailElement.focus()
        }
    })

    todoEditorElement.addEventListener('keypress', async (e) => {
        if (e.ctrlKey && e.code == 'Enter') {
            await submitTodoUI()
            closeEditor(true)
        }
    })

    submitElement.addEventListener('click', async () => {
        await submitTodoUI()
        closeEditor(true)
    })

    toggleShowDoneElement.addEventListener('click', () => {
        todosElement.classList.toggle('show-done')
    })

    searchFilterElement.addEventListener('input', (e) => {
        if (e.target.value) {
            filterTodos(e.target.value)
        } else {
            initializeTodos()
        }
    })
}

async function exportTodos() {
    return JSON.stringify(await Database.listAll())
}

async function importTodos(todos) {
    for (const todo of await Database.listAll()) {
        const id = todo.id
        await Database.delete(id)
    }
    for (const todo of todos) {
        await Database.put(todo)
    }
    location.reload()
}
