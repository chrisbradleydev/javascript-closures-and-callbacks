// Solve Callback Hell with Composition

import { pipe } from 'lodash/fp';

const click = listener => {
    document.addEventListener('click', listener);
};

const timeout = listener => {
    setTimeout(listener, 1000);
};

const getURL = listener => {
    fetch(`https://api.github.com/user/11767079`)
        .then(response => response.json())
        .then(listener);
};

const nest = inner => outer => listener => {
    outer(value => {
        inner(listener);
    });
};

const timeoutURL = pipe(nest(timeout), nest(getURL));

timeoutURL(click)(data => {
    console.log(data);
});
