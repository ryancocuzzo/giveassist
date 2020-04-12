import React, {Component} from 'react';
import Popup from 'react-popup';
import styles from './styles.css';
import Analytics from '../../Modules/App/Analytics/Analytics.js';
import Navbar from '../../Modules/App/Nav/Navbar.js';
import BasicInfo from '../../Modules/App/UserInfo/BasicInfo.js';
import PayAndPlanSelect from '../../Modules/App/UserInfo/PayAndPlanSelect.js';
import DeleteAccount from '../../Modules/App/UserInfo/DeleteAccount.js';
import Vote from '../../Modules/App/Vote/Vote.js';
import {TabbedSummary, TabbedContent} from '../../Modules/General/Tabbed/Tabbed.js';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';

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

let navbar = Navbar("give","assist",'login', printSomething);
let tabbed = Vote("Vote", "Sample Section Title", "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.", eventInfo, printx);
let analytics = Analytics(chartData, userData, prevEventData, total_donated, current_donation);
let basicInfo = BasicInfo(null, 'pretext2', printSomething);
let select = <PayAndPlanSelect onSubmitPlan={printSomething}/>;
let deleteAcct = <DeleteAccount/>;


let chunk = (
    <div >
        <div class="twoWide">
            <div class="grid_block two">{tabbed}</div>
            <div class="grid_block three">{analytics}</div>

        </div>

        <h1 class="settings" style={{textAlign: 'left'}}>Settings</h1>
        <br/>

        <div class="twoWide bordered basic">
            <div class="grid_block four not">{basicInfo}{deleteAcct}</div>
            <div class="grid_block five not">{select}</div>
        </div>
    </div>
);

let chonk = (
    <div >
        <div class="twoWide">
            <div class="grid_block two"><h1>hey</h1></div>
            <div class="grid_block three"><h1>hi</h1></div>
        </div>
        <div style={{marginLeft: '10px'}}>
            <h1 class="settings" style={{textAlign: 'left'}}>Settings</h1>
        </div>
        <br/>

        <div class="twoWide bordered basic">
            <div class="grid_block four not"><h1>hey</h1></div>
            <div class="grid_block five not"><h1>hey</h1></div>
        </div>
    </div>
);

export default class Composer extends Component {

    constructor(props) {
        super(props);
        this.state = { width: 0, height: 0 };
    }

    componentDidMount() {
      this.updateWindowDimensions();
      window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
      this.setState({ width: window.innerWidth, height: window.innerHeight });
    }
    render() {

        let height;
        // depends on width this time
        if (window.innerWidth > 1100 ) height = '1500px';
        else if (window.innerWidth > 900 ) height = '1550px';
        else if (window.innerWidth > 800 ) height = '1650px';
        else if (window.innerWidth > 500 ) height = '2700px';
        else height = '2750px';
        let orangeBlock = <div style={{backgroundColor: 'orange', height: '100px'}}>hey</div>;
        return (
            <div class="composer_boundary">
                <Popup />
                <div class="one not nav">{navbar}</div>
            {ParticledContent(chunk, {width: '100%', height: height})}
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
