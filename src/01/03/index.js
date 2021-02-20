// Can a Function Be a Closure and a Callback

let i = 0;

const callback = event => {
    console.log(i++);
};

document.addEventListener('click', callback);
