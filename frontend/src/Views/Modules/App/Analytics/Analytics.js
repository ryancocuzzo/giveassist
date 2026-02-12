import React from 'react';
import styles from './Styling/style.module.css';
import ColoredBarChart from './Submodules/ColoredBarChart.js';
import TabbedTables from './Submodules/TabbedTables.js';

const check_string = (s) => s && typeof s === 'string' && s.length > 0 && s.length < 50;

export default function Analytics(chartData, userData, eventData, total_donated, current_donation) {
    const chart_check = chartData && Array.isArray(chartData);
    const userdata_check = userData && Array.isArray(userData);
    const eventdata_check = eventData && Array.isArray(eventData);
    const ttl_check = total_donated !== null && (typeof total_donated === 'number' || check_string(total_donated));
    const curr_check = current_donation !== null && (typeof current_donation === 'number' || check_string(current_donation));
    const check_list = [chart_check, userdata_check, eventdata_check, ttl_check, curr_check];

    let all_passed = true;
    check_list.forEach((check) => { if (!check) all_passed = false; });

    if (!all_passed) throw new Error('Invalid Analytics Info');

    const tables = TabbedTables(userData, eventData);

    return (
        <div style={{textAlign: 'left'}}>
            <h1>Insights</h1>
            <ColoredBarChart data={chartData}/>
            <section style={{textAlign: 'center'}}>
                <h3 className={styles.ttl}>You've donated ${total_donated}!</h3>
                <h3 className={styles.ttl}>You're currently donating ${current_donation}/mo.</h3>
            </section>
            {tables}
        </div>
    );
}
