// Passing Values Through Callback Hell

import { pipe } from 'lodash/fp';

const click = config => listener => {
    document.addEventListener(config, listener);
};

const timeout = config => listener => {
    setTimeout(() => {
        listener(config);
    }, config);
};

const getURL = config => listener => {
    fetch(`https://api.github.com/user/${config}`)
        .then(response => response.json())
        .then(listener);
};

const nest = mapInner => outer => listener => {
    outer(config => {
        const inner = mapInner(config);
        inner(listener);
    });
};

const timeoutURL = pipe(
    nest(event => timeout(event.x)),
    nest(getURL),
);

timeoutURL(click('click'))(data => {
    console.log(data);
});
