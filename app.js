// @ts-check

class GridItem extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })
    }

    connectedCallback() {
        renderElement(this, undefined)
    }

    static observedAttributes = [
        'type',
        'title',
        'icon-url',
        'image-url',
        'link',
        'dark-text',
        'wide',
    ]

    /**
     * @returns {Promise<string>}
     */
    async render() {
        const attrs = getSelfAttributes(this)

        const isWide = attrs['wide'] !== null

        if (attrs.type === 'icon') {
            const icon = attrs['icon-url']
            const url = attrs['link']
            const title = attrs['title']

            if (!icon || !title || !url) {
                throw new TypeError('missing attributes')
            }

            return await themed`
                <a href='${url}'>
                    <div class='h-168 w-168 rounded-16 bg-background4 inline-flex items-center justify-center data-[wide]:w-[352px] md:data-[wide]:w-[376px] ' ${isWide ? 'data-wide' : ''
                }>
                        <img class='h-64 w-64' src='${icon}'>
                    </div>
                    <p class='text-text2 font-bold text-lg pt-8 text-center'>${title}</p>
                </a>
            `
        } else if (attrs.type === 'image') {
            const image = attrs['image-url']
            const url = attrs['link']
            const title = attrs['title']

            if (!image || !title || !url) {
                throw new TypeError('missing attributes')
            }

            return await themed`
                <a href='${url}'>
                    <div class='inline-block h-168 w-168 rounded-16 bg-background4 relative data-[wide]:w-[352px] md:data-[wide]:w-[376px]' ${isWide ? 'data-wide' : ''
                }>
                        <div class='h-full w-full rounded-16' style='background: center / cover no-repeat url(${image})'></div>
                        <p class='text-text2 font-bold text-lg pt-8 text-center'>${title}</p>
                    </div>
                </a>
            `
        } else {
            throw 'unimplemented'
        }
    }
}

customElements.define('c-grid-item', GridItem)

// === Utility functions for HTML custom elements ===

/**
 * `innerHTML` が変化したらコールバックを呼ぶ。`disconnectedCallback()` で解除すること。
 *
 * @param {(content: string) => unknown} callback
 * @param {HTMLElement} self
 * @returns {number}
 */
function onSlotChange(callback, self) {
    let prev = ''
    return setInterval(async () => {
        if (self.innerHTML == prev) {
            return
        }
        callback(self.innerHTML)
        prev = self.innerHTML
    })
}

/**
 * @param {number} id
 */
function removeSlotChange(id) {
    clearInterval(id)
}

/**
 * Tailwind CSS から出力されたスタイルを読む HTML を吐き出す
 *
 * @param {TemplateStringsArray} string
 * @param {...string} keys
 * @returns {Promise<string>}
 */
async function themed(string, ...keys) {
    /**
     * @param {string} url
     * @returns {Promise<string>}
     */
    function cacheFetchText(url) {
        /** @type {Map<string, Promise<string>>} */
        // @ts-expect-error
        let map = window.__cachemap
        if (!map) {
            // @ts-expect-error
            window.__cachemap = new Map()
            // @ts-expect-error
            map = window.__cachemap
        }

        if (map.has(url)) {
            // @ts-expect-error
            return map.get(url)
        }
        const prom = fetch(url).then((res) => res.text())
        map.set(url, prom)
        return prom
    }

    /**
     * @param {string} css
     */
    async function __getThemeTag(css) {
        /** @type {HTMLTemplateElement} */
        // @ts-expect-error
        let template = document.getElementById('__style')
        if (!template) {
            const el = document.createElement('template')
            el.id = '__style'
            document.body.appendChild(el)
            template = el
        }

        if (!template.textContent) {
            await cacheFetchText(css).then((css) => {
                template.textContent = css
            })
        }

        return `<style>${template.textContent}</style>`
    }

    const styleTag = await __getThemeTag('/dist/style.css')

    let orig = ''
    for (let i = 0; i < keys.length; i += 1) {
        orig += string[i]
        orig += keys[i]
    }
    orig += string[keys.length]
    return `${styleTag}${orig}`
}

/**
 * `static get observedAttributes` に定義された Attribute をまとめて取る
 *
 * @param {HTMLElement} self
 * @returns {{[key: string]: string|null}}
 */
function getSelfAttributes(self) {
    if ('observedAttributes' in self.constructor) {
        /** @type {string[]} */
        // @ts-expect-error
        const keys = self.constructor.observedAttributes
        /** @type {{[key: string]: string|null}} */
        const map = {}
        for (const key of keys) {
            map[key] = self.getAttribute(key)
        }
        return map
    } else {
        console.warn('missing observedAttributes')
        return {}
    }
}

/**
 * render() または mutate() を呼び出す。`connectedCallback` が呼ばれた後に実行すること。
 *
 * @template P
 * @template {HTMLElement & ({ render: (args: P) => Promise<string> } | { mutate: (args: P, prev: ShadowRoot) => void})} T
 * @param {T} self
 * @param {P} props
 */
async function renderElement(self, props, force = false) {
    if (!self.isConnected) {
        return
    }
    if (!self.shadowRoot) {
        return
    }

    // @ts-expect-error
    const prevProps = self.__previousRenderProps
    let needRerender = false
    if (prevProps) {
        // @ts-expect-error
        for (let i = 0; i < props.length; i += 1) {
            if (prevProps[i] !== props[i]) {
                needRerender = true
                break
            }
        }
    } else {
        needRerender = true
    }
    if (force) {
        needRerender = true
    }

    if (needRerender && 'render' in self) {
        self.shadowRoot.innerHTML = await self.render(props)
    } else if (needRerender && 'mutate' in self) {
        self.mutate(props, self.shadowRoot)
    }
    // @ts-expect-error
    self.__previousRenderProps = props
}
