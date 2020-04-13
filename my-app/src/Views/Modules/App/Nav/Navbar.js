import React from 'react';
import styles from './Styling/style.module.css';
import { Link, withRouter} from 'react-router-dom';

function Navbar(title_part1,title_part2, btitle, title_click_href, button_click_href) {

    if (!(title_part1 && title_part2 && btitle && title_click_href && button_click_href)) throw 'Navbar error: invalid parameters';

    return (
        <div class={styles.cnavbar}>
            <ul>
                <li class={styles.title}><a><Link to={title_click_href}><span class={styles.give}>{title_part1}</span><span class={styles.assist}>{title_part2}</span></Link></a></li>
                <li class={styles.right}><Link to={button_click_href}><button class={styles.login}>{btitle}</button></Link></li>
            </ul>
        </div>
    )
}

export default Navbar;
