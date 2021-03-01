// Share the Same Broadcaster Values Across Multiple Listeners

import React from 'react';
import { render } from 'react-dom';
import { getURL, useBroadcaster } from '../../../lib/broadcasters';
import { map } from '../../../lib/operators';
import { head, pipe } from 'lodash/fp';

const share = () => {
    const listeners = [];
    let cancel;
    return broadcaster => {
        cancel = broadcaster(value => {
            listeners.forEach(listener => listener(value));
        });
        return listener => {
            listeners.push(listener);

            return () => {
                cancel();
            };
        };
    };
};

const getWord = pipe(map(head), share())(getURL('https://random-word-api.herokuapp.com/word'));

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const word = useBroadcaster(getWord);
    const anotherWord = useBroadcaster(getWord);
    return (
        <div>
            <p>{word}</p>
            <p>{anotherWord}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
