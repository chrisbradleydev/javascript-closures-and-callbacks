// Create a Custom useListener Hook Around useCallback

import React from 'react';
import { useBroadcaster, useListener } from '../../../lib/broadcasters';
import { targetValue } from '../../../lib/operators';
import { render } from 'react-dom';

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();
    const state = useBroadcaster(targetValue(onInput));
    return (
        <div>
            <input type="text" onInput={onInput} />
            <p>{state}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
