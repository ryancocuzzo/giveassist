import React, {Component} from 'react';
// import styles from './Styling/style.modules.css';
import ColoredBarChart from './Submodules/ColoredBarChart.js';
import TabbedTables from './Submodules/TabbedTables.js';
// import {packaged} from '../../../../Helper-Files/Error.js';

export default function Analytics (chartData, userData, eventData, total_donated, current_donation) {

    if (!(chartData && userData && eventData && total_donated && current_donation)) throw 'Invalid Analytics Info';

    let tables = TabbedTables(userData,eventData);

    return (
        <div style={{textAlign: 'left'}}>
            <h1>Insights</h1>
            <ColoredBarChart data={chartData}/>
            <section style={{textAlign: 'center'}}>
                <h3>You've donated ${total_donated}!</h3>
                <h3>You're currently donating ${current_donation} per month!</h3>
            </section>
            {tables}
        </div>
    );
}
