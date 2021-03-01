// Compare useBroadcaster and useListener to the Standard React Hooks

import React, { useEffect, useRef, useState } from 'react';
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
    // const onInput = useListener();

    // const inputValue = targetValue(onInput);

    // const inputToBookSearch = pipe(
    //     waitFor(500),
    //     filter(name => name.length > 3),
    //     map(name => `${openLibraryBaseUrl}/search.json?q=${name}`),
    //     mapBroadcaster(getUrl),
    //     map(result => result.docs),
    // )(inputValue);

    // const inputToClearSearch = pipe(
    //     filter(name => name.length < 2),
    //     map(() => []),
    // )(inputValue);

    // const books = useBroadcaster(merge(inputToBookSearch, inputToClearSearch), []);

    const [name, setName] = useState('');
    const [books, setBooks] = useState([]);
    const firstRef = useRef(true);
    const timeoutRef = useRef();
    const controllerRef = useRef();
    useEffect(() => {
        if (firstRef.current) {
            firstRef.current = false;
            return;
        }

        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        if (controllerRef.current) controllerRef.current.abort();
        controllerRef.current = new AbortController();

        const signal = controllerRef.current.signal;
        timeoutRef.current = setTimeout(async () => {
            if (name.length > 3) {
                try {
                    const response = await fetch(`${openLibraryBaseUrl}/search.json?q=${name}`, { signal });
                    const json = await response.json();
                    setBooks(json.docs);
                } catch (error) {}
            }
            if (name.length < 3) {
                setBooks([]);
            }
        }, 500);

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (controllerRef.current) controllerRef.current.abort();
        };
    }, [name]);

    return (
        <div>
            <input type="text" onInput={event => setName(event.target.value)} />
            {books.map(book => (
                <div key={book.key}>
                    <a href={`${openLibraryBaseUrl}${book.key}`}>{book.title}</a>
                </div>
            ))}
        </div>
    );
};

render(<App />, document.querySelector('#root'));
