// Wrap Fetch in a Broadcaster in React

import React from 'react';
import { createTimeout, forOf, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { hardCode, mapBroadcaster, mapSequence, targetValue, waitFor } from '../../../lib/operators';
import { render } from 'react-dom';
import { pipe } from 'lodash/fp';

const githubProfileUrl = 'https://api.github.com/users/chrisbradleydev';

const getURL = url => listener => {
    fetch(url)
        .then(response => response.json())
        .then(json => {
            listener(json);
        });
    return () => {};
};

const cancel = getURL(githubProfileUrl)(console.log);
console.log(cancel);

const delayMessage = value => hardCode(value)(createTimeout(500));
const messageSequence = message => mapSequence(delayMessage)(forOf(message.split(' ')));

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();

    const inputValue = targetValue(onInput);

    const inputToMessage = pipe(waitFor(500), mapBroadcaster(messageSequence))(inputValue);

    const state = useBroadcaster(inputToMessage);

    const profile = useBroadcaster(getURL(githubProfileUrl), { login: '' });

    return (
        <div>
            <input type="text" onInput={onInput} />
            <p>{state}</p>
            <p>{profile.login}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
