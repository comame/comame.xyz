// ディスプレイ部
const displayHours = document.getElementById('display-hours')
const displayMinutes = document.getElementById('display-minutes')
const displaySeconds = document.getElementById('display-seconds')
const startButton = document.getElementById('start-button')

// テンキー部
const button1 = document.getElementById('button-1')
const button2 = document.getElementById('button-2')
const button3 = document.getElementById('button-3')
const button4 = document.getElementById('button-4')
const button5 = document.getElementById('button-5')
const button6 = document.getElementById('button-6')
const button7 = document.getElementById('button-7')
const button8 = document.getElementById('button-8')
const button9 = document.getElementById('button-9')
const button0 = document.getElementById('button-0')
const buttonPlus5 = document.getElementById('button-plus-5')
const buttonMinus5 = document.getElementById('button-minus-5')
const buttonPlus1 = document.getElementById('button-plus-1')
const buttonMinus1 = document.getElementById('button-minus-1')

// CLR, TIME/REMAIN ボタン
const buttonClear = document.getElementById('button-clear')
const buttonMode = document.getElementById('button-mode')

const numberKeys = [
    button0,
    button1,
    button2,
    button3,
    button4,
    button5,
    button6,
    button7,
    button8,
    button9,
]

// モード切替制御
/** @type {'time'|'remain'} */
let currentMode = 'time'
function toggleMode() {
    if (currentMode === 'time') {
        currentMode = 'remain'
        buttonMode.textContent = 'REMAIN'
    } else {
        currentMode = 'time'
        buttonMode.textContent = 'TIME'
    }
}
addClickEventListener(buttonMode, () => {
    toggleMode()
})

// 数字ディスプレイ制御
/**
 * 12h34m ならば 1234 の形式で表示する
 * @param {number} digits
 */
function display4Digits(digits) {
    const hour = Math.trunc(digits / 100)
    const minute = digits % 100
    displayHours.textContent = ('00' + hour).slice(-2)
    displayMinutes.textContent = ('00' + minute).slice(-2)
}
/**
 * 12h34m56s ならば 123456 の形式で表示する
 * @param {number} digits
 */
function  display6Digits(digits) {
    const fourDigits = Math.trunc(digits / 100)
    const second = digits % 100
    display4Digits(fourDigits)
    displaySeconds.textContent = ('00' + second).slice(-2)
}

// 数字入力制御
let inputTime = 0
/** @param {number} digit  */
function typeKey(digit) {
    if (digit === 0 && inputTime === 0) {
        return
    }
    const next = inputTime * 10 + digit
    if (next > 9999) {
        return
    }
    inputTime = next
    restSeconds = inputTimeToSeconds(inputTime)
    display4Digits(inputTime)
}
numberKeys.forEach(k => {
    addClickEventListener(k, () => {
        const digit = Number.parseInt(k.textContent, 10)
        typeKey(digit)
    })
})
/**
 * @returns {number}
 */
function inputTimeToSeconds() {
    const hours = Math.trunc(inputTime / 100)
    const minutes = inputTime % 100
    return 60 * 60 * hours + 60 * minutes
}

// 分数プラマイ制御
// TODO: スタート後なら別制御が必要
/**
 * @param {number} minutes
 */
function addMinutes(minutes) {
    if (!isAlreadyStarted()) {
        let next = inputTime + minutes
        const m = next % 100
        if (minutes > 0 && m >= 60) {
            next += 100
            next -= 60
        }
        if (minutes < 0 && m >= 60) {
            next -= 100
            next += 60
        }
        if (next > 9999) {
            next = 9999
        }
        if (next < 0) {
            next = 0
        }
        inputTime = next
        restSeconds = inputTimeToSeconds(inputTime)
        display4Digits(next)
        return
    }

    let next = restSeconds + minutes * 60
    if (next > 60 * 60 * 99 + 60 * 59 + 59) {
         next = 60 * 60 * 99 + 60 * 59 + 59
    }
    if (next < 0) {
        next = 0
    }
    restSeconds = next

    const s = next % 60
    const m = Math.trunc(next / 60) % 60
    const h = Math.trunc(next / 3600)
    display6Digits(h * 10000 + m * 100 + s)
}
addClickEventListener(buttonPlus5, () => {
    addMinutes(5)
})
addClickEventListener(buttonMinus5, () => {
    addMinutes(-5)
})
addClickEventListener(buttonPlus1, () => {
    addMinutes(1)
})
addClickEventListener(buttonMinus1, () => {
    addMinutes(-1)
})

// タイマー制御
// タイマーを開始した時刻
let startedAt = -1
// 残り秒数。タイマーが停止状態のときのみ信用できる
let restSeconds = 0
// タイマーが起動しているかどうか
let timerRunning = false
let intervalID = 0
function isAlreadyStarted() {
    return startedAt > 0
}
/** @returns {number} */
function calcElapsedSeconds() {
    const now = Date.now()
    return Math.trunc((now - startedAt) / 1000)
}
function start() {
    if (timerRunning) {
        throw '不正な状態'
    }

    if (restSeconds === 0) {
        return
    }

    startedAt = Date.now()
    timerRunning = true
    intervalID = setInterval(() => {
        const elapsed = calcElapsedSeconds()
        const rest = restSeconds - elapsed
        const s = rest % 60
        const m = Math.trunc(rest / 60) % 60
        const h = Math.trunc(rest / 3600)

        if (rest <= 0) {
            handleClear()
            return
        }

        display6Digits(h * 10000 + m * 100 + s)
    }, 100)


    startButton.classList.remove('paused')
    startButton.textContent = 'PAUSE'
    buttonClear.disabled = true
    numberKeys.forEach(k => {
        k.disabled = true
    })
}
function pause() {
    if (!timerRunning) {
        throw '不正な状態'
    }

    restSeconds -= calcElapsedSeconds()
    const s = restSeconds % 60
    const m = Math.trunc(restSeconds / 60) % 60
    const h = Math.trunc(restSeconds / 3600)
    display6Digits(h * 10000 + m * 100 + s)

    timerRunning = false
    clearInterval(intervalID)

    startButton.classList.add('paused')
    startButton.textContent = 'START'
    buttonClear.disabled = false
}
addClickEventListener(startButton, () => {
    if (timerRunning) {
        pause()
    } else {
        start()
    }
})

// CLR 制御
function handleClear() {
    inputTime = 0
    display6Digits(0)
    startedAt = -1
    restSeconds = 0
    timerRunning = false
    numberKeys.forEach(k => {
        k.disabled = false
    })
}
addClickEventListener(buttonClear, handleClear)

/**
 * タッチデバイスでは touchstart を取るようにするためのワークアラウンド
 *
 * @param {HTMLElement|null} target
 * @param {() => void} f
 */
function addClickEventListener(target, f) {
    if ('ontouchstart' in window) {
        target.addEventListener('touchstart', () => {
            // タッチデバイスだと :active が遅延するのを防ぐ
            target.classList.add('active')
            f()
        })
        target.addEventListener('touchend', () => {
            target.classList.remove('active')
        })
    } else {
        target.addEventListener('mousedown', () => {
            target.classList.add('active')
            f()
        })
        target.addEventListener('mouseup', () => {
            target.classList.remove('active')
        })
    }
}
