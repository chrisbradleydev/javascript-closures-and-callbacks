// Create a Buffer to Pair Values Together with Zip

import { curry } from 'lodash';

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
    let i = 0;
    const id = setInterval(() => {
        listener(i++);
    }, time);
    return () => {
        clearInterval(id);
    };
});

const zip = curry((broadcaster1, broadcaster2, listener) => {
    const buffer1 = [];
    const cancel1 = broadcaster1(value => {
        buffer1.push(value);
        if (buffer2.length) {
            listener([buffer1.shift(), buffer2.shift()]);
        }
    });

    const buffer2 = [];
    const cancel2 = broadcaster2(value => {
        buffer2.push(value);
        if (buffer1.length) {
            listener([buffer1.shift(), buffer2.shift()]);
        }
    });

    return () => {
        cancel1();
        cancel2();
    };
});

const clickAndTick = zip(addListener('button', 'click'), createInterval(1000));

const cancelClickAndTick = clickAndTick(value => {
    console.log(value);
});

// cancelClickAndTick()
