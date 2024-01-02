// @ts-check

/**
 * @param {string} url
 * @returns {Promise<ArrayBuffer>}
 */
async function fetchAudioAsArrayBuffer(url) {
    const res = await fetch(url)
    return res.arrayBuffer()
}

/**
 * @param {AudioBuffer} audio
 * @param {number} samples
 * @returns {number[]}
 */
function calculateWaveForm(audio, samples) {
    /** @type {number[]} */
    const wave = Array.from({ length: samples }).fill(0)

    /** @type {(f: (s: Float32Array) => number) => void} */
    const calc = (f) => {
        for (let i = 0; i < audio.numberOfChannels; i += 1) {
            const ch = audio.getChannelData(i)

            const step = Math.trunc(ch.length / samples)
            for (let j = 0; j < samples; j += 1) {
                const p = f(ch.slice(j * step, (j + 1) * step))
                if (wave[j] < p) {
                    wave[j] = p
                }
            }
        }
    }

    calc(getPeakAbsOf)

    return wave
}

/**
 * @param {Float32Array} channelSlice
 * @returns {number}
 */
function getPeakAbsOf(channelSlice) {
    let max = 0
    for (let i = 0; i < channelSlice.length; i += 1) {
        const b = Math.abs(channelSlice[i])
        if (max < b) {
            max = b
        }
    }
    return max
}

/**
 * @param {string} msg
 */
function display(msg) {
    const e = document.getElementById('display')
    if (!e) {
        throw 'no #display'
    }
    e.textContent = msg
}

/**
 * @param {HTMLElement} parentElement
 * @param {number[]} peaks
 * @param {number} maxHeightPx
 */
function renderPeaksAsDivElements(parentElement, peaks, maxHeightPx) {
    const samples = peaks.length

    /**
     * @type {(e: MouseEvent) => HTMLElement}
     */
    const currentTarget = (e) => {
        const t = e.currentTarget
        if (!t || !(t instanceof HTMLElement)) {
            throw 'invalid currentTarget'
        }
        return t
    }

    /**
     * @type {(index: number) => HTMLElement | null}
     */
    const findWaveElementIndexedBy = (index) => {
        return parentElement.querySelector(`*[data-index="${index}"]`)
    }

    /**
     * @type { (e: MouseEvent) => void }
     */
    const handleHover = (e) => {
        const el = currentTarget(e)
        const iAttr = el.getAttribute('data-index')
        if (!iAttr) {
            return
        }
        const index = Number.parseInt(iAttr, 10)
        for (let i = 0; i < index; i += 1) {
            const e = findWaveElementIndexedBy(i)
            if (!e) {
                continue
            }
            e.classList.remove('inactive')
            e.classList.add('active')
        }
        for (let i = index; i < samples; i += 1) {
            const e = findWaveElementIndexedBy(i)
            if (!e) {
                continue
            }
            e.classList.remove('active')
            e.classList.add('inactive')
        }

        display(`Hover: ${index} / ${samples}`)
    }

    for (let i = 0; i < peaks.length; i += 1) {
        const el = document.createElement('div')
        el.classList.add('wave-element', 'inactive')
        el.setAttribute('data-index', i + '')
        el.style.height = Math.trunc(peaks[i] * maxHeightPx) + 'px'
        el.addEventListener('mouseover', handleHover)
        parentElement.appendChild(el)
    }
}

;(async function main() {
    // https://wavesurfer.xyz/wavesurfer-code/examples/audio/audio.wav
    const buf = await fetchAudioAsArrayBuffer('./audio.wav')
    const ctx = new AudioContext()
    const audio = await ctx.decodeAudioData(buf)

    const samples = 150
    const wave = calculateWaveForm(audio, samples)

    ctx.close()

    const parent = document.getElementById('parent')
    if (!parent) {
        throw 'no parent element found'
    }
    renderPeaksAsDivElements(parent, wave, 100)
})()
