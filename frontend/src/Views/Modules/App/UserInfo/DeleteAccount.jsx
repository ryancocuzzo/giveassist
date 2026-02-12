import React from 'react';
import styles from './Styling/style.module.css';

export default function DeleteAccount(onDeleteAccount) {
    if (!onDeleteAccount) throw new Error('Delete Acct Error: no onDeleteAccount param provided');
    return (
        <div className={styles.dangerZone}>
            <div className={styles.dangerHeader}>
                <div>
                    <h3>Danger Zone</h3>
                    <p>Permanently delete your account and all associated data</p>
                </div>
                <span className="material-icons">warning</span>
            </div>
            <button className={styles.dangerButton} onClick={onDeleteAccount}>
                <span className="material-icons">delete_forever</span>
                Delete Account
            </button>
        </div>
    );
}
