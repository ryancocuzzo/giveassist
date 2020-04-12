import React from 'react';
import Analytics from './Views/Modules/App/Analytics/Analytics.js';
import Navbar from './Views/Modules/App/Nav/Navbar.js';
import BasicInfo from './Views/Modules/App/UserInfo/BasicInfo.js';
import PayAndPlanSelect from './Views/Modules/App/UserInfo/PayAndPlanSelect.js';
import DeleteAccount from './Views/Modules/App/UserInfo/DeleteAccount.js';
import Vote from './Views/Modules/App/Vote/Vote.js';
import {TabbedSummary} from './Views/Modules/General/Tabbed/Tabbed.js';
import InputForm from './Views/Modules/General/Form/InputForm.js';
import ParticledContent from './Views/Modules/General/Particle/ParticleBackground.js';
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


let eventInfo = [
    {title: 'Sample Title 1', description: '1: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()},
    {title: 'Sample Title 2', description: '2 : Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()},
    {title: 'Sample Title 3', description: '3 : Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()}
]
const chartData = [
    { title: 'month_n', total: 4000},
    { title: 'month_n', total: 5000},
    { title: 'month_n', total: 6000},
    { title: 'month_n', total: 7000},
];
let userData = [
    {'amount': 12, 'percent_users': 34},
    {'amount': 56, 'percent_users': 78},
    {'amount': 90, 'percent_users': 12},
];
let prevEventData = [
    {'date': '12/12/12','num_users': 12, 'total_rev':34, 'receipt': 'http://google.com'},
    {'date': '2/12/1','num_users': 34, 'total_rev':56, 'receipt': null},
    {'date': '1/2/3','num_users': 589, 'total_rev':78, 'receipt': 'http://max.com'}
];
let total_donated = 12.34;
let current_donation = 3.99;

/* Modules - Standard */

let navbar = Navbar("give","assist",'login', printSomething);
let tabbed = Vote("Vote", "Sample Section Title", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", eventInfo, printx);
let analytics = Analytics(chartData, userData, prevEventData, total_donated, current_donation);
let basicInfo = BasicInfo(null, 'pretext2', printSomething);
let select = <PayAndPlanSelect onSubmitPlan={printSomething}/>;
let deleteAcct = <DeleteAccount/>;


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

let mobile = window.innerHeight < 950;
let height =  !mobile ? window.innerHeight + 'px' : ((window.innerHeight * 1.2) + 'px');

export const Test = ParticledContent(<div><h2 style={{color: 'black'}}>FORM</h2>{form}</div>, {width: '80%', height: height});
