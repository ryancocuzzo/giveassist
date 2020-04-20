import React, {Component} from 'react';
import styles from './Styling/style.module.css';
import {InputComponent} from '../../General/Form/InputComponent.js';
import {validateName, validateEmail} from '../../General/Form/FormUtils.js';
export default function BasicInfo(name,email, confirm) {
    if (!confirm) throw 'Basic Info error: no confirm param provided';
    var changed_email = null;
    var changed_name = null;
    let email_change = (to) =>  { changed_email = to; console.log(changed_email); }  
    let name_change = (to) =>  { changed_name = to; console.log(changed_name); } 
    let submit = () => { 
        console.log(changed_email + ' v. ' + email);
        console.log(changed_name + ' v. ' + name);
        confirm(changed_name,changed_email);
    } 
    return (
        <div style={{textAlign: 'left'}}>
            <h1>Basic Info</h1>
            <InputComponent title="Email" value={email} onChange={email_change}  placeholder="Enter your email" validate={validateEmail}/>
            <InputComponent title="Full Name" value={name} onChange={name_change} placeholder="Enter your full name" validate={validateName}/>
            <button class={styles.submit} onClick={submit}>Confirm</button>
        </div>
    );
}
