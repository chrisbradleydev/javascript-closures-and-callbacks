// Create a Function to Configure setTimeout

const createTimeout = time => callback => {
    setTimeout(callback, time);
};

const oneSecond = createTimeout(1000);
const twoSeconds = createTimeout(2000);
const threeSeconds = createTimeout(3000);

oneSecond(() => {
    console.log('one');
});

twoSeconds(() => {
    console.log('two');
});

threeSeconds(() => {
    console.log('three');
});
