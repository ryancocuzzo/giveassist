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
    const content_style = {
      height: '100dvh',
      minHeight: '100vh',
      backgroundColor: 'var(--primary)'
    };
    const params = {
      vertCenter: true,
      horCenter: true,
      centered: true,
      particleMargin: '2px'
    };

    const CombinedComponents = (
      <div className={styles.loginCard}>
        <h1>Login</h1>
        <br />
        <InputForm fields={inputs} submit={handle_login} submitText="login" customErrorText="Please enter valid login credentials." isSequential={true} notSubmittable={false} />
        <h4 className={styles.signupLink}>Not a user? <Link to="/signup">Sign up Here</Link></h4>
        <br />
      </div>
    );

    return (
      <div className="signupContainer">
        {ParticledContent(CombinedComponents, content_style, params)}
      </div>
    );
  }
}
