// Combine Two Broadcasters to Compare Values

import React from 'react';
import { render } from 'react-dom';
import { combine, getURL, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { map, share, targetValue } from '../../../lib/operators';
import { head, pipe } from 'lodash/fp';

const getWord = pipe(map(head), share())(getURL('https://random-word-api.herokuapp.com/word'));

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();

    const word = useBroadcaster(getWord);

    const gameBroadcaster = combine(targetValue(onInput), getWord);

    const game = useBroadcaster(gameBroadcaster);

    return (
        <div>
            <input type="text" onInput={onInput} />
            <p>{word}</p>
            <p>{JSON.stringify(game)}</p>
        </div>
    );
};

render(<App />, document.querySelector('#root'));
