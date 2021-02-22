// Building a Counter UI by Composing Callbacks

const plusButton = document.createElement('button');
plusButton.id = 'plus';
plusButton.innerHTML = '+';
document.body.appendChild(plusButton);

const minusButton = document.createElement('button');
minusButton.id = 'minus';
minusButton.innerHTML = '-';
document.body.appendChild(minusButton);

const addListener = (selector, eventType) => listener => {
    const el = document.querySelector(selector);
    el.addEventListener(eventType, listener);
};

const merge = (b1, b2) => listener => {
    b1(listener);
    b2(listener);
};

const plusClick = addListener('#plus', 'click');
const minusClick = addListener('#minus', 'click');

const hardCode = newValue => broadcaster => listener => {
    broadcaster(value => {
        listener(newValue);
    });
};

const add = initial => broadcaster => listener => {
    broadcaster(value => {
        listener((initial += value));
    });
};

const plusOne = hardCode(1)(plusClick);
const minusOne = hardCode(-1)(minusClick);

const counter = add(0)(merge(plusOne, minusOne));

counter(value => console.log(value));
