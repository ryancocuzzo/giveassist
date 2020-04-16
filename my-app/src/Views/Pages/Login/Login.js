import React from 'react';
import InputForm from '../../Modules/General/Form/InputForm.js';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';
import styles from './Styles/styles.module.css';
import {validateName, validateEmail, validatePhone, emailField, passwordField} from '../../../Views-Test-Files/Test-Data/Data.js';
import { Link, withRouter} from 'react-router-dom';
import { login, logout } from '../../../Helper-Files/Temp-DB-Utils.js';
let inputs = [ emailField, passwordField ];

function handle_login(field_results){
    let email = field_results[0].value;
    let pass = field_results[1].value;
    console.log('attempting login with \n\tEmail: ' + email + ' \n\tPass: ' + pass)
    login(email,pass).then((user) => alert('Welcome!')).catch((err) => alert('Sorry, we could not find an account with that information!'));
}

let CombinedComponents = (
    <div style={{backgroundColor: 'whitesmoke', padding: '10px', margin: '10px', borderRadius: '10px', minWidth: '200px'}}>
        <h1>Login</h1>
        <br/>
    <InputForm fields={inputs} submit={handle_login} submitText="login" customErrorText="Please enter valid login credentials." isSequential={true} notSubmittable={false}/>
        {/* <br/>
        <button class="submit">login</button> */}
        <h4 style={{textAlign: 'center',  marginTop: '15px'}}>Not a user? <Link to="/signup" ><a> Sign up Here</a></Link></h4>
        <br/>
    </div>
)

/* Sign Up Component */

export default class Login extends React.Component {

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <div className="signupContainer">
                {ParticledContent(CombinedComponents, {height: window.innerHeight+"px", marginTop: '20px'})}
            </div>
        )
    }
}
