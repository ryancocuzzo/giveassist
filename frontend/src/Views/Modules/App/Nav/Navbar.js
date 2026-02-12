import React from 'react';
import styles from './Styling/style.module.css';
import { Link } from 'react-router-dom';

function Navbar(title_part1, title_part2, btitle, title_click_href, button_onclick) {

    if (!(title_part1 && title_part2 && btitle && title_click_href && button_onclick)) throw new Error('Navbar error: invalid parameters');

    const button = (typeof button_onclick === 'function') ?
        <button className={styles.login} onClick={button_onclick}>{btitle}</button>
        :
        <Link to={button_onclick}><button className={styles.login}>{btitle}</button></Link>;

    return (
        <div className={styles.cnavbar}>
            <ul>
                <li className={styles.title}><Link to={title_click_href}><span className={styles.give}>{title_part1}</span><span className={styles.assist}>{title_part2}</span></Link></li>
                <li className={styles.right}>{button}</li>
            </ul>
        </div>
    );
}

export function EmptyNavbar(title_part1, title_part2, title_click_href) {
    if (!(title_part1 && title_part2 && title_click_href)) throw new Error('Navbar empty error: invalid parameters');

    return (
        <div className={styles.cnavbar}>
            <ul>
                <li className={styles.title}><Link to={title_click_href}><span className={styles.give}>{title_part1}</span><span className={styles.assist}>{title_part2}</span></Link></li>
            </ul>
        </div>
    );
}

export default Navbar;
