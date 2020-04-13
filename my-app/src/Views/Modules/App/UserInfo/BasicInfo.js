import React, {Component} from 'react';
// import * as util from 'util' // has no default export
// import { inspect } from 'util' // or directly
// import ReactDOM from 'react-dom';
import styles from './Styling/style.module.css';
import {InputComponent} from '../../General/Form/InputComponent.js';
import {validateName, validateEmail} from '../../../../Views-Test-Files/Test-Data/Data.js';

export default function BasicInfo(email,name, confirm) {
    if (!confirm) throw 'Basic Info error: no confirm param provided';
    return (
        <div style={{textAlign: 'left'}}>
            <h1>Basic Info</h1>
            <InputComponent title="Email" placetext={email} placeholder="Enter your email" validate={validateEmail}/>
            <InputComponent title="Full Name" placetext={name} placeholder="Enter your full name" validate={validateName}/>
            <button class={styles.submit} onClick={confirm}>Confirm</button>
        </div>
    );
}
