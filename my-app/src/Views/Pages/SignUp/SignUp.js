import React from 'react';
import InputForm from '../../Modules/General/Form/InputForm.js';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';
import OptionSelection from '../../Modules/App/UserInfo/PayAndPlanSelect.js';
import styles from './Styles/styles.module.css';
import { Link, withRouter} from 'react-router-dom';
import {pr, validateName, validateEmail, validatePhone, emailField, passwordField, phoneField, nameField} from '../../../Views-Test-Files/Test-Data/Data.js';

let inputs = [ nameField, emailField, passwordField, phoneField ];

let OptionSelect = <OptionSelection onSubmitPlan={pr} PayAndPlanSelect={pr} payInfoText="Payment Info" planSelectText="Select Plan" notSubmittable={true}/>;

let CombinedComponents = (
    <div style={{backgroundColor: 'whitesmoke', padding: '10px', margin: '10px', borderRadius: '10px'}}>
        <h1>Sign Up</h1>
        <br/>
        <InputForm fields={inputs} submit={pr} isSequential={true} notSubmittable={true}/>
        <br/>
        {OptionSelect}
        <button class="submit">Sign Up</button>
    <h4 style={{textAlign: 'center',  marginTop: '15px'}}>Already a user? <Link to="/login" ><a> Login Here</a></Link></h4>
        <br/>
    </div>
)

/* Sign Up Component */

export default class SignUp extends React.Component {

    componentDidMount() {
        window.scrollTo(0, 0);
    }

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
