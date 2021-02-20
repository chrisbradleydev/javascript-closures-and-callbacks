// Defining the Broadcaster and Listener Relationship

const listener = value => {
    console.log(value);
};

const broadcaster = listener => {
    listener(1);
    listener(2);
    listener(3);
};

broadcaster(listener);
