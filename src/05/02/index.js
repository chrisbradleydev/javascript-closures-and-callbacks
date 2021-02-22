// Repeat When Done with a Repeat Operator

import { curry } from 'lodash';

const done = Symbol('done');

const input = document.createElement('input');
input.id = 'input';
document.body.appendChild(input);

const createTimeout = curry((time, listener) => {
    const id = setTimeout(() => {
        listener(null);
        listener(done);
    }, time);
    return () => {
        clearTimeout(id);
    };
});

const addListener = curry((selector, eventType, listener) => {
    const el = document.querySelector(selector);
    el.addEventListener(eventType, listener);
    return () => {
        el.removeEventListener(eventType, listener);
    };
});

const forOf = curry((iterable, listener) => {
    const id = setTimeout(() => {
        for (let i of iterable) {
            listener(i);
        }
        listener(done);
    }, 0);

    return () => {
        clearTimeout(id);
    };
});

const createOperator = curry((operator, broadcaster, listener) => {
    return operator(behaviorListener => {
        return broadcaster(value => {
            if (value === done) {
                listener(done);
                return;
            }

            behaviorListener(value);
        });
    }, listener);
});

const hardCode = newValue =>
    createOperator((broadcaster, listener) => {
        return broadcaster(value => {
            listener(newValue);
        });
    });

const repeat = broadcaster => listener => {
    let cancel;

    const repeatListener = value => {
        if (value === done) {
            cancel();
            broadcaster(repeatListener);
            return;
        }
        listener(value);
    };

    cancel = broadcaster(repeatListener);

    return cancel;
};

const repeatWhen = whenBroadcaster => broadcaster => listener => {
    let cancel;
    let cancelWhen;

    const repeatListener = value => {
        if (value === done) {
            cancel();
            if (cancelWhen) cancelWhen();
            cancelWhen = whenBroadcaster(() => {
                cancel = broadcaster(repeatListener);
            });
            return;
        }

        listener(value);
    };
    cancel = broadcaster(repeatListener);

    return () => {
        cancel();
        if (cancelWhen) cancelWhen();
    };
};

const word = forOf('cat');
const inputClick = addListener('#input', 'click');
repeatWhen(inputClick)(createTimeout(1000))(console.log);
