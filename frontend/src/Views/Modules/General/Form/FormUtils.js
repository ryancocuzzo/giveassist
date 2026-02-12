import React from 'react';

export const extractPhoneNumber = (uncleaned) => {
    const cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
    return cleaned;
};

export function validateName(name) {
    if (!name) return false;
    return name.length > 4;
}

export const validateEmail = (email) => {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
};

export const validatePhone = (phone) => {
    const re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(String(phone)) && String(phone).length === 10;
};

export function validateMoney(amt, min_amt) {
    const money_regex = /^[0-9]+(\.[0-9]{1,2})?$/;
    if (!amt) return false;
    if (typeof amt === 'string' && amt.includes('$')) return false;
    return money_regex.test(amt) && parseFloat(amt) % 1 === 0 && (min_amt ? parseFloat(amt) > min_amt : true);
}

/* Field descriptions */

export const emailField = {
    title: 'Email',
    validate: validateEmail,
    placeholder: 'Enter your email',
    type: 'email'
};

export const passwordField = {
    title: 'Password',
    validate: validateName,
    placeholder: 'Enter your password',
    type: 'password'
};

export const confirmPasswordField = {
    title: 'Confirm password',
    placeholder: 'Re-type your password',
    type: 'password'
};

export const phoneField = {
    title: 'Phone',
    validate: validatePhone,
    placeholder: 'Enter your phone number',
    type: 'number'
};

export const nameField = {
    title: 'Full Name',
    validate: validateName,
    placeholder: 'Enter your name',
};
