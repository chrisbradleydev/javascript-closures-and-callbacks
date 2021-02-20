// What Is a Closure in JavaScript

let i = 0;

const closure = () => {
    console.log(i++);
};

closure();
closure();
closure();
