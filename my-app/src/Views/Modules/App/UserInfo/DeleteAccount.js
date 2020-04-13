import React, {Component} from 'react';
import styles from './Styling/style.module.css';
export default function DeleteAccount(onDeleteAccount) {
    if (!onDeleteAccount) throw 'Delete Acct Error: no onDeleteAccount param provided';
    return (
        <div class={styles.sm3}>
            <h2 style={{textAlign: 'center', marginBotton: '20px'}}>Delete Account</h2>
        <br/>
    <div>
        <button class={styles.submit + " " + styles.danger} onClick={onDeleteAccount}>DELETE ACCOUNT</button>
    </div>
        </div>
    );
}
