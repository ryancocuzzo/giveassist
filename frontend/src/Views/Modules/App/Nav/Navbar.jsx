import React from 'react';
import styles from './Styling/style.module.css';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ titleClickHref, buttonTitle, buttonOnClick, showDashboard = false }) {
    const location = useLocation();
    const isOnSplashPage = location.pathname === '/';

    const button = (typeof buttonOnClick === 'function') ?
        <button className={styles.login} onClick={buttonOnClick}>{buttonTitle}</button>
        :
        <Link to={buttonOnClick}><button className={styles.login}>{buttonTitle}</button></Link>;

    return (
        <div className={styles.cnavbar}>
            <ul>
                <li className={styles.logoContainer}>
                    <Link to={titleClickHref}>
                        <img src="/big_logo.svg" alt="GiveAssist" className={styles.logo} />
                    </Link>
                </li>
                <li className={styles.right}>
                    <div className={styles.navButtons}>
                        {showDashboard && isOnSplashPage && (
                            <Link to="/app">
                                <button className={styles.dashboard}>
                                    <span className="material-icons">dashboard</span>
                                    Dashboard
                                </button>
                            </Link>
                        )}
                        {button}
                    </div>
                </li>
            </ul>
        </div>
    );
}

export function EmptyNavbar({ titleClickHref }) {
    return (
        <div className={styles.cnavbar}>
            <ul>
                <li className={styles.logoContainer}>
                    <Link to={titleClickHref}>
                        <img src="/big_logo.svg" alt="GiveAssist" className={styles.logo} />
                    </Link>
                </li>
            </ul>
        </div>
    );
}

export default Navbar;
