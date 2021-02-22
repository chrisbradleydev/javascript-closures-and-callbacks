// Building a Timer UI by Composing Callbacks

import { curry } from 'lodash';
import { pipe } from 'lodash/fp';

const startButton = document.createElement('button');
startButton.id = 'start';
startButton.innerHTML = 'Start';
document.body.appendChild(startButton);

const stopButton = document.createElement('button');
stopButton.id = 'stop';
stopButton.innerHTML = 'Stop';
document.body.appendChild(stopButton);

const createInterval = curry((time, listener) => {
    let i = 0;
    const id = setInterval(() => {
        listener(i++);
    }, time);
    return () => {
        clearInterval(id);
    };
});

const addListener = curry((selector, eventType, listener) => {
    const el = document.querySelector(selector);
    el.addEventListener(eventType, listener);
    return () => {
        el.removeEventListener(eventType, listener);
    };
});

const startClick = addListener('#start', 'click');
const stopClick = addListener('#stop', 'click');
const timer = createInterval(100);

const startWhen = whenBroadcaster => mainBroadcaster => listener => {
    let cancelMain;
    let cancelWhen;

    cancelWhen = whenBroadcaster(() => {
        if (cancelMain) cancelMain();
        cancelMain = mainBroadcaster(value => {
            listener(value);
        });
    });

    return () => {
        cancelMain();
        cancelWhen();
    };
};

const stopWhen = whenBroadcaster => mainBroadcaster => listener => {
    const cancelMain = mainBroadcaster(listener);
    const cancelWhen = whenBroadcaster(() => {
        cancelMain();
    });

    return () => {
        cancelMain();
        cancelWhen();
    };
};

const operators = pipe(stopWhen(stopClick), startWhen(startClick));

operators(timer)(console.log);
