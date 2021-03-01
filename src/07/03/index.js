// Create an ifElse Operator to Fork on a Condition

import React from 'react';
import { useBroadcaster, useListener } from '../../../lib/broadcasters';
import { mapBroadcaster, map, targetValue, waitFor } from '../../../lib/operators';
import { render } from 'react-dom';
import { pipe } from 'lodash/fp';

const openLibraryBaseUrl = 'https://openlibrary.org';

const mapError = transform => broadcaster => listener => {
    return broadcaster(value => {
        if (value instanceof Error) {
            listener(transform(value));
            return;
        }
        listener(value);
    });
};

const getUrl = url => listener => {
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

const ifElse = (condition, ifOp, elseOp) => broadcaster => listener => {
    broadcaster(value => {
        const immediateBroadcaster = innerListener => innerListener(value);
        if (condition(value)) {
            ifOp(immediateBroadcaster)(listener);
        } else {
            elseOp(immediateBroadcaster)(listener);
        }
    });
};

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();

    const inputValue = targetValue(onInput);

    const inputToBookSearch = pipe(
        waitFor(500),
        ifElse(
            name => name.length > 3,
            pipe(
                map(name => `${openLibraryBaseUrl}/search.json?q=${name}`),
                mapBroadcaster(getUrl),
                map(result => result.docs),
            ),
            map(() => []),
        ),
    )(inputValue);

    const books = useBroadcaster(inputToBookSearch, []);

    return (
        <div>
            <input type="text" onInput={onInput} />
            {books.map(book => (
                <div key={book.key}>
                    <a href={`${openLibraryBaseUrl}${book.key}`}>{book.title}</a>
                </div>
            ))}
        </div>
    );
};

render(<App />, document.querySelector('#root'));
