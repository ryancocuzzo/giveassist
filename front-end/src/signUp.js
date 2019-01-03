import React, { Component } from 'react';
import { Button, Row, Col, InputGroup, FormControl, MenuItem, ButtonToolbar,  Dropdown, ToggleButtonGroup, ToggleButton, DropdownButton } from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import firebase, { auth, provider } from './firebase.js';
import './App.css';
import variables from './variables.js';
import Datetime from 'react-datetime';
import {Elements, StripeProvider} from 'react-stripe-elements';
import CheckoutForm from './CheckoutForm';
import PaymentRequestForm from './PaymentRequestForm';
import axios from 'axios';
import Popup from 'react-popup';
import moment from 'moment';

let urls = variables.local_urls;
let server_urls = variables.server_urls;


// class RyanForm extends React.Component {
//
//     constructor(props) {
//         super(props);
//         this.state = {
//             url: ''
//         };
//     }
//
//   send() {
//     const method = "POST";
//     const body = new FormData(this.form);
//
//     console.log('sending info: ' + JSON.stringify(body));
//     axios.post(URLs.imgUpload, body, { headers: { 'Content-Type': 'multipart/form-data' } })
//     .then((response) => {
//         console.log(response.data)
//         console.log(JSON.stringify(response.data))
//       alert(response.data)
//
//     })
//    fetch(URLs.imgUpload, { method, body })
//      .then(res => res.json())
//      .then(data => alert(JSON.stringify(data, null, "\t")));
//   }
//   render() {
//     return (
//       <div>
//         <form ref={el => (this.form = el)}>
//           <label>file:</label>
//           <input type="file" name="im-a-file" />
//         </form>
//         <button onClick={() => this.send()}>Send to Server</button>
//       </div>
//     );
//   }
// }

class SignUp extends Component {

  constructor(props) {
      super(props);
      this.state = {
        name: '',
        email: '',
        dob: '',
        unformatted_dob: '',
        gender: '',
        picture: '',
        plan: '',
        password: '',
        activeButton: null,
        hover1: false,
        hover2: false,
        hover3: false,
      };

      this.selectedPlan = this.selectedPlan.bind(this);
      this.selectedGender = this.selectedGender.bind(this);
  }

  selectedGender = (gender) => {
    console.log(gender)
    if (gender != null && gender != '') {
      if (gender != 'Rather not choose') {
        console.log('Setting gender to ' + gender);
        this.setState({gender: gender})
      }
      else {
        this.setState({gender: 'Preferred not to respond'})
      }
    }

  }

  selectedPlan = (plan) => {
    console.log(plan)
    this.setState({plan: plan});

    if (this.state.activeButton === plan) {
      console.log('Setting AB to null');
      this.setState({activeButton : null})
    } else {
      this.setState({activeButton : plan})
    }
    console.log(this.state.activeButton);
  }

  handleChange = (value, formattedValue) => {
      this.setState({
        unformatted_dob: value, // ISO String, ex: "2016-11-19T12:00:00.000Z"
        dob: formattedValue, // Formatted String, ex: "11/19/2016"
      });
  }


   validateEmail = (email) => {
      var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(String(email).toLowerCase());
  }

  formIsValid = () => {
    // Validate each property
    let nameIsOk = this.state.name != null && this.state.name != '';
    let emailIsOk = this.state.email != null && this.validateEmail(this.state.email);
    let dobIsOk = this.state.dob != null && this.state.dob != '';
    let genderIsOk = this.state.gender != null && this.state.gender != '';
    let planIsOk = this.state.plan != null && this.state.plan != '';
    let passIsOk = this.state.password != null && this.state.password.length > 6;

    if (nameIsOk && emailIsOk && dobIsOk && genderIsOk && planIsOk)
      return true;
    else
      return false;
  }

  signUpUser = async (tokenId) => {
    console.log('Signing up user');
    // Validate form
    if (this.formIsValid()) {


      // All fields cleared
      var userJson = {
        name: this.state.name,
        email: this.state.email,
        dob: this.state.dob,
        gender: this.state.gender,
        plan: this.state.plan,
        joined: moment().format('LL')
      };

      let createUser = await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
      var user = await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
      user = user.user;
      this.setState({user:user});
      // Set user info
      firebase.database().ref('/users/'+(user.uid)+'/info/').set(userJson);
      firebase.database().ref('/users/' + user.uid + '/donation_stats/total_donated').set(0);

      var idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
      var paymentToken = tokenId;
      var plan = this.state.plan;

      axios.get(server_urls.createStripeUser, {params: {
        idToken: idToken,
        paymentToken: paymentToken,
        plan: plan
      }}).then(function(customer_id) {

        axios.get(server_urls.initPayments, {params: {
          idToken: idToken,
          plan: plan
        }}).then(function(subscription) {
          // Save subscription
          // firebase.database().ref('/users/' + user.uid + '/subscription/').set(subscription);
          window.history.pushState(null, '', '/vote')

        }).catch(function(err) {
            // alert('Initialize payments error: ' + err);
        })

      }).catch(function(err) {
        alert('Create Stripe error: ' + err);
      })

    } else {
      alert('Form not valid!')
    }



    // Set user picture
    await this.uploadPicture()


    this.props.popup('Welcome to the future of donation..');


  }


  datePicked = (current) => {
    // console.log(current);
    this.setState({dob: current.format('LL')})

    // if (moment(current).isValid()) {
    //   console.log('Valid');
    // } else {
    //   this.setState({dob: ''})
    //
    // }
  }

  myColor = (position) => {
   if (this.state.plan === position) {
     return "#e6ffe6";
   }
   return "";
 }

 toggle = (position) => {
    if (this.state.activeButton === position) {
      console.log('Setting AB to null');
      this.setState({activeButton : null})
    } else {
      this.setState({activeButton : position})
    }
  }

  profilePictureSelected = (files) => {
    console.log('State picture now: ' + files[0]);
    this.setState({
      picture: files[0]
    });

  }

  uploadPicture = () => {
    if (this.state.picture && this.state.picture != '') {
      const body = this.state.picture;
      console.log(body);
      // Get current username
      var user = firebase.auth().currentUser.uid;

      let str = '' + user + '/profilePicture/' + body.name;


        // Create a Storage Ref w/ username
        var storageRef = firebase.storage().ref().child(str);
        console.log('Attempting to put image into ref ' + storageRef);
        // Upload file
        var task = storageRef.put(body);
        storageRef.put(body).then(function(snapshot) {
          console.log('Uploaded a blob or file!');
        }).catch(function(e) {
          console.log(e);
        });

            // Post profile picture to database
           firebase.database().ref('/users/' + user + '/images/profilePicture').set(body.name);

    }

  }


  toggleHover(id) {
    console.log('Hovering ' + id);
    let s = 'hover' + id;
    var b = !this.state[s];
    this.setState({[s]: b})
    console.log('setting hover' + id + ' to ' + b);
  }



  render () {
    var min = Datetime.moment().subtract( 16, 'year' );
    var valid = function( current ){
        return current.isBefore( min );
    };
    console.log('AB: ' + this.state.activeButton);

    var c1 = (this.state.hover1) ? '#e6ffe6' : '';
    var c2 = (this.state.hover2) ? '#e6ffe6' : '';
    var c3 = (this.state.hover3) ? '#e6ffe6' : '';
    if (this.state.plan === 'Premium X') {
      c1 = '#e6ffe6';
    } else if (this.state.plan === 'Premium Y') {
      c2 = '#e6ffe6';
    }  else if (this.state.plan === 'Premium Z') {
      c3 = '#e6ffe6';
    }
    return (

      <div style={{ backgroundColor: 'rgba(122, 198, 105, 0)', borderRadius: '7px', fontSize: '12px'}}>
        <Popup />

        <h1 style={{marginLeft: '20px', fontSize: '40px'}}>Join</h1><br/>

        <div className='adjacentItemsParent'>
          <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>NAME</h1><br/>
          <InputGroup className="mb-3" style={{marginTop:"15px"}} className='flexibleAdjacentChild'
>
                <FormControl
                  aria-label="Default"
                  aria-describedby="inputGroup-sizing-default"
                  value = {this.state.name}
                  onChange={(event)=>{
                              this.setState({
                                 name:event.target.value
                              });
                           }}
                  style={{width: '250px'}}
                />
              </InputGroup>
          <br />
        </div>

        <div className='adjacentItemsParent'>
          <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>EMAIL</h1><br/>
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
                  style={{width: '250px'}}
                />
              </InputGroup>
          <br />
          </div>


          <div className='adjacentItemsParent'>
            <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>PASSWORD</h1><br/>
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
                    style={{width: '250px'}}
                  />
                </InputGroup>
            <br />
          </div>

        <div className='adjacentItemsParent'>
          <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>DOB</h1><br/>
        <Datetime isValidDate={ valid } onChange={this.datePicked} timeFormat={false} inputProps={{ placeholder: 'Please select your DOB', readonly: 'true',  style: {width: '250px', marginTop: '15px', textAlign: 'center'}}}/>
          <br />
        </div>
        <div className='adjacentItemsParent'>
          <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>GENDER</h1><br/>
          <ButtonToolbar className='flexibleAdjacentChild' style={{marginTop:"13px", width: '200px'}}>
                <DropdownButton
                  drop='right'
                  variant="secondary"
                  title={(this.state.gender != '' ? this.state.gender : 'Please select your gender.')}
                  key='gender'
                  value={this.state.gender}
                  style={{width: '250px'}}
                >
                  <MenuItem eventKey="Male" onClick={this.selectedGender.bind(this, "Male")}>Male</MenuItem>
                  <MenuItem eventKey="Female" onClick={this.selectedGender.bind(this, "Female")}>Female</MenuItem>
                  <MenuItem eventKey="Other" onClick={this.selectedGender.bind(this, "Other")}>Other</MenuItem>
                  <MenuItem eventKey="Rather not choose" onClick={this.selectedGender.bind(this, "Rather not choose")}>Rather not choose</MenuItem>
                </DropdownButton>
            </ButtonToolbar>
          <br />
        </div>


        <div >
          <form ref={el => (this.form = el)} className='adjacentItemsParent'>
            <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>PICTURE</h1><br/>
          <input style={{marginTop: '20px', backgroundColor: 'transparent', boxShadow: '0px'}} type="file" name="im-a-file" onChange={ (e) => this.profilePictureSelected(e.target.files) } />
          </form>
        </div>


        <h1 style={{marginLeft: '50px', fontSize: '20px'}}>SELECT YOUR PLAN</h1><br/>

        <ButtonToolbar>
           <ToggleButtonGroup type="radio" defaultValue='Premium Pro' name="toggle plan" style={{marginLeft: '2%', alignContent: 'center'}}>
               <ToggleButton value='Premium X' onClick={() => this.selectedPlan('Premium X')} onMouseEnter={() => this.toggleHover(1)} onMouseLeave={() => this.toggleHover(1)} style={{background: c1,  whiteSpace: 'normal', maxWidth: '33%'}}><h1>Premium X</h1><br/><p>This will be a description of the Premium X plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
             <ToggleButton value='Premium Y' onClick={() => this.selectedPlan('Premium Y')} onMouseEnter={() => this.toggleHover(2)} onMouseLeave={() => this.toggleHover(2)} style={{background: c2,   whiteSpace: 'normal', maxWidth: '33%'}}><h1>Premium Y</h1><br/><p>This will be a description of the Premium Y plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
           <ToggleButton value='Premium Z' onClick={() => this.selectedPlan('Premium Z')} onMouseEnter={() => this.toggleHover(3)} onMouseLeave={() => this.toggleHover(3)} style={{background: c3,   whiteSpace: 'normal', maxWidth: '33%'}}><h1>Premium Z</h1><br/><p>This will be a description of the Premium Z plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
           </ToggleButtonGroup>
       </ButtonToolbar>

       <br/>

       <StripeProvider apiKey="pk_test_eDgW1qWOGdRdCnIQocPje0Gg">
         <div className="example" style={{marginLeft: '20px'}} >
           <h1>Payment Information</h1>
           <Elements>
             <CheckoutForm onSignUp={this.signUpUser} />
           </Elements>
         </div>
     </StripeProvider>

      </div>
    );
  }


}

export default SignUp;
