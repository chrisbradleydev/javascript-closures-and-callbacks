// Repeat a Broadcaster that Is Done

import { curry } from 'lodash';

const done = Symbol('done');

const createTimeout = curry((time, listener) => {
    const id = setTimeout(() => {
        listener(null);
        listener(done);
    }, time);
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

const one = repeat(hardCode('hi')(createTimeout(1000)));

const cancel = one(console.log);

// cancel();
