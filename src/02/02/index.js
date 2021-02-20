// Return a Function to Cancel an Async Behavior

const createTimeout = time => callback => {
    const id = setTimeout(callback, time);
    return () => {
        clearTimeout(id);
    };
};

const oneSecond = createTimeout(1000);
const twoSeconds = createTimeout(2000);
const threeSeconds = createTimeout(3000);

const cancelOne = oneSecond(() => {
    console.log('one');
});

cancelOne();

const cancelTwo = twoSeconds(() => {
    console.log('two');
});

cancelTwo();

threeSeconds(() => {
    console.log('three');
});
