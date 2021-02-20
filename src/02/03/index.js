// Wrap addEventListener in a Function for More Control

const createTimeout = time => listener => {
    const id = setTimeout(listener, time);
    return () => {
        clearTimeout(id);
    };
};

const addListener = element => eventType => listener => {
    const el = document.createElement(element);
    el.innerHTML = 'click me';
    el.addEventListener(eventType, listener);
    document.body.appendChild(el);
    return () => {
        el.removeEventListener(eventType, listener);
    };
};

const addButtonListener = addListener('button');
const addButtonClickListener = addButtonListener('click');
const removeButtonClickListener = addButtonClickListener(() => {
    console.log('button clicked');
});

removeButtonClickListener();
