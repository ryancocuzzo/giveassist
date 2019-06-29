import React from 'react';
import { Button, Row, Col, InputGroup, FormControl, MenuItem, ButtonToolbar,  Dropdown, ToggleButtonGroup, ToggleButton, DropdownButton } from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import variables from './variables.js';
import Datetime from 'react-datetime';
import {Elements, StripeProvider} from 'react-stripe-elements';
import CheckoutForm from './CheckoutForm';
import PaymentRequestForm from './PaymentRequestForm';
import axios from 'axios';
import Popup from 'react-popup';
import moment from 'moment';
import firebase, { auth, provider } from './firebase.js';
import * as util from 'util' // has no default export
import { inspect } from 'util' // or directly
import {eventSnapshot, userVotes, getActiveEventId, votersFor, createEvent, getOptions, genKey, castVote, getUserInfo} from './Database.js';
import MyInput from './MyInput.js';
let urls = variables.local_urls;

const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;



class Login extends React.Component {

  constructor(props) {
    super(props);

    var user = firebase.auth().currentUser;


    this.state = {
      user: user,
      email: '',
      password: '',
      width: document.body.clientWidth
    };

    window.history.pushState(null, '', '/login')

  }

    componentDidMount() {
      window.addEventListener("resize", function(event) {
        console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
        this.setState({width: document.body.clientWidth});
      }.bind(this))

    }

    emailSubmitted = value => {
      this.setState({ email_good: true, email: value });
      // alert("Email submitted w/ value: " + value);
    };

    passSubmitted = value => {
      this.setState({ pass_good: true, password: value });
      // alert("Password submitted w/ value: " + value);
    };


     validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }



   login = async () => {
     let email = this.state.email;
     let password = this.state.password;
     if (email && this.validateEmail(email)) {
       if (password != null && password != '') {
         try {
           var user = await firebase.auth().signInWithEmailAndPassword(email, password);
           Popup.alert('Welcome back!');
         } catch (e) {
           Popup.alert(e.message);
         }
       } else {
         Popup.alert('Invalid password!')
       }
     } else {
       Popup.alert('Invalid email!')
     }
   }

   sendPasswordReset = (email) => {
     if (this.validateEmail(email))  {
       firebase.auth().sendPasswordResetEmail(email);
       Popup.alert('Sent!');
     } else {
       Popup.alert('Please enter a valid email!');
     }
   }

  render() {

    var email_component = () => {
      return (
        <MyInput
          id={1}
          label="Email"
          locked={false}
          active={false}
          regex={email_regex}
          handleSubmit={this.emailSubmitted}
        />
      );
    };

    var pass_component = () => {
      return (
        <MyInput
          id={2}
          label="Password"
          locked={!this.state.email_good}
          active={false}
          minLength={7}
          handleSubmit={this.passSubmitted}
          type={'password'}
        />
      );
    };

    return (
          <div style={{  borderRadius: '7px', fontSize: '12px', paddingLeft: '20%', paddingRight: '20%'}} className='myGradientBackground'>
            <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div>

            <Popup />
              <div style={{textAlign: 'center'}}>
                <Link to={urls.home} style={{fontSize: '22px', fontWeight: 'bold', height: '40px'}}>
                  <button style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: '0%', width: '100px', backgroundColor: 'transparent'}} > HOME </button>
                </Link><br></br>
            </div>

<br/>

          <h1 style={{marginLeft: '20px', fontSize: '40px'}}>LOGIN</h1><br/>

          {email_component()}
          <br />
        {pass_component()}
          <br />

            <hr/>
            <button style={{marginLeft: '50px'}} onClick={() => this.login()}>LOGIN</button>
          <button style={{marginLeft: '50px'}} onClick={() => this.sendPasswordReset(this.state.email)}>FORGOT MY PASSWORD</button>
          <br/>


          <br/><br/><br/>
            <div style={{textAlign: 'center'}}>
              <button onClick={() => window.open('https://goo.gl/forms/y8JTxQyvn8LI9NWN2', "_blank")} >REPORT BUG</button>
                <br/><br/><br/>

            </div>
        <div style={{width: '100%', height: '300px'}}></div>
          </div>

    );
  }

}

export default Login;
