import React from 'react';
import Navbar from './Views/Modules/M1/Module.js';
import { Vote, TabbedSummary } from './Views/Modules/m2/Module.js';
import Analytics from './Views/Modules/M3/Module.js';
import Settings from './Views/Modules/M4/Module.js';
import InputForm from './Views/Modules/Form/InputForm.js';
import InputComponent from './Views/Modules/Form/InputComponent.js';
import ParticledContent from './ParticleBackground.js';
import Composer from './Views/Pages/Composer/Composer.js';
import SignUp from './Views/Pages/SignUp/SignUp.js';

/* Random f(x)s */

var printSomething = () => alert('woah');
var printx = (x) => alert(x);
var pr = () => console.log('x');
function validateName(name) {
    if (!name) return false;
   return name.length > 4;
}
var ran = () => { return Math.round(Math.random() * 100); }


/* Test Data */

let data = [
    {title: 'Sample Title 1', description: '1: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()},
    {title: 'Sample Title 2', description: '2 : Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()},
    {title: 'Sample Title 3', description: '3 : Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()}
]


/* Modules - Standard */

let mod1 = Navbar("Tit","leee",'awesome sauce', printSomething);

let mod2 = Vote("Sample Page title", "Sample Section Title", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", data, printx);

let mod3 = Analytics();

let mod4 = Settings();

/* Views - Standard */

export const comp = <Composer />;

export const signup = <SignUp />;

/* Input Form */

let inputJSON = {
    title: 'one',
    pretext: '$',
    placeholder: 'placeholder',
    value: 'what is this',
    validate: validateName,
    onChange: pr,
};
let inputJSON_2 = {
    title: 'two',
    pretext: null,
    placeholder: 'placeholder',
    value: 'what is this',
    validate: validateName,
    onChange: pr,
    locked: false
};
let inputJSON_3 = {
    title: 'three',
    pretext: null,
    placeholder: null,
    value: null,
    validate: validateName,
    onChange: pr,
    readonly: null,
    locked: false
};
let inputJSON_4 = {
    title: 'Four Huncho',
    pretext: null,
    placeholder: null,
    value: null,
    validate: validateName,
    onChange: pr,
    readonly: null,
    locked: false
};
let inputJSON_List = [ inputJSON, inputJSON_2, inputJSON_3, inputJSON_4];

let form = <InputForm fields={inputJSON_List} submit={pr} isSequential={true} />;

/* Particle */

let content = ParticledContent(<div><h2 style={{color: 'white'}}>FORM</h2>{form}</div>, 500);
