import React, { Component } from 'react';
import { Button, Row, Col, InputGroup, FormControl, MenuItem, ButtonToolbar,  Dropdown, ToggleButtonGroup, ToggleButton, DropdownButton } from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import firebase, { auth, provider } from './firebase.js';
import './App.css';
import variables from './variables.js';
import Datetime from 'react-datetime';
import {Elements, StripeProvider} from 'react-stripe-elements';
import CheckoutForm from './CheckoutForm';
import axios from 'axios';
import Popup from 'react-popup';
import moment from 'moment';
import grad from './GradientSVG.js';
import PayPlanOption from "./PayPlanOption";
import MyInput from './MyInput.js';

let urls = variables.local_urls;
let server_urls = variables.server_urls;

var strong_pass_regex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})"
);
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const phone_regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

class SignUp extends Component {

  constructor(props) {
      super(props);
      this.state = {
        name: '',
        email: '',
        plan: '',
        password: '',
        phone: '',
        name_good: false,
        email_good: false,
        pass_good: false,
        phone_good: false,
        selected_option: false,

        displayName: this.makeid(),
        width: document.body.clientWidth
      };

  }


  nameSubmitted = value => {
    this.setState({ name_good: true, name: value });
  };

  emailSubmitted = value => {
    this.setState({ email_good: true, email: value });
  };

  passSubmitted = value => {
    this.setState({ pass_good: true, password: value });
  };

  phoneSubmitted = value => {
    this.setState({ phone_good: true, password: value });
  };

  option_selected = title => {
    this.state.selected_option = title;
    this.setState({ selected_option: title });
    this.forceUpdate();
  };

  getComp = (title, c, desc, sel) => {
    return (
      <PayPlanOption
        title={title}
        cost={c}
        description={desc}
        callback={this.option_selected}
        isSelected={sel}
      />
    );
  };

  componentDidMount() {
    window.addEventListener("resize", function(event) {
      // console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
      this.setState({width: document.body.clientWidth});
    }.bind(this))

  }

  scrollToTop = () => {
      window.scrollTo({
          top:0,
          behavior: "smooth" // optional
      });
  };

   makeid = () => {
    var length = 15;
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
       result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
 }

 validateEmail = (email) => {
   var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
   return re.test(String(email).toLowerCase());
}

validatePhone = (phone) => {
    var re = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return phone.test(String(phone));
}

extractPhoneNumber = (uncleaned) => {
    var cleaned = uncleaned.replace('(','').replace(')','').replace('+','').replace('-','');
    return cleaned;
}



  formIsValid = () => {

    // Validate each property
    let nameIsOk = this.state.name != null && this.state.name != '' && this.state.name.length > 4;
    let emailIsOk = this.state.email != null && this.validateEmail(this.state.email);
    let planIsOk = this.state.selected_option != null && this.state.selected_option != '';
    let passIsOk = this.state.password != null && this.state.password.length >= 7;
    let phoneIsOk = this.state.phoneIsOk != null && this.validatePhone(this.state.phone);
    if (!nameIsOk)  {
      Popup.alert('Please check your name, it doesn\'t\n appear to be valid!')
      return false;
    }  else if (!emailIsOk) {
      Popup.alert('Please check your email, it doesn\'t\n appear to be valid!');
      return false;
    }  else if (!passIsOk) {
      Popup.alert('Please check your password, it doesn\'t\n appear to be valid!')
      return false;
    } else if (!phoneIsOk) {
      Popup.alert('Please check your phone number, it doesn\'t\n appear to be valid!')
      return false;
    } else if (!planIsOk) {
      Popup.alert('Please check your plan, it doesn\'t\n appear to be selected!')
      return false;
    }
    return true;
  }

  signUpUser = async (tokenId) => {
    console.log('Signing up user');
    // Validate form
    if (this.formIsValid()) {
      try {

        // All fields cleared
        var userJson = {
          n: this.state.name,                             // name
          e: this.state.email,                            // email
          p: this.state.selected_option,                  // plan
          dn: this.state.displayName,                     // display naem
          j: moment().format('LL'),                       // timestamp
          z: this.extractPhoneNumber(this.state.phone)    // phone number
        };

        var userQueriableJSON = {
          dn: this.state.displayName,
          p: this.state.selected_option
        };

        let createUser = await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
        console.log('Hey devs, was able to create user!');
        var user = await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
        console.log('Hey devs, was able to log in user!');
        user = user.user;
        this.setState({user:user});
        this.scrollToTop();
        // Set user info
        firebase.database().ref('/users/'+(user.uid)+'/i/').set(userJson);
        console.log('Hey devs, was able to set i!');
        firebase.database().ref('/queriable/'+(user.uid)+'/dn').set(userQueriableJSON.dn);
        console.log('Hey devs, was able to set dn!');
        firebase.database().ref('/users/' + user.uid + '/d/t').set(0);
        console.log('Hey devs, was able to set d/t!');

        axios.get(server_urls.createStripeUser, {params: { uid: user.uid }});


        var idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);


        var paymentToken = tokenId;
        var plan = this.state.selected_option;

        axios.get(server_urls.createStripeUser, {params: {
          idToken: idToken,
          paymentToken: paymentToken,
          plan: plan
        }}).then(async function(customer_id) {

          axios.get(server_urls.initPayments, {params: {
            idToken: idToken,
            plan: plan
          }}).then(async function(subscription) {
            // alert('good stuff..');
            // Save subscription
            // firebase.database().ref('/users/' + user.uid + '/subscription/').set(subscription);
            window.history.pushState(null, '', '/vote')

            // // Set user picture
            // await this.uploadPicture()

            this.props.popup('Welcome to the future of donation..');

          }.bind(this)).catch(function(err) {
            var user = firebase.auth().currentUser;
            // Popup.Create();
            firebase.database().ref('/users/'+(user.uid)).set(null);
            firebase.database().ref('/queriable/'+(user.uid)).set(null);
            if (user) {
              user.delete().then(function() {
                this.props.popup('Sorry, your account could not be created at this time! Please try again in a bit. (Code 7)');
                // User deleted.
              }).catch(function(error) {
                // An error happened.
                // this.props.popup('Sorry, your account could not be created at this time! Please try again in a bit. (Code 8)');
              });
            }
          }.bind(this))

          // this.props.popup('Sorry, your account could not be created at this time! Please try again in a bit. Please note this issue appears to stem from your payment information!  (Code: 3)');


        }.bind(this)).catch(function(err) {
          var user = firebase.auth().currentUser;
          // Popup.Create();
          firebase.database().ref('/users/'+(user.uid)).set(null);
          firebase.database().ref('/queriable/'+(user.uid)).set(null);
          if (user) {
            user.delete().then(function() {
              this.props.popup('Sorry, your account could not be created at this time! Please try again in a bit.  (Code: 4) => ' + err);
              // User deleted.
            }).catch(function(error) {
              // An error happened.
              // this.props.popup('Sorry, your account could not be created at this time! Please try again in a bit.  (Code: 9)');
            });
          }
        }.bind(this))
      } catch (e) {
        Popup.alert('It seems your information is incorrect. If this issue persists, please reload the page and try again! Issue: ' + e);
        console.log('\nHey devs! Heres the error: ' + e);
        var user = firebase.auth().currentUser;
        // Popup.Create();
        firebase.database().ref('/users/'+(user.uid)).set(null);
        firebase.database().ref('/queriable/'+(user.uid)).set(null);
        if (user) {
          user.delete().then(function() {
            // this.props.popup('Sorry, your account could not be created at this time! Please try again in a bit. (Code 7)');
            // User deleted.
          }).catch(function(error) {
            // An error happened.
            // this.props.popup('Sorry, your account could not be created at this time! Please try again in a bit. (Code 8) => ' +error);
          });
        }

      }

    } else {

      Popup.alert('It seems your information is incorrect. If this issue persists, please reload the page and try again!');
    }


  }

  render () {

    var name_component = () => {
      return (
        <MyInput
          id={1}
          label="Name"
          locked={false}
          active={false}
          minLength={4}
          handleSubmit={this.nameSubmitted}
        />
      );
    };

    var email_component = () => {
      return (
        <MyInput
          id={2}
          label="Email"
          locked={!this.state.name_good}
          active={false}
          regex={email_regex}
          handleSubmit={this.emailSubmitted}
        />
      );
    };

    var pass_component = () => {
      return (
        <MyInput
          id={3}
          label="Password"
          locked={!this.state.name_good || !this.state.email_good}
          active={false}
          minLength={7}
          handleSubmit={this.passSubmitted}
        />
      );
    };

    var phone_component = () => {
      return (
        <MyInput
          id={4}
          label="Phone Number"
          locked={!this.state.name_good || !this.state.email_good || !this.state.pass_good}
          active={false}
          regex={phone_regex}
          handleSubmit={this.passSubmitted}
        />
      );
    };

    var a = this.state.selected_option == "Premium X";
    var b = this.state.selected_option == "Premium Y";
    var c = this.state.selected_option == "Premium Z";

    var isMobile = this.state.width <= 800;

    return (
      <div style={{ fontSize: '12px', paddingLeft: '12%', paddingRight: '12%'}} className='myGradientBackground'>
      <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div>

        <Popup />
          <div style={{textAlign: 'center'}}>
            <Link to={urls.home} style={{fontSize: '22px', fontWeight: 'bold', height: '40px'}}>
              <button style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: '0%', width: '100px', backgroundColor: 'transparent'}} > HOME </button>
            </Link><br></br>
        </div>

      <h1 style={{fontSize: '40px'}}>Join</h1><br/>

        {/* INSERT FIELD COMPONENTS */}

        {name_component()}
        <br />
        {email_component()}
        <br />
        {pass_component()}
        <br />
        {phone_component()}
        <br/>

        <h1 style={{}}>Select your plan.</h1><br/>

        {/* INSERT PLAN COMPONENTS */}

        <PayPlanOption
          title="Premium X"
          cost={3.99}
          description="Our premier plan. This is an elite tier for benefactors looking to make the most change."
          callback={this.option_selected}
          isSelected={a}
        />
        <PayPlanOption
          title="Premium Y"
          cost={1.99}
          description="Combining effectiveness and affordability this is is an exceptional, change-making selection for that yields definitive results."
          callback={this.option_selected}
          isSelected={b}
        />

       <br/>

       <StripeProvider apiKey="pk_test_eDgW1qWOGdRdCnIQocPje0Gg">
         <div className="example" >
           <h1>Payment Information</h1>
         <div style={{ marginLeft: '1%', marginRight: '1%', width: '98%'}} >
           <Elements >
             <CheckoutForm onSignUp={this.signUpUser} style={{width: '100%'}}/>
           </Elements>
         </div>

         </div>
     </StripeProvider>

     <br />
       <div style={{textAlign: 'center'}}>
         <button onClick={() => window.open('https://goo.gl/forms/y8JTxQyvn8LI9NWN2', "_blank")} >REPORT BUG</button>
           <br/>
             <br/>
               <br/>

       </div>
        <br />
      <br />

      </div>
    );
  }


}

export default SignUp;
