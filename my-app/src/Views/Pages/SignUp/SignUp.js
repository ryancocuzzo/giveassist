import React from 'react';
import InputForm from '../../Modules/General/Form/InputForm.js';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';
import OptionSelection from '../../Modules/App/UserInfo/PayAndPlanSelect.js';
import styles from './Styles/styles.module.css';
/* Validation */

function validateName(name) {
    if (!name) return false;
   return name.length > 4;
}
var validateEmail = (email) => {
   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(String(email).toLowerCase());
}
var validatePhone = (phone) => {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return re.test(String(phone));
}


/* Other f(x) */
var pr = () => console.log('x');


/* Field descriptions */

let nameField = {
    title: 'Full Name',
    validate: validateName,
    onChange: pr,
};
let emailField = {
    title: 'Email',
    validate: validateEmail,
    onChange: pr,
    type: 'email'
};
let passwordField = {
    title: 'Password',
    validate: validateName,
    onChange: pr,
    type: 'password'
};
let phoneField = {
    title: 'Phone',
    validate: validatePhone,
    onChange: pr,
    type: 'tel'
};
let inputs = [ nameField, emailField, passwordField, phoneField ];

let OptionSelect = <OptionSelection onSubmitPlan={pr} payInfoText="Payment Info" planSelectText="Select Plan" notSubmittable={true}/>;

let CombinedComponents = (
    <div style={{backgroundColor: 'whitesmoke', padding: '10px', margin: '10px', borderRadius: '10px'}}>
        <h1>Sign Up</h1>
        <br/>
        <InputForm fields={inputs} submit={pr} isSequential={true} notSubmittable={true}/>
        <br/>
        {OptionSelect}
        <button class="submit">Sign Up</button>
        <br/>
    </div>
)

/* Sign Up Component */

export default class SignUp extends React.Component {



    render() {
        let mobile = window.innerHeight < 950;
        let height =  !mobile ? window.innerHeight + 'px' : ((window.innerHeight * 1.3) + 'px');

        return (
            <div className="signupContainer">
                {ParticledContent(CombinedComponents, {height: height, marginTop: '20px'})}
            </div>
        )
    }
}
