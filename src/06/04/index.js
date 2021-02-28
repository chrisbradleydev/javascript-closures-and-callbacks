// Pass a Listener to a useCallback Hook

import { useBroadcaster } from '../../../lib/broadcasters';
import { targetValue } from '../../../lib/operators';
import React, { useCallback } from 'react';
import { render } from 'react-dom';

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

let listener;
const callbackListener = value => {
    if (typeof value === 'function') {
        listener = value;
        return;
    }
    listener(value);
};

const App = () => {
    const onInput = useCallback(callbackListener);
    const state = useBroadcaster(targetValue(onInput));
    return (
        <div>
            <input type="text" onInput={onInput} />
            <p>{state}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
