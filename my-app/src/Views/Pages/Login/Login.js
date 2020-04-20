import React from 'react';
import InputForm from '../../Modules/General/Form/InputForm.js';
// import ParticledContent, {SpecificParticledContent, PerfParticledContent} from '../../Modules/General/Particle/ParticleBackground.js';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';
import styles from './Styles/styles.module.css';
import {emailField, passwordField, TEST_emailField, TEST_passwordField} from '../../Modules/General/Form/FormUtils.js';
import { Link, withRouter} from 'react-router-dom';
import { login } from '../../../Helper-Files/Temp-DB-Utils.js';
import Popup from 'react-popup';
// let inputs = [ emailField, passwordField ];
let inputs = [ TEST_emailField, TEST_passwordField ];

function handle_login(field_results){
    let email = field_results[0].value;
    let pass = field_results[1].value;
    console.log('attempting login with \n\tEmail: ' + email + ' \n\tPass: ' + pass)
    login(email,pass).then((user) => Popup.alert('Welcome!')).catch((err) => Popup.alert('Sorry, we could not find an account with that information!'));
}



/* Sign Up Component */

export default class Login extends React.Component {

    constructor(props) {
        super(props);
        this.state = { width: window.innerWidth };
    }

    componentDidMount() {
        window.scrollTo(0, 0);
        window.addEventListener('resize', () => this.setState({width: window.innerWidth}));
    }



    render() {

        let content_style = {
            height: (window.innerHeight-50)+"px"
         };
          let params = {
            vertCenter: true,
            horCenter: true,
            centered: true,
            particleMargin: '2px',

          };

        let CombinedComponents = (
            <div style={{backgroundColor: 'whitesmoke', padding: '10px', borderRadius: '10px', minWidth: this.state.width < 400 ? '300px' : this.state.width < 600 ? '350px' : '420px'}}>
                <h1>Login</h1>
                <br/>
            <InputForm fields={inputs} submit={handle_login} submitText="login" customErrorText="Please enter valid login credentials." isSequential={true} notSubmittable={false}/>
                {/* <br/>
                <button class="submit">login</button> */}
                <h4 style={{textAlign: 'center',  marginTop: '15px'}}>Not a user? <Link to="/signup" > Sign up Here</Link></h4>
                <br/>
            </div>
        )
        return (
            <div className="signupContainer">
                {/* {SpecificParticledContent(CombinedComponents, {height: window.innerHeight+"px", backgroundColor: 'black', color: 'var(--quartiary)', paddingTop:70})} */}
                {ParticledContent(CombinedComponents, content_style, params)}
                {/* {ParticledContent(CombinedComponents, {height: (window.innerHeight-50)+"px", marginTop: '20px'})} */}
                {/* {PerfParticledContent(CombinedComponents, {height: (window.innerHeight-50)+"px", marginTop: '20px'}, {horCenter: true, vertCenter: true})} */}
            </div>
        )
    }
}
