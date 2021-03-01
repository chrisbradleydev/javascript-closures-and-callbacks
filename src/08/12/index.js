// Exploring the Patterns in the Operators

import React from 'react';
import { render } from 'react-dom';
import { getURL, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { filter, init, log, map, repeatIf, targetValue, thenCombine } from '../../../lib/operators';
import { every, head, isString, pipe } from 'lodash/fp';

const getWord = pipe(map(head))(getURL(`https://random-word-api.herokuapp.com/word`));

const repeatLogic = ([word, guess]) => Array.from(word).every(letter => guess.includes(letter));

const gameLogic = pipe(filter(every(isString)), log, repeatIf(repeatLogic));

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
