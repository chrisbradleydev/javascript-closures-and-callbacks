// Time is a Hidden Variable in JavaScript

const listener = value => {
    console.log(value);
};

const broadcaster = listener => {
    listener(1);
    listener(2);
    listener(3);
};

const operator = broadcaster => listener => {
    let currentValue = 0;
    broadcaster(value => {
        currentValue += value;
        setTimeout(() => {
            listener(currentValue);
        }, currentValue * 1000);
    });
};

const timeoutByValue = broadcaster => listener => {
    broadcaster(value => {
        setTimeout(() => {
            listener(value);
        }, value * 1000);
    });
};

operator(broadcaster)(listener);
