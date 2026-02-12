import react from 'react';


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

/*TEST_emailField, TEST_passwordField, TEST_confirmPasswordField,
TEST_phoneField, TEST_nameField */
export const TEST_emailField = {
    title: 'Email',
    validate: validateEmail,
    placeholder: 'Enter your email',
    value: 'ryan@gm.com',
    type: 'email'
};
export const TEST_passwordField = {
    title: 'Password',
    validate: validateName,
    placeholder: 'Enter your password',
    value: 'testpw123',
    type: 'password'
};

export const TEST_confirmPasswordField = {
    title: 'Confirm password',
    placeholder: 'Re-type your password',
    value: 'testpw123',
    type: 'password'
};

export const TEST_phoneField = {
    title: 'Phone',
    validate: validatePhone,
    value: '1234567890',
    placeholder: 'Enter your phone number',
    type: 'number'
};

export const TEST_nameField = {
    title: 'Full Name',
    validate: validateName,
    placeholder: 'Enter your name',
    value: 'ryanc'
};
