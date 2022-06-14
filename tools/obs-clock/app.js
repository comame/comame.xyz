const update = () => {
    const currentDate = new Date()

    const year = currentDate.getFullYear()
    const month = currentDate.getMonth() + 1
    const date = currentDate.getDate()
    const day = ['日', '月', '火', '水', '木', '金', '土'][currentDate.getDay()]
    const hours = currentDate.getHours()
    const minutes = currentDate.getMinutes()
    const seconds = currentDate.getSeconds()

    const hoursStr = hours < 10 ? '0' + hours : hours
    const minutesStr = minutes < 10 ? '0' + minutes : minutes
    const secondsStr = seconds < 10 ? '0' + seconds : seconds

    const element = document.getElementById('time')
    element.setAttribute('datetime', currentDate.toISOString())
    // element.textContent = `${year}.${month}.${date}(${day}) ${hoursStr}:${minutesStr}:${secondsStr}`
    element.textContent = ` ${hoursStr}:${minutesStr}:${secondsStr}`
}

const nextFrame = () => requestAnimationFrame(() => {
    update()
    nextFrame()
})

nextFrame()
