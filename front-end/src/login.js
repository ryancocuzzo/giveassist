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
    };

    window.history.pushState(null, '', '/login')

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

    return (
      <Row>
        <Col>
          <div style={{ backgroundColor: 'rgba(122, 198, 105, 0)', borderRadius: '7px', fontSize: '12px'}}>
            <Popup />

          <h1 style={{marginLeft: '20px', fontSize: '40px'}}>LOGIN</h1><br/>


              <div className='adjacentItemsParent'>
                <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>EMAIL</h1><br/>
                <InputGroup className="mb-3" style={{marginTop:"15px"}} className='fixedAdjacentChild2'
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
                        className='fixedAdjacentChild2'

                      />
                    </InputGroup>

                <br />
              </div>

              <div className='adjacentItemsParent'>
                <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>PASSWORD</h1><br/>
                <InputGroup className="mb-3" style={{marginTop:"15px"}} className='fixedAdjacentChild2'
                  >
                      <FormControl
                        type='password'
                        aria-label="Default"
                        aria-describedby="inputGroup-sizing-default"
                        value = {this.state.password}
                        onChange={(event)=>{
                                    this.setState({
                                       password:event.target.value
                                    });
                                 }}
                        className='fixedAdjacentChild2'
                      />
                    </InputGroup>

                <br />
              </div>

            <hr/>
          <button style={{marginLeft: '50px'}} onClick={() => this.login()}>LOGIN</button>

          </div>
        </Col>
      </Row>

    );
  }

}

export default Login;
