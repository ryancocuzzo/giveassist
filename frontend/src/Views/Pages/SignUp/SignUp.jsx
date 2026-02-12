import React from 'react';
import InputForm from '../../Modules/General/Form/InputForm.jsx';
import OptionSelection from '../../Modules/App/UserInfo/PayAndPlanSelect.jsx';
import { Link } from 'react-router-dom';
import { emailField, passwordField, confirmPasswordField, phoneField, nameField, extractPhoneNumber, validateMoney } from '../../Modules/General/Form/FormUtils.js';
import { signup, login } from '../../../Helper-Files/Temp-DB-Utils.js';
import { planExists, lowestPlanCost, formatPlan } from '../../../Helper-Files/variables';
import styles from './styles.module.css';

const inputs = [nameField, emailField, passwordField, confirmPasswordField, phoneField];

export default class SignUp extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      plan: null,
      token: null,
      fields: inputs,
      customAmt: 0,
      firstInvalid: 0
    };
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  planChange = (to) => this.setState({ plan: to, customAmt: 0 })
  tokenChange = (to) => this.setState({ token: to })
  fieldsChange = (to) => this.setState({ fields: to })
  customAmtChange = (to) => this.setState({ customAmt: to })
  firstInvalidFieldChange = (to) => this.setState({ firstInvalid: to })

  findFormIssue = () => {
    if (this.state.firstInvalid >= this.state.fields.length) return false;
    alert(this.state.fields[this.state.firstInvalid].title + ' is invalid!');
    return true;
  }

  findTokenIssue = () => {
    if (this.state.token !== null) return false;
    alert('Please enter valid payment information.');
    return true;
  }

  findPlanIssue = () => {
    if (this.state.plan === null || !planExists(this.state.plan)) {
      alert('Please select a plan.');
      return true;
    }
    if (planExists(this.state.plan) && this.state.plan !== 'PZ') return false;

    const parsed_amt = parseFloat(this.state.customAmt);
    const inv_type = !this.state.customAmt || isNaN(parsed_amt);
    const tooLow = parsed_amt < lowestPlanCost();
    const valid_custom_amt = validateMoney(parsed_amt, lowestPlanCost());

    if (!inv_type && valid_custom_amt) return false;

    if (inv_type) alert('Please enter a valid custom plan amount.');
    else if (tooLow) alert('Please enter a custom plan amount higher than $2.99.');
    else alert('A custom plan must be a whole number in USD.');

    return true;
  }

  handle_signup = async () => {
    if (this.findFormIssue()) return;
    if (this.findTokenIssue()) return;
    if (this.findPlanIssue()) return;

    const name = this.state.fields[0].value;
    const email = this.state.fields[1].value;
    const pass = this.state.fields[2].value;
    const phone = extractPhoneNumber(this.state.fields[4].value);
    const token = this.state.token;
    const c_amt = this.state.customAmt;
    const plan = formatPlan(this.state.plan, c_amt);

    console.log('Attempting signup with Name: ' + name + ', Email: ' + email + ', Plan: ' + plan);

    try {
      await signup(name, email, pass, phone, plan, token);
    } catch (e) {
      alert('Sorry, we could not create your account at this time!');
      return;
    }

    try {
      await login(email, pass);
    } catch (e) {
      alert('You\'re all set! Please log in to continue!');
      return;
    }

    alert('Welcome!');
  }

  render() {
    const OptionSelect = (
      <OptionSelection
        onTokenChange={this.tokenChange}
        customAmountChanged={this.customAmtChange}
        planChanged={this.planChange}
        payInfoText="Payment Info"
        planSelectText="Select Plan"
        notSubmittable={true}
      />
    );

    return (
      <div className={styles.signupContainer}>
        <div className={styles.signupLeft}>
          <div className={styles.brandSection}>
            <h2>Start making <span className={styles.highlight}>real impact</span> today</h2>
            <p>A simple, affordable way to give back. Vote on causes monthly and track where your contributions go.</p>
            
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <div className={styles.statNumber}>Monthly</div>
                <div className={styles.statLabel}>Curated causes</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statNumber}>$2.99</div>
                <div className={styles.statLabel}>Starting price</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statNumber}>99.5%</div>
                <div className={styles.statLabel}>Goes to causes</div>
              </div>
              
              <div className={styles.statCard}>
                <div className={styles.statNumber}>Easy</div>
                <div className={styles.statLabel}>Cancel anytime</div>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.signupRight}>
          <div className={styles.signupCard}>
            <h1>Create your account</h1>
            <p className={styles.subtitle}>Get started with GiveAssist in just a few minutes</p>
            
            <div className={styles.signupForm}>
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>
                  <span className={styles.stepNumber}>1</span>
                  Personal Information
                </div>
                <InputForm
                  fields={inputs}
                  firstInvalidIndexUpdated={this.firstInvalidFieldChange}
                  fieldsChanged={this.fieldsChange}
                  isSequential={true}
                  notSubmittable={true}
                  confirmFields={[{ index: 3, confirmWithIndex: 2 }]}
                />
              </div>
              
              <div className={styles.formSection}>
                <div className={styles.sectionTitle}>
                  <span className={styles.stepNumber}>2</span>
                  Choose Your Plan
                </div>
                {OptionSelect}
              </div>
              
              <button className="submit" onClick={this.handle_signup}>
                Create Account
              </button>
            </div>
            
            <div className={styles.trustBadges}>
              <div className={styles.trustBadge}>
                <span className="material-icons">verified_user</span>
                <span>Secure payments</span>
              </div>
              <div className={styles.trustBadge}>
                <span className="material-icons">visibility</span>
                <span>100% transparent</span>
              </div>
            </div>
            
            <div className={styles.loginLink}>
              Already have an account? <Link to="/login">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
