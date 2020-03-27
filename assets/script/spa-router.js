// Copyright 2020 comame

/**
 * div[component=index]
 * div[component=another]
 * div[component=with-params]
 * div[compoent-place]
 *
 * router.enableLog()
 *
 * router.initialize([{
 *     path: '/',
 *     redirect: '/index',
 * }, {
 *     path: '/index',
 *     component: 'index',
 *     name: 'Index'
 * }, {
 *     path: '/another',
 *     component: 'another',
 * }, {
 *     path: '/with-param/:id',
 *     component: 'with-param',
 * }, {
 *     notfound: '/index'
 * }], {
 *     mode: 'hash' || 'history',
 *     entrypoint: '/entrypoint'
 * })
 *
 * window.addEventListener('component-create', (e) => {
 *     console.log({ detail: e.detail })
 * })
 */

/**
 * route.path: PathString
 * route.notfound: PathString
 * route.name?: string
 * route.redirect?: PathString
 * router.for?: string
 * route.component?: ComponentName
 */


window.router = {
    move(path) {
        _router.move(path)
    },
    redirect(path) {
        _router.redirect(path)
    },
    entrypoint() {
        const entrypoint = _router.entrypoint
        return entrypoint ? entrypoint : ''
    },
    resolve(path) {
        return this.entrypoint() + path
    },
    current() {
        return _router.currentComponent
    },
    currentSub() {
        return _router.subComponents
    },
    initialize(routes, option) {
        _router.initializeRouter(routes, option)
    },
    enableLog() {
        _router.routerLog()
    },
}

window._router = {}

class Component {
    /**
     * name: string
     * element: HTMLElement
     * params: Object
     */

    constructor(name, params) {
        const desiredRoute = _router.routes.find(route => route.component == name)
        if (!desiredRoute) throw new Error('Route for this component is not set')

        this.name = name
        this.params = params

        const component = _router.componentElements.find(it => it.getAttribute('component') == name)
        if (typeof component == 'undefined') throw new Error('Component does not exist')

        const nComponent = component.cloneNode(true)
        nComponent.id = 'c-' + nComponent.getAttribute('component')

        const beforeComponent = document.querySelector('*[component]:not([for])')
        if (beforeComponent) {
            beforeComponent.parentNode.replaceChild(nComponent, beforeComponent)
        } else {
            const defaultPlace = document.querySelector('*[component-place]:not([for])')
            if (!defaultPlace) throw new Error('Default place is not set')
            defaultPlace.parentNode.replaceChild(nComponent, defaultPlace)
        }

        this.element = nComponent

        _router.log(`component ${name} created`)
    }
}

class SubComponent {
    /**
     * name: string
     * target: string
     * params: object
     * element: Element
     */
    constructor(name, target, params) {
        this.name = name
        this.target = target
        this.params = params

        const element = _router.subComponentElements.find(it => {
            return it.getAttribute('component') == name && it.getAttribute('for') == target
        })
        if (!element) throw new Error('Component not found')

        const nElement = element.cloneNode(true)

        const beforeElement = document.querySelector(`*[component][for=${target}]`)
        if (!beforeElement) {
            const defaultPlace = document.querySelector(`*[component-place][for=${target}]`)
            if (!defaultPlace) throw new Error("defaultPlace not found")
            defaultPlace.parentNode.replaceChild(nElement, defaultPlace)
        } else {
            beforeElement.parentNode.replaceChild(nElement, beforeElement)
        }

        this.element = nElement

        _router.log(`component ${name} for ${target} created`)
    }

    destroy() {
        const defaultEl = document.createElement('div')
        defaultEl.setAttribute('component-place', '')
        defaultEl.setAttribute('for', this.target)
        this.element.parentNode.replaceChild(defaultEl, this.element)
    }
}

_router.routerLog = () => { _router.routerLog = true }

_router.log = (log) => {
    if (!_router.routerLog) return
    console.log(`[ROUTER] ${log}`)
}

_router.getCurrentPath = () => {
    switch (_router.mode) {
        case 'hash': {
            return location.hash.split('#')[1] || ''
        }
        case 'history': {
            if (_router.entrypoint) {
                return location.pathname.slice(_router.entrypoint.length)
            } else {
                return location.pathname
            }
        }
    }
}

_router.embParams = (path, params) => {
    for (const paramKey of _router.getParamKeys(path)) {
        path = path.replace(':' + paramKey, params[paramKey])
    }
    return path
}

_router.comparePath = (desired, current) => {
    if (desired.endsWith('/')) desired = desired.slice(0, -1)
    if (current.endsWith('/')) current = current.slice(0, -1)

    const normalizedDesired = desired.split('/').slice(1)
    const normalizedCurrent = current.split('/').slice(1)

    if (normalizedCurrent.length != normalizedDesired.length) return false

    for (let i = 0; i < normalizedDesired.length; i += 1) {
        if (typeof normalizedCurrent[i] == 'undefined') return false
        if (normalizedDesired[i].startsWith(':')) continue
        if (normalizedDesired[i] == normalizedCurrent[i]) continue
        return false
    }
    return true
}

_router.requireParams = (routerPath) => {
    routerPath = routerPath.split('/')
    for (const path of routerPath) {
        if (path.startsWith(':')) return true
    }
    return false
}

_router.getParamKeys = (routerPath) => {
    const keys = []
    routerPath = routerPath.split('/')
    for (const path of routerPath) {
        if (path.startsWith(':')) keys.push(path.slice(1))
    }
    return keys
}

_router.getParams = (routerPath, currentPath) => {
    routerPath = routerPath.split('/')
    currentPath = currentPath.split('/')

    const params = {}

    for (let i = 0; i < routerPath.length; i += 1) {
        if (!routerPath[i].startsWith(':')) continue
        params[routerPath[i].slice(1)] = currentPath[i]
    }

    if (Object.keys(params).length > 0) return params
}

_router.redirect = (path) => {
    _router.log(`reirect to ${path}`)
    switch (_router.mode) {
        case 'history': {
            history.replaceState(null, '', _router.entrypoint ? _router.entrypoint + path : path)
            window.dispatchEvent(new Event('popstate'))
            break
        }
        case 'hash': {
            history.replaceState(null, '', '#' + path)
            window.dispatchEvent(new Event('hashchange'))
            break
        }
    }
}

_router.move = (path) => {
    _router.log(`move to ${path}`)
    switch (_router.mode) {
        case 'history': {
            history.pushState(null, '', _router.entrypoint ? _router.entrypoint + path : path)
            window.dispatchEvent(new Event('popstate'))
            break
        }
        case 'hash': {
            history.pushState(null, '', '#' + path)
            window.dispatchEvent(new Event('hashchange'))
            break
        }
    }
}

_router.initializeRouter = (routes, option) => {
    if (option && option.mode == 'history') {
        _router.mode = 'history'
    } else {
        _router.mode = 'hash'
    }
    _router.entrypoint = option.entrypoint

    for (const route of routes) {
        if (!('path' in route)) continue
        route.stringPath = route.path
        route.path = route.path.split('/').slice(1)
    }

    _router.routes = routes

    const pathchange = () => {
        _router.log(`pathchanged ${_router.getCurrentPath()}`)

        const currentPath = _router.getCurrentPath()
        const route = _router.routes.find(route => {
            if (!('path' in route)) return false
            if ('for' in route) return false
            return  _router.comparePath(route.stringPath, currentPath)
        })

        if (typeof route == 'undefined') {
            _router.log('not found')
            const notfound = routes.find(route => 'notfound' in route)
            if (!notfound) {
                throw new Error('Route is not found')
            }
            _router.redirect(notfound.notfound)
            return
        }

        if ('redirect' in route) {
            if (_router.requireParams(route.redirect)) {
                const params = _router.getParams(route.stringPath, _router.getCurrentPath())
                _router.redirect(_router.embParams(route.redirect, params))
            } else {
                _router.redirect(route.redirect)
            }
        } else {
            _router.log(`match ${route.component}`)
            if ('name' in route) {
                document.title = route.name
            } else {
                document.title = _router.defaultTitle
            }

            const subRoutes = _router.routes.filter(route => {
                if (!('path' in route)) return false
                return _router.comparePath(route.stringPath, currentPath) && 'for' in route
            })

            if (subRoutes.length > 0) {
                _router.log('sub component detected')
            }

            if ('subComponents' in _router) {
                for (const sub of _router.subComponents) {
                    sub.destroy()
                }
            }

            const params = _router.getParams(route.stringPath, currentPath)

            const component = new Component(route.component, params)
            const subComponents = []

            for (const subRoute of subRoutes) {
                subComponents.push(new SubComponent(subRoute.component, subRoute['for'], params))
            }

            const event = new CustomEvent('component-create', {
                detail: { component, subComponents }
            })
            window.dispatchEvent(event)

            _router.currentComponent = component
            _router.subComponents = subComponents
        }
    }

    switch (_router.mode) {
        case 'history': {
            window.addEventListener('popstate', pathchange)
            break
        }
        case 'hash': {
            window.addEventListener('hashchange', pathchange)
        }
    }

    window.addEventListener('DOMContentLoaded', () => {
        _router.log('onDOMContentLoaded')
        _router.componentElements = []
        _router.subComponentElements = []
        _router.defaultTitle = document.title

        document.querySelectorAll('*[component]:not([for])').forEach(componentEl => {
            const cNode = componentEl.cloneNode(true)
            _router.componentElements.push(cNode)
            componentEl.parentNode.removeChild(componentEl)
        })
        document.querySelectorAll('*[component][for]').forEach(componentEl => {
            const cNode = componentEl.cloneNode(true)
            _router.subComponentElements.push(cNode)
            componentEl.parentNode.removeChild(componentEl)
        })

        switch (_router.mode) {
            case 'history': {
                window.dispatchEvent(new Event('popstate'))
                break
            }
            case 'hash': {
                window.dispatchEvent(new Event('hashchange'))
            }
        }
    })
}
