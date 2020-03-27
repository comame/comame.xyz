function isBrowserCompatible() {
    return 'crypto' in self && 'getRandomValues' in self.crypto
}

const symbols = [ '!', '@', '#', '$', '%', '&', '*', '-', '_', '+', '=', ',', '.', '?', '\'', '"', '~' ]

function generateNumber(max) {
    const random = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
    return Number.parseInt(random * max)
}

function usableChars(types) {
    const chars = []
    if (types.upper) {
        for (let i = 0; i < 26; i += 1) {
            chars.push(String.fromCharCode('A'.charCodeAt(0) + i))
        }
    }
    if (types.lower) {
        for (let i = 0; i < 26; i += 1) {
            chars.push(String.fromCharCode('a'.charCodeAt(0) + i))
        }
    }
    if (types.number) {
        for (let i = 0; i < 10; i += 1) {
            chars.push(String.fromCharCode('0'.charCodeAt(0) + i))
        }
    }
    if (types.symbol) {
        chars.push(...symbols)
    }
    return chars
}

if (!isBrowserCompatible()) {
    postMessage({ incompatible: true })
}

self.addEventListener('message', e => {
    const { types, length } = e.data
    const chars = usableChars(types)
    let password = ''
    for (let i = 0; i < length; i += 1) {
        password += chars[generateNumber(chars.length)]
    }
    postMessage({ password })
})
