function isBrowserCompatible() {
    return 'Worker' in window
}

function incompatibleAlert() {
    alert('ブラウザが非対応です。Google Chrome または Firefox を使用してください。')
}

function getTypes() {
    const elements = document.querySelectorAll('#type-buttons > input:checked')
    const types = {
        upper: false,
        lower: false,
        number: false,
        symbol: false
    }
    elements.forEach(el => {
        switch (el.id) {
            case 'type-upper': types.upper = true; break;
            case 'type-lower': types.lower = true; break;
            case 'type-num': types.number = true; break;
            case 'type-symbol': types.symbol = true; break;
        }
    })
    return types
}

function getLength() {
    const selectedButton = document.querySelector('#size-buttons > input:checked')
    const freeInput = document.getElementById('size-free')

    if (freeInput.classList.contains('checked')) {
        return Number.parseInt(freeInput.value || 0)
    }
    return Number.parseInt(selectedButton.id.split('-')[1])
}

document.querySelectorAll('#type-buttons > label').forEach(el => {
    el.addEventListener('click', () => {
        let checked = document.querySelectorAll('#type-buttons > input:checked')
        if (checked.length == 1) {
            checked[0].disabled = true
        } else {
            checked.forEach(el => {
                el.disabled = false
            })
        }
    })
})

document.querySelectorAll('#size-buttons > label').forEach(el => {
    el.addEventListener('click', () => {
        document.getElementById('size-free').classList.remove('checked')
    })
})

document.getElementById('size-free').addEventListener('input', (e) => {
    e.target.classList.add('checked')
    const checked = document.querySelector('#size-buttons > input:checked')
    if (checked) checked.checked = false
})

document.getElementById('generate-button').addEventListener('click', onClickEvent => {
    onClickEvent.target.disabled = true

    const worker = new Worker('./worker.js')
    worker.postMessage({
        types: getTypes(),
        length: getLength()
    })
    worker.addEventListener('message', onMessageEvent => {
        if (onMessageEvent.data.incompatible) {
            incompatibleAlert()
            return
        }

        const password = onMessageEvent.data.password
        document.getElementById('result-input').value = password

        worker.terminate()
        onClickEvent.target.disabled = false
    })
})

document.getElementById('result-input').addEventListener('click', e => {
    e.target.select()
})

document.getElementById('result-copy').addEventListener('click', () => {
    document.getElementById('result-input').select()
    if (!document.execCommand('copy')) alert('なぜかコピーに失敗しました')
})

if (!isBrowserCompatible()) {
    incompatibleAlert()
}
