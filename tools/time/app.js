(function roop(beforeCalendar, beforeTime) {
    const addZeroIfSmallerThanTen = num => 
        (num >= 10) ? ("" + num) : ("0" + num);
    
    const dateObj = new Date();
    
    const year   = dateObj.getFullYear();
    const month  = addZeroIfSmallerThanTen(dateObj.getMonth() + 1);
    const date   = addZeroIfSmallerThanTen(dateObj.getDate());

    const hour   = addZeroIfSmallerThanTen(dateObj.getHours());
    const minute = addZeroIfSmallerThanTen(dateObj.getMinutes());
    const second = addZeroIfSmallerThanTen(dateObj.getSeconds());

    const dayStr = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dateObj.getDay()];
    
    const calendar = `${year} / ${month} / ${date} [${dayStr}]`;
    const time     = `<b>${hour}</b> : <b>${minute}</b> : ${second}`;

    // 時刻が変わったときだけ DOM を書き換え
    if (calendar != beforeCalendar) {
        document.getElementById("calendar").innerHTML = calendar;
    }
    if (time != beforeTime) {
        document.getElementById("time").innerHTML = time;
    }

    requestAnimationFrame(() => {
        roop(calendar, time);
    });
})();


function isDarkmode() {
    return document.body.classList.contains("dark");
}

function toggleDarkMode() {
    document.body.classList.toggle("dark");
    
    // 次回以降のために保存
    window.localStorage.setItem("time_darkmode", isDarkmode() ? "true" : "false");
}

function requestFullscreen() {
    const target = document.documentElement; 
    target.requestFullscreen       ? target.requestFullscreen()       :
    target.webkitRequestFullscreen ? target.webkitRequestFullscreen() : 
    target.mozRequestFullScreen    ? target.mozRequestFullScreen()    : 
    target.msRequestFullscreen     ? target.msRequestFullscreen()     :
    console.error("Fullscreen unsupported")
}

function exitFullscreen() {
    document.exitFullscreen       ? document.exitFullscreen()       :
    document.webkitExitFullscreen ? document.webkitExitFullscreen() : 
    document.mozExitFullScreen    ? document.mozExitFullScreen()    : 
    document.msExitFullscreen     ? document.msExitFullscreen()     :
    console.error("Fullscreen unsupported")
}

function toggleFullscreen() {
    const isFull = 
        document.fullscreenElement       ? true :
        document.webkitFullscreenElement ? true :
        document.mozFullScreenElement    ? true :
        document.msFullscreenElement     ? true :
        false;
    
    if (isFull) { 
        exitFullscreen();
    } else {
        requestFullscreen();
    }   
}


function onLoad() {
    // 前回のダークモードの設定をロードする
    const isDark = window.localStorage.getItem("time_darkmode") == "true" ? true : false;
    if (isDark) {
        // 一瞬だけ白いのは目に悪い
        setTimeout(toggleDarkMode, 300);
    }
}

let clicked = false;
function onClick(event) {
    if (clicked) {
        toggleFullscreen();
        clicked = false;
    } else {
        clicked = true;
        timeout = setTimeout(() => {
             if (clicked) toggleDarkMode();
             clicked = false;
        }, 250);
    }
}

function onKeyPress(event) {
    switch (event.key) {
        case " ": {
            toggleDarkMode();
            break;
        }
        case "f": {
            requestFullscreen();
            break;
        }
    }
}

if ( // iOS
    navigator.userAgent.indexOf("iPhone") >= 0 ||
    navigator.userAgent.indexOf("iPad")   >= 0 ||
    navigator.userAgent.indexOf("iPod")   >= 0
) {
    window.addEventListener("touchstart", onClick);
} else {
    window.addEventListener("click", onClick);
}
window.addEventListener("keypress", onKeyPress);
window.addEventListener("load", onLoad);


if ("serviceWorker" in navigator) {
     navigator.serviceWorker.register("./service-worker.js", function(result) {
        console.log("ServiceWorker installed.");
    });
}
