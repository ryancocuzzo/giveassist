import React from 'react';
import InputForm from '../../Modules/General/Form/InputForm.js';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';
import OptionSelection from '../../Modules/App/UserInfo/PayAndPlanSelect.js';
import styles from './Styles/styles.module.css';
import { Link, withRouter} from 'react-router-dom';
import {emailField, passwordField, confirmPasswordField, phoneField, nameField, extractPhoneNumber, validateMoney
, TEST_emailField, TEST_passwordField, TEST_confirmPasswordField,
TEST_phoneField, TEST_nameField
} from '../../Modules/General/Form/FormUtils.js';
import { signup, login } from '../../../Helper-Files/Temp-DB-Utils.js';
import Popup from 'react-popup';
import {planExists, lowestPlanCost, formatPlan} from '../../../Helper-Files/variables';

let inputs = [ nameField, emailField, passwordField, confirmPasswordField, phoneField ];
// let inputs = [TEST_nameField, TEST_emailField, TEST_passwordField, TEST_confirmPasswordField,
//     TEST_phoneField ];

    /* Sign Up Component */

export default class SignUp extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            plan: null,
            token: null,
            fields: inputs,
            customAmt: 0,
            firstInvalid: 0
        }
    }
    componentDidMount() {
        window.scrollTo(0, 0);
    }

    planChange = (to) => this.setState({plan: to, customAmt: 0})
    tokenChange = (to) => this.setState({token: to})
    fieldsChange = (to) => {
        this.setState({fields: to})
    }
    customAmtChange = (to) => this.setState({customAmt: to})
    firstInvalidFieldChange = (to) => this.setState({firstInvalid: to});

    findFormIssue = () => {
        if (this.state.firstInvalid >= this.state.fields.length) return false;
            Popup.alert(this.state.fields[this.state.firstInvalid].title + ' is invalid!');
        return true;
    }

    findTokenIssue = () => {
        if (this.state.token !== null) return false;
        Popup.alert('Please enter valid payment information.');
        return true;
    }

    findPlanIssue = () => {
        if (this.state.plan === null || !planExists(this.state.plan)) {
            Popup.alert('Please select a plan.');
            return true;
        }
        if (planExists(this.state.plan) && this.state.plan !== 'PZ') return false;

        let parsed_amt = parseFloat(this.state.customAmt);
        let inv_type = !this.state.customAmt || parsed_amt === 'NaN';
        let tooLow = parsed_amt < lowestPlanCost();
        let whole = parsed_amt % 1 !== 0;
        let valid_custom_amt = validateMoney(parsed_amt,lowestPlanCost());
        if (!inv_type && valid_custom_amt) {
            return false;
        }

        if (inv_type)
            Popup.alert('Please enter a valid custom plan amount.');
        else if (tooLow)
            Popup.alert('Please enter a custom plan amount higher than $2.99.');
        else if (!whole)
            Popup.alert('A custom plan must be a whole number in USD.');

        return true;
    }

    handle_signup = async () => {
        if (this.findFormIssue()) return;
        if (this.findTokenIssue()) return;
        if (this.findPlanIssue()) return;
        let name = this.state.fields[0].value;
        let email = this.state.fields[1].value;
        let pass = this.state.fields[2].value;
        let phone = extractPhoneNumber(this.state.fields[4].value);
        let token = this.state.token;
        let c_amt = this.state.customAmt;
        let plan_unformatted = this.state.plan; /* a number */
        let plan = formatPlan(plan_unformatted, c_amt);
        console.log('attempting SignUp with \n\tName: ' + name
         + ' \n\tEmail: ' + email
         + ' \n\tPass: ' + pass
         + ' \n\tPhone: ' + phone
         + ' \n\tPlan: ' + plan
         + ' \n\tToken: ' + token
         )
        try {
            let signed_up = await signup(name, email, pass, phone, plan, token);
        } catch (e) { Popup.alert('Sorry, we could not create your account at this time!'); return; }

        try {
            let logged_in = await login(email,pass);
        } catch (e) { Popup.alert('You\'re all set! Please log in to continue!'); return; }

        Popup.alert('Welcome!');
    }


    render() {

        let OptionSelect = <OptionSelection onTokenChange={this.tokenChange} customAmountChanged={this.customAmtChange} planChanged={this.planChange} /*onSubmitPlan={pr} PayAndPlanSelect={pr} */ payInfoText="Payment Info" planSelectText="Select Plan" notSubmittable={true}/>;

        let CombinedComponents = (
            <div style={{backgroundColor: 'whitesmoke', padding: '10px', margin: '10px', borderRadius: '10px'}}>
                <h1>Sign Up</h1>
                <br/>
            <InputForm fields={inputs} firstInvalidIndexUpdated={this.firstInvalidFieldChange} /*submit={pr}*/ fieldsChanged={this.fieldsChange} isSequential={true} notSubmittable={true} confirmFields={[{index: 3, confirmWithIndex: 2}]} />
                <br/>
                {OptionSelect}
                <button class="submit" onClick={this.handle_signup}>Sign Up</button>
                <h4 style={{textAlign: 'center',  marginTop: '15px'}}>Already a user? <Link to="/login" > Login Here</Link></h4>
                <br/>
            </div>
        )

        let content_style = {
            height: '1225px',
         };
          let params = {
            vertCenter: false,
            horCenter: true,
            centered: true,
            particleMargin: '0px',
          };

        return (
            <div >
                {ParticledContent(CombinedComponents,content_style, params)}
            </div>
        )
    }
}

        // Old height code

        // let mobile = window.innerHeight < 650;

        // var isSafari, height;
        // var ua = navigator.userAgent.toLowerCase();
        // if (ua.indexOf('safari') != -1) {
        //   if (ua.indexOf('chrome') > -1) {
        //     isSafari = false; // Chrome
        //   } else {
        //     isSafari = true; // Safari
        //   }
        // }
        // // alert(mobile + " " + isSafari)
        // if (!mobile && !isSafari)
        //     height = (window.innerHeight * 1) + 'px';
        // if (mobile && !isSafari)
        //     height = (window.innerHeight * 1.4) + 'px';
        // if (mobile && isSafari)
        //     height = (window.innerHeight * 2.1) + 'px';
        // if (!mobile && isSafari)
        //     height = (window.innerHeight * 1.6) + 'px';
