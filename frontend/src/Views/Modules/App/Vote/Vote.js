import React, {Component} from 'react';
import styles from './Styling/style.module.css';
import {TabbedSummary, TabbedContent} from '../../General/Tabbed/Tabbed.js';

export default function Vote (page_title, section_title, summary, topics, doSomething) {
    if (!(page_title && section_title && summary && topics && doSomething)) throw 'Vote.js Error: not all params provided';
    return (
        <div style={{textAlign: 'left'}} >
            <h1>{page_title}</h1>
            <div style={{textAlign: 'center'}}>
                <h2>{section_title}</h2>
            </div>
            <div >
            <div class={styles.summ}><p >{summary}</p></div>
            </div>
            <div style={{marginTop: '25px'}}>
                <TabbedSummary topics={topics} doSomething={doSomething} />
            </div>
        </div>
    );
}
