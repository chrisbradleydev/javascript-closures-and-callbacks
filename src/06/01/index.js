// Adding React to a Vanilla Parcel Project

import React from 'react';
import { render } from 'react-dom';

const div = document.createElement('div');
div.id = 'root';
document.body.appendChild(div);

const App = () => <div>Hello</div>;

render(<App />, document.querySelector('#root'));
