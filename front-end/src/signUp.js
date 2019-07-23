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
import imgs from './ImgFactory.js';
import { _signUpUser } from './User.js';
let urls = variables.local_urls;
let server_urls = variables.server_urls;
let stripe_api_key = variables.stripe_api_key;



String.prototype.replaceAll = function(search, replacement) {
  var target = this;
  return target.split(search).join(replacement);
};




var strong_pass_regex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})"
);
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

const phone_regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;

class SignUp extends Component {

  constructor(props) {
      super(props);
      this.state = {
        name: props.name || '',
        email: props.email || '',
        plan: props.plan || '',
        password: props.password || '',
        phone: props.phone || '',
        name_good: props.name_good || false,
        email_good: props.email_good || false,
        pass_good: props.pass_good || false,
        phone_good: props.phone_good || false,
        selected_option: props.selected_option || false,
        custom_plan_amt: 0,

        displayName: this.makeid(),
        width: props.clientWidth || document.body.clientWidth
      };



  }

  nameSubmitted = value => {
    this.setState({ name_good: true, name: value });
    // alert(this.state.email);
    let emailIsOk = this.state.email != null && this.validateEmail(this.state.email);
    if (emailIsOk) {
      this.emailSubmitted(this.state.email);
    }
  };

  emailSubmitted = value => {
    // alert('em');
    this.setState({ email_good: true, email: value });
  };

  passSubmitted = value => {
    // alert('pass');

    this.setState({ pass_good: true, password: value });
  };

  phoneSubmitted = value => {
    // alert('phone');

    this.setState({ phone_good: true, password: value });
  };

  customPlanSubmitted = (id, value) => {
    this.setState({ custom_plan_amt: value });
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
    var length = 5;
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
    return re.test(String(phone));
}

extractPhoneNumber = (uncleaned) => {
  var cleaned = String(uncleaned).replaceAll('(','').replaceAll(')','').replaceAll('+','').replaceAll('-','');
  return cleaned;
}

formIsValid = () => {

  // Validate each property
  let nameIsOk = this.state.name != null && this.state.name != '' && this.state.name.length > 4;
  let emailIsOk = this.state.email != null && this.validateEmail(this.state.email);
  let planIsOk = this.state.selected_option != null && this.state.selected_option != '';
  let passIsOk = this.state.password != null && this.state.password.length >= 7;
  let phoneIsOk = this.state.phone != null && this.validatePhone(this.state.phone);
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
    Popup.alert('Please check your phone number ('+ this.state.phone+ '), it doesn\'t\n appear to be valid!')
    return false;
  } else if (!planIsOk) {
    Popup.alert('Please check your plan, it doesn\'t\n appear to be selected!')
    return false;
  }
  return true;
}

signUpUser = async (paymentTokenId) => {
  console.log('Signing up user');
  //Validate form
  if (this.formIsValid()) {

      let amountPaid = this.state.selected_option == 'Premium X' ? 4.99 : this.state.selected_option == 'Premium Y' ? 2.99 : this.state.custom_plan_amt;

      _signUpUser(paymentTokenId, this.state.name, this.state.email, this.state.password, this.state.phone, this.state.displayName, this.state.selected_option, amountPaid)
      .then(function(signUp_response) {

        console.log('Got Signup response: ' + JSON.stringify(signUp_response));

        // document.location.reload(true);

        // alert(signUp_response);

        // Done!

        this.setState({user:signUp_response.user});

        window.history.pushState(null, '', '/vote')
        this.scrollToTop();
        Popup.alert('Welcome to the future of donation..');

      }.bind(this)).catch(function(error)  {
        if (error != null && error != 'undefined')
            Popup.alert('It seems we couldn\'t process your request! Here\'s why: ' + error);

      }.bind(this))
  }

}

handleValChange = (id, val) => {
  if (id == 1) { // name
    this.setState({name: val});
  } else if (id == 2) { // email
    this.setState({email: val});
    this.emailSubmitted(val);
  }else if (id == 3) { // pass
    this.setState({password: val});
    this.passSubmitted(val);
  }else if (id == 4) { // phone
    this.setState({phone: val});
    this.phoneSubmitted(val);
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
        name="name"
        handleSubmit={this.nameSubmitted}
        handleVal={this.handleValChange}
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
        name="email"
        regex={email_regex}
        handleSubmit={this.emailSubmitted}
        type="email"
        handleVal={this.handleValChange}
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
        name='organization'
        type='password'
        handleSubmit={this.passSubmitted}
        handleVal={this.handleValChange}
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
        name='tel'
        type="tel"
        handleVal={this.handleValChange}

      />
    );
  };

  var num_regex = /[0-9]*/;



  var a = this.state.selected_option == "Premium X";
  var b = this.state.selected_option == "Premium Y";
  var c = this.state.selected_option == "Premium Z";

  var isMobile = this.state.width <= 1000;
  var isSuperMobile = this.state.width <= 550;

  var custom_component = () => {
    return (

        <div style={{marginLeft: isMobile ? '2%' : '5%', width: isSuperMobile ? '80%' : '90%'}}>

            <MyInput
              id={5}
              label="Custom Amount"
              locked={false}
              active={false}
              regex={num_regex}
              type="number"
              name='organization'
              handleSubmit={this.customPlanSubmitted}
              handleVal={this.customPlanSubmitted}
              minLength={1}
              maxWidth="95%"
              fontSize='25px'

            />
          </div>

    );
  };


  var options = (isMobile ?

  <div>
    <PayPlanOption
    title="Premium X"
    cost={4.99}
    description="Hello!!"
    callback={this.option_selected}
    isSelected={a}
  />
    <PayPlanOption
    title="Premium Y"
    cost={2.99}
    description="Hello!!"
    callback={this.option_selected}
    isSelected={b}
  />
    <PayPlanOption
    title="Premium Z"
    description="Combining effectiveness and affordability this is is an exceptional, change-making selection for that yields definitive results."
    callback={this.option_selected}
    isSelected={c}
    customIn={custom_component()} />
  </div>  :

    <table>
            <tr>
              <td style={{width: '33%'}}>
              <PayPlanOption
              title="Premium X"
              cost={4.99}
              description="Hello!!"
              callback={this.option_selected}
              isSelected={a}
            />
              </td>
              <td style={{width: '33%'}}>
              <PayPlanOption
              title="Premium Y"
              cost={2.99}
              description="Hello!!"
              callback={this.option_selected}
              isSelected={b}
              />
              </td>
              <td  style={{width: '33%'}}>
              <PayPlanOption
                title="Premium Z"
                description="Combining effectiveness and affordability this is is an exceptional, change-making selection for that yields definitive results."
                callback={this.option_selected}
                isSelected={c}
                customIn={custom_component()}
                />
              </td>
            </tr>
          </table>
  )



  return (
    <div style={{ fontSize: '12px', paddingLeft: '5%', paddingRight: '5%'}} className='myGradientBackground'>
    {/* <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div> */}

      <Popup />
        <div style={{textAlign: 'center'}}>
          <Link to={urls.home} style={{fontSize: '22px', fontWeight: 'bold', height: '40px'}}>
            <img src={imgs.home} height="100px" style={{height: '100px', width: '100px', marginTop: '16px', marginBottom: '20px', marginTop: '20px', borderRadius: '5px'}}></img>
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

      {options}

     <br/>

   <StripeProvider apiKey={stripe_api_key}>
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
