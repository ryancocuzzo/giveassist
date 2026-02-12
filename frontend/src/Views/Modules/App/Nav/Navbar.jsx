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
                <li className={styles.logoContainer}>
                    <Link to={title_click_href}>
                        <img src="/big_logo.svg" alt="GiveAssist" className={styles.logo} />
                    </Link>
                </li>
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
                <li className={styles.logoContainer}>
                    <Link to={title_click_href}>
                        <img src="/big_logo.svg" alt="GiveAssist" className={styles.logo} />
                    </Link>
                </li>
            </ul>
        </div>
    );
}

export default Navbar;
