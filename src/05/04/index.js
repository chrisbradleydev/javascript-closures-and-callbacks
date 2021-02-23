// Marking Done Based on a Condition

import { curry } from 'lodash';
import { pipe } from 'lodash/fp';

const done = Symbol('done');

const input = document.createElement('input');
input.id = 'input';
document.body.appendChild(input);

const addListener = curry((selector, eventType, listener) => {
    const el = document.querySelector(selector);
    el.addEventListener(eventType, listener);
    return () => {
        el.removeEventListener(eventType, listener);
    };
});

const inputClick = addListener('#input', 'click');

const state = broadcaster => listener => {
    let state = 3;
    return broadcaster(value => {
        state--;
        listener(state);
    });
};

const doneIf = condition => broadcaster => listener => {
    const cancel = broadcaster(value => {
        listener(value);
        if (condition(value)) {
            listener(done);
            cancel();
        }
    });
    return cancel;
};

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

const filter = predicate =>
    createOperator((broadcaster, listener) => {
        return broadcaster(value => {
            if (predicate(value)) {
                listener(value);
            }
        });
    });

const inputEnter = filter(event => event.key === 'Enter')(addListener('#input', 'keydown'));

const repeatWhen = whenBroadcaster => broadcaster => listener => {
    let cancel;
    let cancelWhen;

    const repeatListener = value => {
        if (value === done) {
            cancel();
            cancelWhen = whenBroadcaster(() => {
                cancelWhen();
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

const score = pipe(
    state,
    doneIf(value => value === 0),
    repeatWhen(inputEnter),
);

score(inputClick)(console.log);
