// Compose Closures and Callbacks to Create New Functions

import { compose, pipe } from 'lodash/fp';

let i = 0;

const callback = event => {
    return i++;
};

const multiply = value => {
    console.log(value * 2);
};

const twosCallback = pipe(callback, multiply);

twosCallback();
twosCallback();
twosCallback();

document.addEventListener('click', twosCallback);
