// Limit to a Single Shared Broadcaster Each New Event

import React from 'react';
import { render } from 'react-dom';
import { getURL, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { map, mapBroadcaster } from '../../../lib/operators';
import { head, pipe } from 'lodash/fp';

const share = () => {
    const listeners = [];
    let cancel;
    return broadcaster => {
        if (!cancel) {
            cancel = broadcaster(value => {
                listeners.forEach(listener => listener(value));
            });
        }
        return listener => {
            listeners.push(listener);

            return () => {
                cancel();
            };
        };
    };
};

const getWord = pipe(
    mapBroadcaster(() => pipe(map(head))(getURL('https://random-word-api.herokuapp.com/word'))),
    share(),
);

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onClick = useListener();
    const word = useBroadcaster(getWord(onClick));
    const anotherWord = useBroadcaster(getWord(onClick));
    return (
        <div>
            <button onClick={onClick}>Load word</button>
            <p>{word}</p>
            <p>{anotherWord}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
