// Pass an Array to a Callback with a forOf Function

import { curry } from 'lodash';

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

const forOf = curry((iterable, listener) => {
    const id = setTimeout(() => {
        for (let i of iterable) {
            listener(i);
        }
    }, 0);
    return () => {
        clearTimeout(id);
    };
});

const typeGreeting = zip(createInterval(100), forOf('Hello, John'));

const cancelTypeGreeting = typeGreeting(value => {
    console.log(value[1]);
});

// cancelTypeGreeting();
