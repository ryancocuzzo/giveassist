import React, {Component} from 'react';
import styles from './Styling/style.module.css';
import {TabbedSummary, TabbedContent} from '../../General/Tabbed/Tabbed.js';

export default function Vote (page_title, section_title, summary, topics, doSomething) {
    return (
        <div style={{textAlign: 'left'}} >
            <h1>{page_title}</h1>
            <div style={{textAlign: 'center'}}>
                <h2>{section_title}</h2>
            </div>
            <div >
            <p class={styles.summ}>{summary}</p>
            </div>
            <div style={{marginTop: '25px'}}>
                <TabbedSummary topics={topics} doSomething={doSomething} />
            </div>
        </div>
    );
}
