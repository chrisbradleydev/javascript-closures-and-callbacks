// Check Broadcasters Are Properly Cancelled in Operators

import React from 'react';
import { render } from 'react-dom';
import { getURL, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { doneIf, filter, map, mapBroadcaster, repeat, share, targetValue } from '../../../lib/operators';
import { every, head, isString, pipe } from 'lodash/fp';

const getWord = pipe(map(head), share())(getURL(`https://random-word-api.herokuapp.com/word`));

const thenCombine = secondBroadcaster => {
    return mapBroadcaster(firstValue => map(secondValue => [firstValue, secondValue])(secondBroadcaster));
};

const log = b => l =>
    b(v => {
        console.log(v);
        l(v);
    });

const gameLogic = pipe(
    filter(every(isString)),
    log,
    doneIf(([word, guess]) => Array.from(word).every(letter => guess.includes(letter))),
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

    const guessBroadcaster = guessPipe(onInput);

    const gameBroadcaster = gameLogic(thenCombine(guessBroadcaster)(getWord));

    const [word, guess] = useBroadcaster(gameBroadcaster, ['', '']);

    return (
        <div>
            <input type="text" onChange={onInput} value={guess} />
            <p>{word}</p>
            <p>
                {Array.from(word)
                    .map(letter => (guess.includes(letter) ? letter : '*'))
                    .join('')}
            </p>
        </div>
    );
};

render(<App></App>, document.querySelector('#root'));
