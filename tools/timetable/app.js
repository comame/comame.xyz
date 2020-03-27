const timetable =
    [[9, 0], [10, 40], [13, 0], [14, 45], [16, 30], [18, 15], [19, 55]]
const timetableStr =
    ['09:00', '10:40', '13:00', '14:45', '16:30', '18:15', '19:55']

class App {
    constructor(date) {
        const nextClassElement = new NextClassElement()
        const classCalendarElement = new ClassCalendarElement()

        this.initializeElements(date, nextClassElement, classCalendarElement)
        new ClassEditorElement().init()
        new ImportExport().init()
        new EditorToggleElement().init()

        Class.onChange = () => {
            this.initializeElements(date, nextClassElement, classCalendarElement)
        }

        setInterval(() => {
            this.initializeElements(date, nextClassElement, classCalendarElement)
        }, 60 * 1000)
    }

    getInitializeData(date) {
        const nextTime = this.getNextTime(date)
        let nextClass
        if (nextTime != null) {
            nextClass = this.getNextClass(nextTime, date.getDay())
        } else {
            nextClass = null
        }

        return [
            this.getCurrentTime(date),
            nextTime,
            nextClass
        ]
    }

    initializeElements(date, nextClassElement, classCalendarElement) {
        const [currentTime, nextTime, nextClass] = this.getInitializeData(date)
        nextClassElement.init(nextClass)
        classCalendarElement.init(date, currentTime, nextTime, nextClass)
    }

    getCurrentTime(date) {
        const time = [date.getHours(), date.getMinutes()]

        // 一旦休み時間も授業時間中としてカウントする
        let maybe = null
        for (let i = timetable.length - 1; i >= 0; i--) {
            if (time[0] == timetable[i][0] && time[1] >= timetable[i][1]) {
                maybe = i
                break
            } else if (time[0] == timetable[i][0] && time[1] < timetable[i][1]) {
                maybe =  i - 1 >= 0 ? i - 1 : null
                break
            } else if (time[0] > timetable[i][0]) {
                maybe = i
                break
            }
        }

        if (maybe != null) {
            // 休み時間中を外す
            let endtime = [0, 0]
            endtime[0] = timetable[maybe][0] + 1
            if (timetable[maybe][1] < 30) {
                endtime[1] = timetable[maybe][1] + 30
            } else {
                endtime[1] = timetable[maybe][1] - 30
                endtime[0]++
            }

            let result = maybe
            if (time[0] >= endtime[0] + 1 || (time[0] == endtime[0] && time[1] > endtime[1])) {
                result = null
            }

            return result
        } else {
            return null
        }
    }

    getNextTime(date) {
        const time = [date.getHours(), date.getMinutes()]
        for (let i = timetable.length - 1; i >= 0; i--) {
            if (time[0] == timetable[i][0] && time[1] <= timetable[i][1]) {
                return i
            } else if (time[0] == timetable[i][0] && time[1] > timetable[i][1]) {
                return i + 1 < timetable.length ? i + 1 : null
            } else if (time[0] > timetable[i][0]) {
                return i + 1 < timetable.length ? i + 1 : null
            }
        }
        return 0
    }

    getNextClass(nextTime, day) {
        for (let t = nextTime; t < timetable.length; t++) {
            const nextClass = Class.get(day, t)
            if (nextClass) {
                return nextClass
            }
        }
        return null
    }
}

class EditorToggleElement {
    init() {
        const button = document.querySelector('#editor-toggle input')

        button.onclick = () => {
            document.getElementById('class-editor').classList.toggle('hidden')
        }
    }
}

class NextClassElement {
    init(nextClass) {
        this.render(nextClass)
    }

    render(nextClass) {
        if (nextClass) {
            const time = timetableStr[nextClass.time]

            document.getElementById('next-class').innerHTML =
                `<h1>Next: ${nextClass.time + 1}限 (${time})</h1>
                <ul>
                    <li>名前: ${nextClass.title.escape()}</li>
                    <li>場所: ${nextClass.place.escape()}</li>
                </ul>`
        } else {
            document.getElementById('next-class').innerHTML =
                `<h1> 次の授業はありません</h1>
                <ul>
                    <li>名前: --</li>
                    <li>場所: --</li>
                </ul>`
        }
    }
}

class ClassCalendarElement {
    init(date, currentTime, nextTime, nextClass) {
        const classes = Class.getAll()
        const currentDay = date.getDay()
        this.render(classes, currentTime, currentDay, nextTime, nextClass)
    }

    render(classes, currentTime, day, nextTime, nextClass) {
        let html = ''

        // 休み時間の場合、次の時限をハイライト
        if (currentTime == null && nextTime != null) {
            currentTime = nextTime
        }

        for (let i = 0; i < timetable.length; i++) {
            html += `<tr><th>${i+1}</th>`
            for (let j = 1; j <= 6; j++) {
                const target = classes.find(v => v.day == j && v.time == i)
                html += `<td d-day=${j} d-time=${i} class='data'>`
                if (target) {
                    html += `${target.title.escape()}</td>`
                } else {
                    html += `</td>`
                }
            }
            html += `</tr>`
        }

        document.querySelector('#class-calendar tbody').innerHTML = html
        if (nextClass) {
            document.querySelector(`#class-calendar td[d-day="${day}"][d-time="${nextClass.time}"]`).classList.add('next')
        }
        if (currentTime != null) {
            const el = document.querySelector(`#class-calendar td[d-day="${day}"][d-time="${currentTime}"]`)
            if (el) el.classList.add('now')
        }

        document.querySelectorAll('#class-calendar td.data').forEach(el => {
            el.onclick = event => {
                const day = el.getAttribute('d-day')
                const time = el.getAttribute('d-time')
                const selectedClass = classes.find(v => v.day == day && v.time == time)

                const message =
                    '授業詳細:' + '\n' +
                    (selectedClass ? `   ${selectedClass.title}` + '\n' : '   授業なし') +
                    (selectedClass ? `   ${selectedClass.time + 1}限 (${timetableStr[selectedClass.time]}), ` : '') +
                    (selectedClass ? `${selectedClass.place}` : '')
                window.alert(message)
            }
        })
    }
}

class ClassEditorElement {
    init() {
        document.querySelector('#class-editor form').onsubmit = (event => {
            event.preventDefault()

            const {type, day, time, title, place} = {
                type: event.target.type.value,
                day: parseInt(event.target.day.value),
                time: parseInt(event.target.time.value),
                title: event.target.title.value,
                place: event.target.place.value
            }

            try {
                this.handle(type, {day, time, title, place})
            } catch (err) {
                //TODO: エラーハンドリング
                console.error(err)
                return
            }
            event.target.reset()

            event.target.day.value = day
            event.target.time.value = time
        })
    }

    handle(type, event) {
        switch (type) {
            case 'CREATE':
                Class.create(event.day, event.time, event.title, event.place)
                break
            case 'UPDATE': {
                const current = Class.get(event.day, event.time)
                Class.update(
                    event.day,
                    event.time,
                    event.title ? event.title : current.title,
                    event.place ? event.place : current.place)
                break;
            }
            case 'REMOVE':
                Class.remove(event.day, event.time)
        }
    }
}

class ImportExport {
    init() {
        document.getElementById('io-button').onclick = () => {
            const el = document.getElementById('io-input')
            const i = el.value

            if (i) {
                if (!window.confirm('Are you sure want to overwrite?')) {
                    return
                }
                try {
                    JSON.parse(i)
                } catch (err) {
                    window.alert('形式が不正です')
                    throw i
                }
                localStorage.setItem('timetable-class', i)
                location.reload()
            } else {
                el.value = localStorage.getItem('timetable-class')
                el.select()
                document.execCommand('copy')
                el.value = ''
                window.alert('Copied.')
            }
        }
    }
}

class Class {
    static onChange() {}

    static getAll() {
        if (!localStorage.getItem('timetable-class')) {
            localStorage.setItem('timetable-class', '[]')
        }
        return JSON.parse(localStorage.getItem('timetable-class'))
    }
    static get(day, time) {
        if (!localStorage.getItem('timetable-class')) {
            localStorage.setItem('timetable-class', '[]')
        }
        const all = Class.getAll()
        const result = all.find(v => v.day == day && v.time == time)
        return result ? result : null
    }
    static create(day, time, title, place) {
        if (Class.get(day, time)) {
            throw Error('Already exists')
        }

        const current = Class.getAll()
        localStorage.setItem('timetable-class', JSON.stringify([...current, {
            day,
            time,
            title,
            place
        }]))

        Class.onChange()
    }
    static update(day, time, title, place) {
        if (!Class.get(day, time)) {
            throw Error('Not Found')
        }

        const classes = Class.getAll()
        const index = classes.indexOf(
            classes.find(v => v.day == day && v.time == time)
        )
        classes[index] = { day, time, title, place}

        localStorage.setItem('timetable-class', JSON.stringify([
            ...classes
        ]))

        Class.onChange()
    }
    static remove(day, time) {
        if (!Class.get(day, time)) {
            throw Error('Not Found')
        }

        const classes = Class.getAll()
        const index = classes.indexOf(
            classes.find(v => v.day == day && v.time == time)
        )
        classes.splice(index, 1)

        localStorage.setItem('timetable-class', JSON.stringify([
            ...classes
        ]))

        Class.onChange()
    }
}

new App(new Date())
navigator.serviceWorker.register('./service-worker.js')
