//@ts-check

/** @type {Element} */
const beatInput = document.getElementById('beat')
/** @type {HTMLButtonElement} */
const tapButton = document.getElementById('tap')

/**
 * @param {number} bpm
 */
function showBPM(bpm) {
    const show = Math.round(bpm * 10) / 10
    beatInput.textContent = `BPM ${show}`
}

/** BPM 判定に何回分の TAP まで考慮するか */
const TAP_TIMES_COUNT = 5

/** @type {number[]} */
let _tapTimes = []

function tap() {
    const now = Date.now()
    _tapTimes.push(now)
    if (_tapTimes.length > TAP_TIMES_COUNT) {
        _tapTimes.shift()
    }
}

/** @returns {number} */
function calculateBPM() {
    if (_tapTimes.length < 2) {
        return 0
    }

    const diffs = []
    for (let i = 1; i < _tapTimes.length; i += 1) {
        diffs.push(_tapTimes[i] - _tapTimes[i - 1])
    }

    if (diffs.length === 0) {
        return 0
    }

    const avgInMs =  diffs.reduce((p, c) => p + c, 0) / diffs.length

    return (60 * 1000) / avgInMs
}

// 初期値セット
showBPM(0)

/** @type {number|null} */
let prevTimeoutID = null

function click() {
    tap()
    showBPM(calculateBPM())

    if (prevTimeoutID !== null) {
        clearTimeout(prevTimeoutID)
    }
    prevTimeoutID = setTimeout(() => {
        console.log('clear')
        _tapTimes = []
    }, 2 * 1000)
}

tapButton.addEventListener('touchstart', (e) => {
    // タッチデバイスでは click イベントを発火させないようにする
    e.preventDefault()
    click()
})
tapButton.addEventListener('click', () => {
    click()
})

window.addEventListener('keydown', (e) => {
    if (e.code !== 'Space') {
        return
    }

    click()
})
