import { curry, pipe } from 'lodash/fp';
import { createTimeout, done } from './broadcasters';

let createOperator = curry((operator, broadcaster, listener) => {
    return operator(behaviorListener => {
        return broadcaster(value => {
            if (value === done) {
                listener(done);
                return;
            }

            behaviorListener(value);
        });
    }, listener);
});

export let map = transform =>
    createOperator((broadcaster, listener) => {
        return broadcaster(value => {
            listener(transform(value));
        });
    });

export let filter = predicate =>
    createOperator((broadcaster, listener) => {
        return broadcaster(value => {
            if (predicate(value)) {
                listener(value);
            }
        });
    });

export let split = splitter =>
    curry((broadcaster, listener) => {
        let buffer = [];
        return broadcaster(value => {
            if (value === done) {
                listener(buffer);
                buffer = [];
                listener(done);
            }
            if (value == splitter) {
                listener(buffer);
                buffer = [];
            } else {
                buffer.push(value);
            }
        });
    });

export let hardCode = newValue =>
    createOperator((broadcaster, listener) => {
        return broadcaster(value => {
            listener(newValue);
        });
    });

export let add = initial => broadcaster => listener => {
    return broadcaster(value => {
        listener((initial += value));
    });
};

export let startWhen = whenBroadcaster => mainBroadcaster => listener => {
    let cancelMain;
    let cancelWhen;

    cancelWhen = whenBroadcaster(whenValue => {
        if (cancelMain) cancelMain();
        cancelMain = mainBroadcaster(value => {
            if (value === done) {
                if (whenValue === done) {
                    listener(done);
                }
                return;
            }
            listener(value);
        });
    });

    return () => {
        cancelMain();
        cancelWhen();
    };
};

export let stopWhen = whenBroadcaster => mainBroadcaster => listener => {
    let cancelMain = mainBroadcaster(listener);

    let cancelWhen = whenBroadcaster(value => {
        cancelMain();
    });

    return () => {
        cancelMain();
        cancelWhen();
    };
};

export let targetValue = map(event => event.target.value);

export let mapBroadcaster = createBroadcaster => broadcaster => listener => {
    let newCancel;
    const cancel = broadcaster(value => {
        let newBroadcaster = createBroadcaster(value);
        newCancel = newBroadcaster(listener);
    });
    return () => {
        cancel();
        if (newCancel) newCancel();
    };
};

export let applyOperator = broadcaster => mapBroadcaster(operator => operator(broadcaster));

export let stringConcat = broadcaster => listener => {
    let result = '';
    return broadcaster(value => {
        if (value === done) {
            listener(result);
            result = '';
            return;
        }
        result += value;
    });
};

export let repeat = broadcaster => listener => {
    let cancel;
    let repeatListener = value => {
        if (value === done) {
            cancel();
            cancel = broadcaster(repeatListener);
            return;
        }

        listener(value);
    };
    cancel = broadcaster(repeatListener);

    return cancel;
};

export let repeatWhen = whenBroadcaster => broadcaster => listener => {
    let cancel;
    let cancelWhen;
    let repeatListener = value => {
        if (value === done) {
            cancel();

            cancelWhen = whenBroadcaster(() => {
                cancelWhen();
                cancel = broadcaster(repeatListener);
            });
            return;
        }

        listener(value);
    };
    cancel = broadcaster(repeatListener);

    return () => {
        cancel();
        if (cancelWhen) cancelWhen();
    };
};

export let state = broadcaster => listener => {
    let state = 3;
    return broadcaster(value => {
        state--;
        listener(state);
    });
};

export let doneIf = condition => broadcaster => listener => {
    let cancel = broadcaster(value => {
        listener(value);
        if (condition(value)) {
            listener(done);
        }
    });

    return cancel;
};

export let sequence = (...broadcasters) => listener => {
    let broadcaster = broadcasters.shift();
    let cancel;
    let sequenceListener = value => {
        if (value === done && broadcasters.length) {
            let broadcaster = broadcasters.shift();
            cancel = broadcaster(sequenceListener);
            return;
        }
        listener(value);
    };

    cancel = broadcaster(sequenceListener);

    return () => {
        cancel();
    };
};

export let mapSequence = createBroadcaster => broadcaster => listener => {
    let cancel;
    let buffer = [];
    let innerBroadcaster;
    let innerListener = innerValue => {
        if (innerValue === done) {
            innerBroadcaster = null;
            if (buffer.length) {
                let value = buffer.shift();
                if (value === done) {
                    listener(done);
                    return;
                }
                innerBroadcaster = createBroadcaster(value);
                cancel = innerBroadcaster(innerListener);
            }

            return;
        }
        listener(innerValue);
    };
    broadcaster(value => {
        if (innerBroadcaster) {
            buffer.push(value);
        } else {
            innerBroadcaster = createBroadcaster(value);
            cancel = innerBroadcaster(innerListener);
        }
    });

    return () => {
        cancel();
    };
};

export let allowWhen = allowBroadcaster => broadcaster => listener => {
    let current;
    let cancel = broadcaster(value => {
        current = value;
    });

    let cancelAllow = allowBroadcaster(() => {
        listener(current);
    });
    return () => {
        cancel();
        cancelAllow();
    };
};

export let filterByKey = key => filter(event => event.key === key);

export let waitFor = time => broadcaster => listener => {
    let cancelTimeout;
    let cancel = broadcaster(value => {
        if (cancelTimeout) cancelTimeout();
        cancelTimeout = createTimeout(time)(timeoutValue => {
            if (timeoutValue === done) return;
            listener(value);
        });
    });

    return () => {
        cancelTimeout();
        cancel();
    };
};

export let mapError = transform => broadcaster => listener => {
    return broadcaster(value => {
        if (value instanceof Error) {
            listener(transform(value));
            return;
        }

        listener(value);
    });
};

export let ignoreError = broadcaster => listener => {
    return broadcaster(value => {
        if (value instanceof Error) {
            return;
        }

        listener(value);
    });
};

export let mapBroadcasterCache = createBroadcaster => broadcaster => listener => {
    let cache = new Map();
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

        let newBroadcaster = createBroadcaster(value);
        cancel = newBroadcaster(newValue => {
            if (!(newValue instanceof Error)) {
                cache.set(value, newValue);
            }
            console.log(cache);
            listener(newValue);
        });
    });
};

export const share = () => {
    let listeners = [];
    let cancel;
    return broadcaster => {
        return listener => {
            if (!cancel) {
                console.log('setup broadcaster');
                cancel = broadcaster(value => {
                    listeners.forEach(listener => listener(value));
                });
            }
            listeners.push(listener);

            return () => {
                cancel();
                cancel = null;
                listeners = [];
            };
        };
    };
};

export let init = value => broadcaster => listener => {
    listener(value);
    return broadcaster(listener);
};
export let thenCombine = secondBroadcaster => {
    return mapBroadcaster(firstValue => map(secondValue => [firstValue, secondValue])(secondBroadcaster));
};

export let log = b => l =>
    b(v => {
        console.log(v);
        l(v);
    });

export let repeatIf = condition => pipe(doneIf(condition), repeat);
