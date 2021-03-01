// Remember to Check for Done

import React from 'react';
import { merge, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { filter, mapBroadcaster, map, targetValue, waitFor } from '../../../lib/operators';
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

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => {
    const onInput = useListener();

    const inputValue = targetValue(onInput);

    const inputToBookSearch = pipe(
        waitFor(500),
        filter(name => name.length > 3),
        map(name => `${openLibraryBaseUrl}/search.json?q=${name}`),
        mapBroadcaster(getUrl),
        map(result => result.docs),
    )(inputValue);

    const inputToClearSearch = pipe(
        filter(name => name.length < 2),
        map(() => []),
    )(inputValue);

    const books = useBroadcaster(merge(inputToBookSearch, inputToClearSearch), []);

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
