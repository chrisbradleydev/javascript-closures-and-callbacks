// Map an Error to a Broadcaster Value in React

import React from 'react';
import { createTimeout, forOf, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { hardCode, mapBroadcaster, mapSequence, targetValue, waitFor } from '../../../lib/operators';
import { render } from 'react-dom';
import { pipe } from 'lodash/fp';

const githubProfileUrl = 'https://api.github.com/users/chrisbradleydev';

const mapError = transform => broadcaster => listener => {
    return broadcaster(value => {
        if (value instanceof Error) {
            listener(transform(value));
            return;
        }
        listener(value);
    });
};

const getURL = url => listener => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetch(url, { signal })
        .then(response => response.json())
        .then(json => {
            listener(json);
        })
        .catch(error => {
            listener(error);
        });

    return () => {
        controller.abort();
    };
};

const cancel = mapError(error => ({ login: error.message }))(getURL(githubProfileUrl))(console.log);
cancel();

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
