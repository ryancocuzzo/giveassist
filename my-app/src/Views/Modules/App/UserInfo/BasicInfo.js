import React, {Component} from 'react';
// import * as util from 'util' // has no default export
// import { inspect } from 'util' // or directly
// import ReactDOM from 'react-dom';
import styles from './Styling/style.module.css';
import {InputComponent} from '../../General/Form/InputComponent.js';



function secure(the) {}

 function validateName(name) {
    return name.length > 4;
 }
//
//  var strong_pass_regex = new RegExp(
//   "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})"
// );
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// const phone_regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

 function validateEmail(email) {
    return email_regex.test(email);
 }

export default function BasicInfo(email,name, confirm) {
    return (
        <div style={{textAlign: 'left'}}>
            <h1>Basic Info</h1>
                <InputComponent title="Email" onChange={secure} placetext={email} placeholder="Enter your email" validate={validateEmail}/>
                <InputComponent title="Full Name" onChange={secure} placetext={name} placeholder="Enter your full name" validate={validateName}/>
            <div>
                <button class={styles.submit} onClick={confirm}>Confirm</button>
            </div>
        </div>
    );
}
