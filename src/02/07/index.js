// Match Function Requirements with Lodash Partial and Flip

import { curry, flip, partial } from 'lodash';

const createTimeout = curry((time, listener) => {
    const id = setTimeout(listener, time);
    return () => {
        clearTimeout(id);
    };
});

const addListener = curry((element, eventType, listener) => {
    const el = document.createElement(element);
    el.innerHTML = 'click me';
    el.addEventListener(eventType, listener);
    document.body.appendChild(el);
    return () => {
        el.removeEventListener(eventType, listener);
    };
});

const createInterval = curry((time, listener) => {
    const id = setInterval(listener, time);
    return () => {
        clearInterval(id);
    };
});

const addButtonListener = addListener('button');
const addButtonClickListener = addButtonListener('click');
const oneSecond = createInterval(1000);

// broadcaster = function that accepts a listener
const merge = curry((broadcaster1, broadcaster2, listener) => {
    const cancel1 = broadcaster1(listener);
    const cancel2 = broadcaster2(listener);

    return () => {
        cancel1();
        cancel2();
    };
});

const clickOrTick = merge(
    // addButtonClickListener,
    partial(window.addEventListener, 'copy'),
    partial(flip(setInterval), 1000),
);
const cancelClickOrTick = clickOrTick(() => {
    console.log('click or tick');
});

// cancelClickOrTick();
