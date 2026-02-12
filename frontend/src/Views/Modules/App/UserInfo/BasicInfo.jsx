import React from 'react';
import styles from './Styling/style.module.css';
import {InputComponent} from '../../General/Form/InputComponent.jsx';
import {validateName, validateEmail} from '../../General/Form/FormUtils.js';

export default function BasicInfo(name, email, confirm) {
    if (!confirm) throw new Error('Basic Info error: no confirm param provided');
    let changed_email = null;
    let changed_name = null;
    const email_change = (to) => { changed_email = to; console.log(changed_email); };
    const name_change = (to) => { changed_name = to; console.log(changed_name); };
    const submit = () => {
        console.log(changed_email + ' v. ' + email);
        console.log(changed_name + ' v. ' + name);
        confirm(changed_name, changed_email);
    };
    return (
        <div className={styles.settingsCard}>
            <div className={styles.settingsHeader}>
                <h2>Profile Information</h2>
                <span className="material-icons">person</span>
            </div>
            <div className={styles.settingsForm}>
                <InputComponent title="Email" value={email} onChange={email_change} placeholder="Enter your email" validate={validateEmail}/>
                <InputComponent title="Full Name" value={name} onChange={name_change} placeholder="Enter your full name" validate={validateName}/>
                <button className={styles.submit} onClick={submit}>Save Changes</button>
            </div>
        </div>
    );
}
