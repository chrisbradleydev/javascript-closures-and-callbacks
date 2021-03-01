// Create an Initialize Operator to Clear an Input Field

import React from 'react';
import { render } from 'react-dom';
import { combine, getURL, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { doneIf, filter, map, repeat, share, targetValue } from '../../../lib/operators';
import { every, head, isString, pipe } from 'lodash/fp';

const getWord = pipe(map(head), share())(getURL(`https://random-word-api.herokuapp.com/word`));

const gameLogic = pipe(
    filter(every(isString)),
    map(([guess, word]) =>
        Array.from(word)
            .map(letter => (guess.includes(letter) ? letter : '*'))
            .join(''),
    ),
    doneIf(guess => guess && !guess.includes('*')),
    repeat,
);

const init = value => broadcaster => listener => {
    listener(value);
    return broadcaster(listener);
};

const guessPipe = pipe(targetValue, init(''));

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();

    const word = useBroadcaster(getWord);

    const guessBroadcaster = guessPipe(onInput);

    const guess = useBroadcaster(guessBroadcaster, '', [word]);

    const gameBroadcaster = gameLogic(combine(guessBroadcaster, getWord));

    const game = useBroadcaster(gameBroadcaster, '');

    return (
        <div>
            <input type="text" onChange={onInput} value={guess} />
            <p>{word}</p>
            <p>{game}</p>
        </div>
    );
};

render(<App></App>, document.querySelector('#root'));
