document.getElementById('submit').addEventListener('click', (event) => {
    event.preventDefault();

    const nameInputElement = document.getElementById('taskname-input');
    const monthInputElement = document.getElementById('month-input');
    const dayInputElement = document.getElementById('day-input');

    const name = nameInputElement.value;
    const month = monthInputElement.value;
    const day = dayInputElement.value;

    const listItemElement = document.createElement('li');
    const h2Element = document.createElement('h2');
    const timeElement = document.createElement('time');

    h2Element.innerText = name;
    timeElement.innerText = month + '月' + day + '日';

    listItemElement.appendChild(h2Element);
    listItemElement.appendChild(timeElement);

    const listElement = document.getElementById('list');
    listElement.appendChild(listItemElement);
});
