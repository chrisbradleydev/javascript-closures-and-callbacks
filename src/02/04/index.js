// Create a Utility Function to Control setInterval

const createInterval = time => listener => {
    const id = setInterval(listener, time);
    return () => {
        clearInterval(id);
    };
};

const oneSecond = createInterval(1000);
const cancelOneSecond = oneSecond(() => {
    console.log('one');
});

cancelOneSecond();

const twoSeconds = createInterval(2000);
twoSeconds(() => {
    console.log('two');
});
