import React from 'react';
import styles from './Styling/style.module.css';

function Navbar(title_part1,title_part2, btitle, onclick) {

    return (
        <div class={styles.cnavbar}>
            <ul>
                <li class={styles.title}><a><span class={styles.give}>{title_part1}</span><span class={styles.assist}>{title_part2}</span></a></li>
                <li class={styles.right}><button class={styles.login} onClick={onclick}>{btitle}</button></li>
            </ul>
        </div>
    )
}

export default Navbar;
