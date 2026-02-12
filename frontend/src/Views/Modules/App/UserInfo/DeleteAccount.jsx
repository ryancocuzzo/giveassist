import React from 'react';
import styles from './Styling/style.module.css';

export default function DeleteAccount(onDeleteAccount) {
    if (!onDeleteAccount) throw new Error('Delete Acct Error: no onDeleteAccount param provided');
    return (
        <div className={styles.sm3}>
            <h2 style={{textAlign: 'center', marginBottom: '20px'}}>Delete Account</h2>
            <br/>
            <div>
                <button className={styles.submit + " " + styles.danger} onClick={onDeleteAccount}>DELETE ACCOUNT</button>
            </div>
        </div>
    );
}
