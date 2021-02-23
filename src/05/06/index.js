// Map a Sequence Based on Values

import { curry } from 'lodash';
import { pipe } from 'lodash/fp';

const done = Symbol('done');

const input = document.createElement('input');
input.id = 'input';
document.body.appendChild(input);

const hardCode = newValue =>
    createOperator((broadcaster, listener) => {
        return broadcaster(value => {
            listener(newValue);
        });
    });

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

// const inputEnter = filter(event => event.key === 'Enter')(addListener('#input', 'keydown'));

// const score = pipe(
//     state,
//     doneIf(value => value === 0),
//     repeatWhen(inputEnter),
// );

// score(inputClick)(console.log);

const delayMessage = message => hardCode(message)(createTimeout(500));

const sequence = (...broadcasters) => listener => {
    let broadcaster = broadcasters.shift();
    let cancel;
    const sequenceListener = value => {
        if (value === done && broadcasters.length) {
            let broadcaster = broadcasters.shift();
            cancel = broadcaster(sequenceListener);
            return;
        }
        listener(value);
    };

    cancel = broadcaster(sequenceListener);

    return () => {
        cancel();
    };
};

const message = 'Hello, my name is John!'.split(' ');

const mapSequence = createBroadcaster => broadcaster => listener => {
    const buffer = [];
    let innerBroadcaster;
    const innerListener = innerValue => {
        if (innerValue === done) {
            innerBroadcaster = null;
            if (buffer.length) {
                const value = buffer.shift();
                if (value === done) {
                    listener(done);
                    return;
                }
                innerBroadcaster = createBroadcaster(value);
                innerBroadcaster(innerListener);
            }
            return;
        }
        listener(innerValue);
    };
    broadcaster(value => {
        if (innerBroadcaster) {
            buffer.push(value);
        } else {
            innerBroadcaster = createBroadcaster(value);
            innerBroadcaster(innerListener);
        }
    });
};

const hiClick = hardCode('hi')(inputClick);

mapSequence(word => delayMessage(word))(forOf(message))(console.log);
