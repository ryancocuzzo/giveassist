import React from 'react';
import InputForm from '../../Modules/Form/InputForm.js';
import ParticledContent from '../../../ParticleBackground.js';
import OptionSelection from '../../Modules/M4/Submodules/SM2.js';
import './Styles/styles.css';
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
    <div>
        <h1>Sign Up</h1>
        <br/>
        <InputForm fields={inputs} submit={pr} isSequential={true} notSubmittable={true}/>
        <br/>
        {OptionSelect}
    </div>
)

/* Sign Up Component */

export default class SignUp extends React.Component {



    render() {
        let mobile = window.innerHeight < 950;
        let height =  !mobile ? window.innerHeight + 'px' : ((window.innerHeight * 1.2) + 'px');

        return (
            <div className="dark">
                <div className="signupContainer">
                    {/* <div style={{backgroundColor: 'red', width: window.width + 'px', height: window.innerHeight + 'px'}}>g</div> */}
                    {ParticledContent(CombinedComponents, {width: '80%', height: height})}
                </div>
            </div>
        )
    }
}
