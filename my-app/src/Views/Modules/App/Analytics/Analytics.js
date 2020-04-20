import React, {Component} from 'react';
import styles from './Styling/style.module.css';
import ColoredBarChart from './Submodules/ColoredBarChart.js';
import TabbedTables from './Submodules/TabbedTables.js';
// import {packaged} from '../../../../Helper-Files/Error.js';

var check_string = (s) => s && typeof s === 'string' && s.length > 0 && s.length < 50;

export default function Analytics (chartData, userData, eventData, total_donated, current_donation) {
    let chart_check = chartData && Array.isArray(chartData); // maybe expand
    let userdata_check = userData && Array.isArray(userData); // maybe expand
    let eventdata_check = eventData && Array.isArray(eventData); // maybe expand
    let ttl_check = total_donated !== null && (typeof total_donated === 'number' || check_string(total_donated));
    let curr_check = current_donation !== null && (typeof current_donation === 'number' || check_string(current_donation));
    let check_list = [chart_check, userdata_check, eventdata_check, ttl_check, curr_check];
    
    var all_passed = true;
    check_list.forEach((check, index) => { /*console.log(index + '. ' + check);*/ if (!check) all_passed = false; });
    
    if (!all_passed) throw 'Invalid Analytics Info';

    let tables = TabbedTables(userData,eventData);

    return (
        <div style={{textAlign: 'left'}}>
            <h1>Insights</h1>
            <ColoredBarChart data={chartData}/>
            <section style={{textAlign: 'center'}}>
                <h3 class={styles.ttl}>You've donated ${total_donated}!</h3>
            <h3 class={styles.ttl}>You're currently donating ${current_donation}/mo.</h3>
            </section>
            {tables}
        </div>
    );
}
