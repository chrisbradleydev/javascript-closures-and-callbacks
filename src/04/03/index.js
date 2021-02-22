// Building a Word Matching Game by Composing Callbacks

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

const map = transform =>
    createOperator((broadcaster, listener) => {
        return broadcaster(value => {
            listener(transform(value));
        });
    });

const targetValue = map(event => event.target.value);

const inputValue = targetValue(addListener('#input', 'input'));

const word = forOf('honeycomb');

inputValue(value => {
    let result = '';
    word(letter => {
        if (letter === done) {
            console.log(result);
            return;
        }
        if (value.includes(letter)) {
            result += letter;
        } else {
            result += '*';
        }
    });
});

const mapBroadcaster = createBroadcaster => broadcaster => listener => {
    broadcaster(value => {
        const newBroadcaster = createBroadcaster(value);
        newBroadcaster(listener);
    });
};

const hangmanLogic = value => {
    return map(letter => (value.includes(letter) ? letter : '*'));
};

const applyOperator = broadcaster => mapBroadcaster(operator => operator(broadcaster));

const stringConcatenate = broadcaster => listener => {
    let result = '';
    broadcaster(value => {
        if (value === done) {
            listener(result);
            result = '';
            return;
        }
        result += value;
    });
};

const hangman = pipe(map(hangmanLogic), applyOperator(word), stringConcatenate);

hangman(inputValue)(console.log);
