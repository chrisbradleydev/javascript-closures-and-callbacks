// Create a Win Condition with a mapDone Operator

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

const filter = predicate =>
    createOperator((broadcaster, listener) => {
        return broadcaster(value => {
            if (predicate(value)) {
                listener(value);
            }
        });
    });

const targetValue = map(event => event.target.value);

const mapBroadcaster = createBroadcaster => broadcaster => listener => {
    return broadcaster(value => {
        const newBroadcaster = createBroadcaster(value);
        newBroadcaster(listener);
    });
};

const applyOperator = broadcaster => mapBroadcaster(operator => operator(broadcaster));

const stringConcatenate = broadcaster => listener => {
    let result = '';
    return broadcaster(value => {
        if (value === done) {
            listener(result);
            result = '';
            return;
        }
        result += value;
    });
};

const inputValue = targetValue(addListener('#input', 'input'));

const word = forOf('honeycomb');

const hangmanLogic = value => map(letter => (value.includes(letter) ? letter : '*'));

const hangman = pipe(map(hangmanLogic), applyOperator(word), stringConcatenate);

const doneCondition = condition => broadcaster => listener => {
    const cancel = filter(condition)(broadcaster)(value => {
        listener(done);
        cancel();
    });
    return cancel;
};

const mapDone = doneValue => broadcaster => listener => {
    broadcaster(value => {
        if (value === done) {
            listener(doneValue);
        } else {
            listener(value);
        }
    });
};

const winPipe = pipe(
    doneCondition(string => !string.includes('*')),
    mapDone('You win!'),
);

const play = hangman(inputValue);
const win = winPipe(play);

const cancelWhen = cancelBroadcaster => broadcaster => listener => {
    const cancel = broadcaster(listener);
    const cancel2 = cancelBroadcaster(value => {
        cancel();
    });
    return () => {
        cancel();
        cancel2();
    };
};

const rules = pipe(cancelWhen(win));
const playWithWin = rules(play);

playWithWin(console.log);
win(console.log);
