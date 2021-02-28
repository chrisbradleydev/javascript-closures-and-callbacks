// Create a Custom useBroadcaster Hook

import { createInterval } from '../../../lib/broadcasters';
import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const useBroadcaster = (broadcaster, deps = []) => {
    const [state, setState] = useState('Hi');
    useEffect(() => {
        broadcaster(setState);
    }, deps);
    return state;
};

const App = () => {
    const state = useBroadcaster(createInterval(1000));
    return <div>{state}</div>;
};

render(<App />, document.querySelector('#root'));
