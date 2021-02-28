// Creating a Debounce Operator to Limit Listener Calls

import React from 'react';
import { createTimeout, forOf, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { hardCode, mapBroadcaster, mapSequence, targetValue, waitFor } from '../../../lib/operators';
import { render } from 'react-dom';
import { pipe } from 'lodash/fp';

const delayMessage = value => hardCode(value)(createTimeout(500));
const messageSequence = message => mapSequence(delayMessage)(forOf(message.split(' ')));

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();
    const onKeyPress = useListener();
    const inputValue = targetValue(onInput);
    const inputToMessage = pipe(waitFor(500), mapBroadcaster(messageSequence))(inputValue);
    const state = useBroadcaster(inputToMessage);
    return (
        <div>
            <input type="text" onInput={onInput} />
            <p>{state}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
