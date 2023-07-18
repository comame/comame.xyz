/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./index.html', './app.js'],
    theme: {
        colors: {
            background1: '#50504d',
            background2: '#1b1b24',
            background3: '#ffffff',
            background4: '#ededed',
            text1: '#ffffff',
            text2: '#ededed',
            text3: '#000000',
        },
        spacing: {
            0: 0,
            4: 4,
            8: 8,
            16: 16,
            24: 24,
            40: 40,
            64: 64,
            104: 104,
            168: 168,
            272: 272,
            440: 440,
        },
        borderRadius: {
            0: 0,
            4: 4,
            8: 8,
            16: 16,
            24: 24,
            max: 999999,
        },
    },
    plugins: [],
}
