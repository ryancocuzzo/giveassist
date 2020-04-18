import React, {Component} from 'react';
import styles from './Styling/style.module.css';
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
                <h3 class={styles.ttl}>You've donated ${total_donated}!</h3>
            <h3 class={styles.ttl}>You're currently donating ${current_donation}/mo.</h3>
            </section>
            {tables}
        </div>
    );
}
