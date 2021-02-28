// Map a Sequence of Values in React with useBroadcaster

import React from 'react';
import { createTimeout, forOf, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { hardCode, mapSequence } from '../../../lib/operators';
import { render } from 'react-dom';

const message = 'Hi, my name is John!'.split(' ');
const delayMessage = value => hardCode(value)(createTimeout(500));
const broadcaster = mapSequence(delayMessage)(forOf(message));

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();
    const state = useBroadcaster(broadcaster);
    return (
        <div>
            <input type="text" onInput={onInput} />
            <p>{state}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
