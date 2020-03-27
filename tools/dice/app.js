var $ = (query) => document.querySelector(query);
var $$ = (query) => document.querySelectorAll(query);

function parseDiceString(msg) {
    const splited = msg.split('#');
    const diceStr = splited[0];
    let comment = '';
    if (splited.length > 1) {
        comment = splited.slice(1).join('#');
    };

    console.log({
        diceStr, comment
    });
}

class App {
    constructor() {
        $('#throw-button').addEventListener('click', () => {
            parseDiceString($('#input').value);
        });
    }
}

new App();