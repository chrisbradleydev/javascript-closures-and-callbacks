// Create a Broadcaster in React with useState and useEffect Hooks

import { createInterval } from '../../../lib/broadcasters';
import React, { useEffect, useState } from 'react';
import { render } from 'react-dom';

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const [state, setState] = useState('Hi');
    useEffect(() => {
        createInterval(1000)(setState);
    }, []);
    return <div>{state}</div>;
};

render(<App />, document.querySelector('#root'));
