// Compose Operators to Implement Game Logic

import React from 'react';
import { render } from 'react-dom';
import { combine, getURL, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { filter, map, share, targetValue } from '../../../lib/operators';
import { every, head, isString, pipe } from 'lodash/fp';

const getWord = pipe(map(head), share())(getURL(`https://random-word-api.herokuapp.com/word`));

const gameLogic = pipe(
    filter(every(isString)),
    map(([guess, word]) =>
        Array.from(word)
            .map(letter => (guess.includes(letter) ? letter : '*'))
            .join(''),
    ),
);

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();

    const word = useBroadcaster(getWord);

    const gameBroadcaster = gameLogic(combine(targetValue(onInput), getWord));

    const game = useBroadcaster(gameBroadcaster, '');

    return (
        <div>
            <input type="text" onInput={onInput} />
            <p>{word}</p>
            <p>{game}</p>
        </div>
    );
};

render(<App></App>, document.querySelector('#root'));
