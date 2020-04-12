import React from 'react';
import ReactDOM from 'react-dom';
// import * as serviceWorker from './serviceWorker';
import './styles/index.css';
import './styles/popup_styles.css';
import Composer from './Views/Pages/Composer/Composer.js';
import {signup, comp, Test} from './TestComponents.js';
ReactDOM.render(comp, document.getElementById('root'));



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
