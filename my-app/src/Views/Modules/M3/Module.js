import React, {Component} from 'react';
import './Styling/style.css';
import SM1 from './Submodules/SM1.js';
import SM2 from './Submodules/SM2.js';


export default function Mod3 (chartData, userData, eventData, total_donated, current_donation) {
    let sm2 = SM2(userData,eventData);

    return (
        <div id="mod3">
            <h1>Insights</h1>
        <SM1 data={chartData}/>
            <section class="centered_text">
                <p>You've donated ${current_donation}!</p>
                <p>You're currently donating ${current_donation} per month!</p>
            </section>
            {sm2}
        </div>
    );
}
