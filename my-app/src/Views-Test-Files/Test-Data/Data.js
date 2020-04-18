import React from 'react';
import {priceForPlanWithTitle, titleOfPlanWithCost} from '../../Helper-Files/variables';

String.prototype.replaceAll = function(search, replacement) {
    var target = this + '';
    return target.split(search).join(replacement);
  };


  

export const extractPhoneNumber = (uncleaned) => {
    var cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
    return cleaned;
}

export function validateName(name) {
    if (!name) return false;
   return name.length > 4;
}
export const validateEmail = (email) => {
   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(String(email).toLowerCase());
}
export const validatePhone = (phone) => {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(String(phone))&& String(phone).length == 10;
}

export function validateMoney(amt, min_amt) {
    let money_regex = /^[0-9]+(\.[0-9]{1,2})?$/;
    if (!amt) return false;
    if (typeof amt === 'string' && amt.includes('$')) return false;
    return money_regex.test(amt) && parseFloat(amt) % 1 === 0 && (min_amt ? parseFloat(amt) > min_amt : true);
}

/* @param planname will arrive as a string (i.e PX)
    @param customAmt will arrive as a num or null (i.e 3.99)
    @return a db-usable plan format (i.e PX,3.99 or PY,4.99 or PZ,12(whole #))   */
export const formatPlan = (planname, customAmt) => {
    // ensure it's a floating point number
    if (typeof planname !== 'string' || customAmt === undefined) throw 'formatPlan params error';
    let found_price = priceForPlanWithTitle(planname);
    let price = found_price ? found_price : customAmt;
    return planname+ ',' + String(price);
}

export const pr = () => console.log('x');
export const printSomething = () => alert('woah');
export const printx = (x) => alert(x);
export const ran = () => { return Math.round(Math.random() * 100); }

/* Field descriptions */

export const emailField = {
    title: 'Email',
    validate: validateEmail,
    placeholder: 'Enter your email',
    onChange: pr,
    type: 'email'
};
export const passwordField = {
    title: 'Password',
    validate: validateName,
    placeholder: 'Enter your password',
    onChange: pr,
    type: 'password'
};

export const confirmPasswordField = {
    title: 'Confirm password',
    placeholder: 'Re-type your password',
    onChange: pr,
    type: 'password'
};

export const phoneField = {
    title: 'Phone',
    validate: validatePhone,
    onChange: pr,
    placeholder: 'Enter your phone number',
    type: 'number'
};

export const nameField = {
    title: 'Full Name',
    validate: validateName,
    placeholder: 'Enter your name',
    onChange: pr,
};

/*TEST_emailField, TEST_passwordField, TEST_confirmPasswordField, 
TEST_phoneField, TEST_nameField */
export const TEST_emailField = {
    title: 'Email',
    validate: validateEmail,
    placeholder: 'Enter your email',
    onChange: pr,
    value: 'ryan@gm.com',
    type: 'email'
};
export const TEST_passwordField = {
    title: 'Password',
    validate: validateName,
    placeholder: 'Enter your password',
    onChange: pr,
    value: 'testpw123',
    type: 'password'
};

export const TEST_confirmPasswordField = {
    title: 'Confirm password',
    placeholder: 'Re-type your password',
    onChange: pr,
    value: 'testpw123',
    type: 'password'
};

export const TEST_phoneField = {
    title: 'Phone',
    validate: validatePhone,
    onChange: pr,
    value: '1234567890',
    placeholder: 'Enter your phone number',
    type: 'number'
};

export const TEST_nameField = {
    title: 'Full Name',
    validate: validateName,
    placeholder: 'Enter your name',
    value: 'ryanc',
    onChange: pr,
};




export const eventInfo = [
    {title: 'Sample Title 1', description: '1: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()},
    {title: 'Sample Quavo Huncho Jack', description: '2 : Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()},
    {title: 'MacysTargetWendys', description: '3 : Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.', id: ran()}
]
export const chartData = [
    { title: 'month_n', total: 4000},
    { title: 'month_n', total: 5000},
    { title: 'month_n', total: 6000},
    { title: 'month_n', total: 7000},
];
export const userData = [
    {'amount': 12, 'percent_users': 34},
    {'amount': 56, 'percent_users': 78},
    {'amount': 90, 'percent_users': 12},
];
export const prevEventData = [
    {'date': '12/12/12','num_users': 12, 'total_rev':34, 'receipt': 'http://google.com'},
    {'date': '2/12/1','num_users': 34, 'total_rev':56, 'receipt': null},
    {'date': '1/2/3','num_users': 589, 'total_rev':78, 'receipt': 'http://max.com'}
];
export const total_donated = 12.34;
export const current_donation = 3.99;


/* Input Form */

let inputJSON = {
    title: 'one',
    pretext: '$',
    placeholder: 'placeholder',
    value: 'what is this',
    validate: validateName,
    onChange: pr,
};
let inputJSON_2 = {
    title: 'two',
    pretext: null,
    placeholder: 'placeholder',
    value: 'what is this',
    validate: validateName,
    onChange: pr,
    locked: false
};
let inputJSON_3 = {
    title: 'three',
    pretext: null,
    placeholder: null,
    value: null,
    validate: validateName,
    onChange: pr,
    readonly: null,
    locked: false
};
let inputJSON_4 = {
    title: 'Four Huncho',
    pretext: null,
    placeholder: null,
    value: null,
    validate: validateName,
    onChange: pr,
    readonly: null,
    locked: false
};
export const inputJSON_List = [ inputJSON, inputJSON_2, inputJSON_3, inputJSON_4];
