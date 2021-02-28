// Handling an Enter Keypress with useListener and React

import React from 'react';
import { createTimeout, forOf, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { filter, hardCode, mapSequence, targetValue } from '../../../lib/operators';
import { render } from 'react-dom';

const message = 'Hi, my name is John!'.split(' ');
const delayMessage = value => hardCode(value)(createTimeout(500));
const broadcaster = mapSequence(delayMessage)(forOf(message));
const allowWhen = allowBroadcaster => broadcaster => listener => {
    let current;
    broadcaster(value => {
        current = value;
    });

    allowBroadcaster(() => {
        listener(current);
    });
};

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();
    const onKeyPress = useListener();
    const inputValue = targetValue(onInput);
    const enter = filter(event => event.key === 'Enter')(onKeyPress);
    const state = useBroadcaster(allowWhen(enter)(inputValue));
    return (
        <div>
            <input type="text" onInput={onInput} onKeyPress={onKeyPress} />
            <p>{state}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
