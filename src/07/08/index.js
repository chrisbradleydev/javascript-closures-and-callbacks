// Fix Race Conditions Due to Caching and Canceling

import React from 'react';
import { merge, useBroadcaster, useListener } from '../../../lib/broadcasters';
import { filter, map, targetValue, waitFor } from '../../../lib/operators';
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

const ignoreError = broadcaster => listener => {
    return broadcaster(value => {
        if (value instanceof Error) {
            return;
        }

        listener(value);
    });
};

const getUrl = url => listener => {
    const controller = new AbortController();
    const signal = controller.signal;
    fetch(url, { signal })
        .then(response => {
            return response.json();
        })
        .then(json => {
            listener(json);
        })
        .catch(error => {
            listener(error);
        });

    return () => {
        console.log(`aborting`);
        controller.abort();
    };
};

const mapBroadcasterCache = createBroadcaster => broadcaster => listener => {
    const cache = new Map();
    let cancel;
    return broadcaster(value => {
        if (cancel) {
            console.log(`attempting cancel`);
            cancel();
        }

        if (cache.has(value)) {
            listener(cache.get(value));
            return;
        }

        const newBroadcaster = createBroadcaster(value);
        cancel = newBroadcaster(newValue => {
            if (!(newValue instanceof Error)) {
                cache.set(value, newValue);
            }
            console.log(cache);
            listener(newValue);
        });
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
        filter(name => name.length > 3),
        map(name => `https://openlibrary.org/search.json?q=${name}`),
        mapBroadcasterCache(getUrl),
        ignoreError,
        map(result => result.docs),
    )(inputValue);

    const inputToClearSearch = pipe(
        filter(name => name.length < 2),
        map(name => []),
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

render(<App></App>, document.querySelector('#root'));
