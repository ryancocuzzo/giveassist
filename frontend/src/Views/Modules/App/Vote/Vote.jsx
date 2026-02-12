import React from 'react';
import styles from './Styling/style.module.css';
import {TabbedSummary} from '../../General/Tabbed/Tabbed.jsx';

export default function Vote(page_title, section_title, summary, topics, doSomething) {
    if (!(page_title && section_title && summary && topics && doSomething)) throw new Error('Vote.js Error: not all params provided');
    return (
        <div className={styles.voteContainer}>
            <div className={styles.voteHeader}>
                <h1>{page_title}</h1>
                <span className="material-icons">how_to_vote</span>
            </div>
            <div className={styles.voteSection}>
                <h2>{section_title}</h2>
                <div className={styles.summ}>
                    <p>{summary}</p>
                </div>
            </div>
            <div className={styles.voteButtonWrapper}>
                <TabbedSummary topics={topics} doSomething={doSomething} />
            </div>
        </div>
    );
}
