import React, {Component} from 'react';
import Popup from 'react-popup';
import './styles.css';
import Navbar from '../../../Views/Modules/M1/Module.js';
import { Vote, TabbedSummary } from '../../../Views/Modules/m2/Module.js';
// import * as serviceWorker from './serviceWorker';
import Analytics from '../../../Views/Modules/M3/Module.js';
import Settings from '../../../Views/Modules/M4/Module.js';
import Mod4 from '../../../Views/Modules/M4/Submodules/SM1.js';
import Mod5 from '../../../Views/Modules/M4/Submodules/SM2.js';
import Mod6 from '../../../Views/Modules/M4/Submodules/SM3.js';

var printSomething = () => alert('woah');
var printx = (x) => alert(x);

var ran = () => { return Math.round(Math.random() * 100); }

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



let mod1 = Navbar("give","assist",'login', printSomething);

// let summary = <TabbedSummary topics={data} doSomething={printx} />;

let mod2 = Vote("Vote", "Sample Section Title", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", eventInfo, printx);

let mod3 = Analytics(chartData, userData, prevEventData, total_donated, current_donation);

let mod4 = Mod4(null, 'pretext2', printSomething);
let mod5 = <Mod5 onSubmitPlan={printSomething}/>;
let mod6 = <Mod6/>;

export default class Composer extends Component {

    render() {
        return (
            <div class="composer_boundary">
                <Popup />

            <div class="oneWide">
                    <div class="grid_block one not nav">{mod1}</div>
                </div>
                <div class="twoWide">
                    <div class="grid_block two">{mod2}</div>
                    <div class="grid_block three">{mod3}</div>
                <h1 style={{textAlign: 'left'}}>Settings</h1>
                <br/>
            </div>

            <div class="twoWide bordered">
                    <div class="grid_block four not">{mod4}</div>
                    <div class="grid_block five not">{mod5}</div>
                    <div class="grid_block six not">{mod6}</div>
                </div>


            </div>
        );
    }
}


/*
    Fun grid

    <div class="composer_boundary">
        <div class="grid_block one act"><h2>$1000</h2></div>
        <div class="grid_block two"><h2>$2000</h2></div>
        <div class="grid_block three"><h2>$3000</h2></div>
        <div class="grid_block four"><h2>$4000</h2></div>
        <div class="grid_block five"><h2>$5000</h2></div>
    </div>


 */
