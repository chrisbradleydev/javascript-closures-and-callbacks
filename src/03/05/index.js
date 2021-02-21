// Start With the API You Want Then Implement

import { curry, toLower, toUpper } from 'lodash';
import { compose, pipe } from 'lodash/fp';

const done = Symbol('done');

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
    let cancelBoth;

    const buffer1 = [];
    const cancel1 = broadcaster1(value => {
        buffer1.push(value);
        // console.log(buffer1);
        if (buffer2.length) {
            listener([buffer1.shift(), buffer2.shift()]);

            if (buffer1[0] === done || buffer2[0] === done) {
                listener(done);
                cancelBoth();
            }
        }
    });

    const buffer2 = [];
    const cancel2 = broadcaster2(value => {
        buffer2.push(value);
        if (buffer1.length) {
            listener([buffer1.shift(), buffer2.shift()]);
            if (buffer1[0] === done || buffer2[0] === done) {
                listener(done);
                cancelBoth();
            }
        }
    });

    cancelBoth = () => {
        cancel1();
        cancel2();
    };

    return cancelBoth;
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

const modify = curry((broadcaster, listener) => {
    let string = '';
    return broadcaster(value => {
        if (value === done) {
            listener(done);
            return;
        }
        listener((string += value));
    });
});

const map = curry((transform, broadcaster, listener) => {
    return broadcaster(value => {
        if (value === done) {
            listener(done);
            return;
        }
        listener(transform(value));
    });
});

const filter = curry((predicate, broadcaster, listener) => {
    return broadcaster(value => {
        if (value === done) {
            listener(done);
            return;
        }
        if (predicate(value)) {
            listener(value);
        }
    });
});

const operators = pipe(
    map(x => x[1]),
    filter(x => x !== ','),
    modify,
    map(toLower),
);

const myZip = (broadcaster1, broadcaster2) => (...operators) => {
    return pipe(...operators)(zip(broadcaster1, broadcaster2));
};

const typeGreeting = myZip(createInterval(100), forOf('My Zip'))(
    map(x => x[1]),
    filter(x => x !== ','),
    modify,
    map(toLower),
);

const cancelTypeGreeting = typeGreeting(value => {
    if (value === done) {
        console.log('Shutting down');
        return;
    }
    console.log(value);
});

// cancelTypeGreeting();
