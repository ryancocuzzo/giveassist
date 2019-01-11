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


     validateEmail = (email) => {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
      }


    myColor = (position) => {
     if (this.state.plan === position) {
       return "#e6ffe6";
     }
     return "";
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

  render() {

    var fontSize = '20px';
    var col_width_wide = '150px';
    var bottomMargin = '400px';
    var leftMargin = '40px';
    var topMargin = 32;

    if (this.state.width < 700) {
      fontSize = '17px';
      col_width_wide = '100px';
      bottomMargin = '200px';
      leftMargin = '35px';
    }

    if (this.state.width < 500) {
      fontSize = '14px';
      col_width_wide = '80px';
      leftMargin = '30px';
      topMargin = topMargin+=3;
    }

    return (
          <div style={{  borderRadius: '7px', fontSize: '12px'}} className='myGradientBackground'>
            <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div>

            <Popup />

          <h1 style={{marginLeft: '20px', fontSize: '40px'}}>LOGIN</h1><br/>


          <div className='adjacentItemsParent' style={{color: 'black', fontWeight: '700'}}>
            <h3 style={{marginLeft: leftMargin,fontSize: fontSize, width: col_width_wide, marginTop: (topMargin)+'px'}} className='fixedAdjacentChild'>EMAIL</h3><br/>
            <InputGroup className="mb-3" style={{marginTop:"15px"}} className='flexibleAdjacentChild'
              >
                  <FormControl
                    aria-label="Default"
                    aria-describedby="inputGroup-sizing-default"
                    value = {this.state.email}
                    onChange={(event)=>{
                                this.setState({
                                   email:event.target.value
                                });
                             }}
                    style={{width: '250px', backgroundColor: '#f4fbff', color: 'black', boxShadow: '4px 4px 4px grey', borderRadius: '5px'}}
                  />
                </InputGroup>
            <br />
          </div>


            <div className='adjacentItemsParent' style={{color: 'black', fontWeight: '700'}}>
              <h3 style={{marginLeft: leftMargin,fontSize: fontSize, width: col_width_wide, marginTop: (topMargin)+'px'}} className='fixedAdjacentChild'>PASSWORD</h3><br/>
              <InputGroup className="mb-3" style={{marginTop:"15px"}} className='flexibleAdjacentChild'
                >
                    <FormControl
                      placeholder='Min. length of 6 characters'
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      value = {this.state.password}
                      onChange={(event)=>{
                                  this.setState({
                                     password:event.target.value
                                  });
                               }}
                      style={{width: '250px', backgroundColor: '#f4fbff', color: 'black', boxShadow: '4px 4px 4px grey', borderRadius: '5px'}}
                    />
                  </InputGroup>
              <br />
            </div>

            <hr/>
          <button style={{marginLeft: '50px'}} onClick={() => this.login()}>LOGIN</button>
        <div style={{width: '100%', height: bottomMargin}}></div>
          </div>

    );
  }

}

export default Login;
