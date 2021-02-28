// Map a Sequence Based on Input Text in React

import React from 'react';
import { createTimeout, forOf, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { allowWhen, filterByKey, hardCode, mapBroadcaster, mapSequence, targetValue } from '../../../lib/operators';
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
    const enter = filterByKey('Enter')(onKeyPress);
    const inputToMessage = pipe(allowWhen(enter), mapBroadcaster(messageSequence))(inputValue);
    const state = useBroadcaster(inputToMessage);
    return (
        <div>
            <input type="text" onInput={onInput} onKeyPress={onKeyPress} />
            <p>{state}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
