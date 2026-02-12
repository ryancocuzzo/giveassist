import React from 'react';
import InputForm from '../../Modules/General/Form/InputForm.jsx';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.jsx';
import styles from './Styles/styles.module.css';
import { emailField, passwordField } from '../../Modules/General/Form/FormUtils.js';
import { Link } from 'react-router-dom';
import { login } from '../../../Helper-Files/Temp-DB-Utils.js';

const inputs = [emailField, passwordField];

function handle_login(field_results) {
  const email = field_results[0].value;
  const pass = field_results[1].value;
  console.log('Attempting login with Email: ' + email);
  login(email, pass)
    .then(() => alert('Welcome!'))
    .catch(() => alert('Sorry, we could not find an account with that information!'));
}

export default class Login extends React.Component {
  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className={styles.loginContainer}>
        <div className={styles.loginLeft}>
          <div className={styles.brandSection}>
            <h2>Make a difference with every dollar</h2>
            <p>Simple, subscription-based giving that puts you in control of where your money goes.</p>
            
            <div className={styles.featureList}>
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <span className="material-icons">verified</span>
                </div>
                <span className={styles.featureText}>Vetted organizations and transparent donation tracking</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <span className="material-icons">lock</span>
                </div>
                <span className={styles.featureText}>Secure payments through trusted providers</span>
              </div>
              
              <div className={styles.featureItem}>
                <div className={styles.featureIcon}>
                  <span className="material-icons">insights</span>
                </div>
                <span className={styles.featureText}>Clear analytics on your giving impact</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={styles.loginRight}>
          <div className={styles.loginCard}>
            <h1>Welcome back</h1>
            <p className={styles.subtitle}>Sign in to your account to continue making an impact</p>
            
            <div className={styles.loginForm}>
              <InputForm 
                fields={inputs} 
                submit={handle_login} 
                submitText="Sign in" 
                customErrorText="Please enter valid login credentials." 
                isSequential={true} 
                notSubmittable={false} 
              />
            </div>
            
            <div className={styles.signupLink}>
              Don't have an account? <Link to="/signup">Sign up</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
