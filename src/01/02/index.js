// What Is a Callback in JavaScript

const callback = event => {
    console.log('click');
};

const anotherFunction = fn => {
    fn();
    fn();
    fn();
};

anotherFunction(callback);
