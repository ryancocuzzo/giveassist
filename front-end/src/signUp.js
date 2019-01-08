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
import grad from './GradientSVG.js';

let urls = variables.local_urls;
let server_urls = variables.server_urls;

class SignUp extends Component {

  constructor(props) {
      super(props);
      this.state = {
        name: '',
        email: '',
        dob: '',
        unformatted_dob: '',
        gender: '',
        picture: null,
        plan: '',
        password: '',
        activeButton: null,
        hover1: false,
        hover2: false,
        hover3: false,
        hover4: false,

        displayName: '',
        width: document.body.clientWidth
      };

      this.selectedPlan = this.selectedPlan.bind(this);
      this.selectedGender = this.selectedGender.bind(this);
  }

  componentDidMount() {
    window.addEventListener("resize", function(event) {
      console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
      this.setState({width: document.body.clientWidth});
    }.bind(this))

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
    let passIsOk = this.state.password != null && this.state.password.length >= 6;
    let displayNameIsOk = this.state.displayName != null && this.state.displayName.length >= 5;

    if (nameIsOk && emailIsOk && dobIsOk && genderIsOk && planIsOk && passIsOk && displayNameIsOk)
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
        n: this.state.name,
        e: this.state.email,
        b: this.state.dob,
        g: this.state.gender,
        p: this.state.plan,
        dn: this.state.displayName,
        j: moment().format('LL')
      };

      var userQueriableJSON = {
        dn: this.state.displayName,
        p: this.state.plan
      };

      let createUser = await firebase.auth().createUserWithEmailAndPassword(this.state.email, this.state.password);
      var user = await firebase.auth().signInWithEmailAndPassword(this.state.email, this.state.password);
      user = user.user;
      this.setState({user:user});
      // Set user info
      firebase.database().ref('/users/'+(user.uid)+'/i/').set(userJson);
      firebase.database().ref('/queriable/'+(user.uid)+'/').set(userQueriableJSON);
      firebase.database().ref('/users/' + user.uid + '/d/t').set(0);

      var idToken = await firebase.auth().currentUser.getIdToken(/* forceRefresh */ true);
      var paymentToken = tokenId;
      var plan = this.state.plan;

      axios.get(server_urls.createStripeUser, {params: {
        idToken: idToken,
        paymentToken: paymentToken,
        plan: plan
      }}).then(async function(customer_id) {

        axios.get(server_urls.initPayments, {params: {
          idToken: idToken,
          plan: plan
        }}).then(async function(subscription) {
          // Save subscription
          // firebase.database().ref('/users/' + user.uid + '/subscription/').set(subscription);
          window.history.pushState(null, '', '/vote')

          // Set user picture
          await this.uploadPicture()


          this.props.popup('Welcome to the future of donation..');


        }.bind(this)).catch(function(err) {
           alert('Initialize payments error: ' + err);
        }.bind(this))

      }.bind(this)).catch(function(err) {
        alert('Create Stripe error: ' + err);
      }.bind(this))



    } else {
      alert('Form not valid!')

    }





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
           firebase.database().ref('/users/' + user + '/img/p').set(body.name);

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

    var background =  'linear-gradient(red, yellow)';


    var min = Datetime.moment().subtract( 16, 'year' );
    var valid = function( current ){
        return current.isBefore( min );
    };
    console.log('AB: ' + this.state.activeButton);

    var c1 = (this.state.hover1) ? '#e6ffe6' : '#f4fbff';
    var c2 = (this.state.hover2) ? '#e6ffe6' : '#f4fbff';
    var c3 = (this.state.hover3) ? '#e6ffe6' : '#f4fbff';
    var c4 = (this.state.hover4) ? '#3e819b' : '#6babc4';

    console.log('c4:' + c4);
    if (this.state.plan === 'Premium X') {
      c1 = '#e6ffe6';
    } else if (this.state.plan === 'Premium Y') {
      c2 = '#e6ffe6';
    }  else if (this.state.plan === 'Premium Z') {
      c3 = '#e6ffe6';
    }

    var isMobile = this.state.width <= 800;
    var textBoxDimensions = {
      sm: {
        width: '86%',
        height: '180px'
      },
      lg: {
        width: '31%',
        height: '200px'
      }
    }

    var fontSize = '20px';
    var col_width_wide = '150px';
    var bottomMargin = '400px'

    if (this.state.width < 700) {
      fontSize = '17px';
      col_width_wide = '100px';
      bottomMargin = '200px';
    }
    var tbDimension = (isMobile ? textBoxDimensions.sm : textBoxDimensions.lg);
    if (this.state.width > 1500) {
        tbDimension.width = '33.3333%';
        tbDimension.height = '180px';

    }

    var optComponent;
    if (!isMobile) {
      optComponent = (
        <div>
          <ButtonToolbar>
             <ToggleButtonGroup type="radio" defaultValue='Premium Pro' name="toggle plan" style={{marginLeft: '7%', alignContent: 'center'}}>
                 <ToggleButton value='Premium X' onClick={() => this.selectedPlan('Premium X')} onMouseEnter={() => this.toggleHover(1)} onMouseLeave={() => this.toggleHover(1)} style={{background: c1,  whiteSpace: 'normal', width: tbDimension.width, height: tbDimension.height}}><h1>Premium X</h1><br/><p>This will be a  plan. It jsut fits very well.ldskjfa </p></ToggleButton>
               <ToggleButton value='Premium Y' onClick={() => this.selectedPlan('Premium Y')} onMouseEnter={() => this.toggleHover(2)} onMouseLeave={() => this.toggleHover(2)} style={{background: c2,   whiteSpace: 'normal', width: tbDimension.width, height: tbDimension.height}}><h1>Premium Y</h1><br/><p>This will be a description of the Premium Y plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
             <ToggleButton value='Premium Z' onClick={() => this.selectedPlan('Premium Z')} onMouseEnter={() => this.toggleHover(3)} onMouseLeave={() => this.toggleHover(3)} style={{background: c3,   whiteSpace: 'normal', width: tbDimension.width, height: tbDimension.height}}><h1>Premium Z</h1><br/><p>This will be a description of the Premium Z plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
             </ToggleButtonGroup>

         </ButtonToolbar>
        </div>
      )
    } else {
      optComponent = (
        <div>
          <ButtonToolbar>
            <ToggleButtonGroup type="radio" vertical defaultValue='Premium Pro' name="toggle plan" style={{marginLeft: '10%', alignContent: 'center'}}>
                <ToggleButton value='Premium X' onClick={() => this.selectedPlan('Premium X')} onMouseEnter={() => this.toggleHover(1)} onMouseLeave={() => this.toggleHover(1)} style={{background: c1,  whiteSpace: 'normal', width: tbDimension.width, height: tbDimension.height}}><h1>Premium X</h1><br/><p>This will be a  plan. It jsut fits very well.ldskjfa </p></ToggleButton>
              <ToggleButton value='Premium Y' onClick={() => this.selectedPlan('Premium Y')} onMouseEnter={() => this.toggleHover(2)} onMouseLeave={() => this.toggleHover(2)} style={{background: c2,   whiteSpace: 'normal', width: tbDimension.width, height: tbDimension.height}}><h1>Premium Y</h1><br/><p>This will be a description of the Premium Y plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
            <ToggleButton value='Premium Z' onClick={() => this.selectedPlan('Premium Z')} onMouseEnter={() => this.toggleHover(3)} onMouseLeave={() => this.toggleHover(3)} style={{background: c3,   whiteSpace: 'normal', width: tbDimension.width, height: tbDimension.height}}><h1>Premium Z</h1><br/><p>This will be a description of the Premium Z plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
            </ToggleButtonGroup>

         </ButtonToolbar>
        </div>
      )
    }

    var oldFileComp = (
      <div >
        <form ref={el => (this.form = el)} className='adjacentItemsParent'>
          <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>PICTURE</h1><br/>
        <input style={{marginTop: '20px', backgroundColor: 'transparent', boxShadow: '0px'}}  />
        </form>
        <div class="upload-btn-wrapper" style={{  borderRadius: '3px'}} onMouseEnter={() => this.toggleHover(4)} onMouseLeave={() => this.toggleHover(4)}>
          <button style={{height: '35px',background: c4}} >Upload a file</button>
          <input type="file" name="im-a-file" onChange={ (e) => this.profilePictureSelected(e.target.files) } style={{  boxShadow: '4px 4px 0px grey'}}/>
        </div>


      </div>
    );

    return (
      <div style={{ borderRadius: '7px', fontSize: '12px'}} className='myGradientBackground'>
      <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div>

      <h1 style={{marginLeft: '20px', fontSize: '40px'}}>Join</h1><br/>

        <div className='adjacentItemsParent'>
          <h3 style={{marginLeft: '50px',fontSize: fontSize, width: col_width_wide, marginTop: '30px'}} className='fixedAdjacentChild'>NAME</h3><br/>
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
                  style={{width: '250px', backgroundColor: '#f4fbff', color: 'black', boxShadow: '4px 4px 4px grey'}}
                />
              </InputGroup>
          <br />
        </div>

        <div className='adjacentItemsParent'>
          <h3 style={{marginLeft: '50px',fontSize: fontSize, width: col_width_wide, marginTop: '30px'}} className='fixedAdjacentChild'>EMAIL</h3><br/>
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
                  style={{width: '250px', backgroundColor: '#f4fbff', color: 'black', boxShadow: '4px 4px 4px grey'}}
                />
              </InputGroup>
          <br />
        </div>


          <div className='adjacentItemsParent'>
            <h3 style={{marginLeft: '50px',fontSize: fontSize, width: col_width_wide, marginTop: '30px'}} className='fixedAdjacentChild'>PASSWORD</h3><br/>
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
                    style={{width: '250px', backgroundColor: '#f4fbff', color: 'black', boxShadow: '4px 4px 4px grey'}}
                  />
                </InputGroup>
            <br />
          </div>

          <div className='adjacentItemsParent'>
            <h3 style={{marginLeft: '50px',fontSize: fontSize, width: col_width_wide, marginTop: '30px'}} className='fixedAdjacentChild'>DISPLAY NAME</h3><br/>
            <InputGroup className="mb-3" style={{marginTop:"15px"}} className='flexibleAdjacentChild'
  >
                  <FormControl
                    placeholder='Min. length of 5 characters'
                    aria-label="Default"
                    aria-describedby="inputGroup-sizing-default"
                    value = {this.state.displayName}
                    onChange={(event)=>{
                                this.setState({
                                   displayName:event.target.value
                                });
                             }}
                    style={{width: '250px', backgroundColor: '#f4fbff', color: 'black', boxShadow: '4px 4px 4px grey'}}
                  />
                </InputGroup>
            <br />
          </div>

        <div className='adjacentItemsParent' style={{marginTop: '10px'}}>
          <h3 style={{marginLeft: '50px',fontSize: fontSize, width: col_width_wide, marginTop: '25px'}} className='fixedAdjacentChild'>DOB</h3><br/>
        <Datetime isValidDate={ valid } onChange={this.datePicked} timeFormat={false} inputProps={{ placeholder: 'Please select your DOB', readonly: 'true',  style: {width: '250px', marginTop: '15px', textAlign: 'center', backgroundColor: '#f4fbff', color: 'darkGrey', boxShadow: '4px 4px 4px grey'}}}/>
          <br />
        </div>

        <div className='adjacentItemsParent' style={{marginTop: '0px'}}>
          <h3 style={{marginLeft: '50px',fontSize: fontSize, width: col_width_wide, marginTop: '20px'}} className='fixedAdjacentChild'>GENDER</h3><br/>
        <ButtonToolbar className='flexibleAdjacentChild' style={{marginTop:"-5px", width: '200px'}}>
                <DropdownButton
                  drop='right'
                  variant="secondary"
                  title={(this.state.gender != '' ? this.state.gender : 'Please select your gender.')}
                  key='gender'
                  value={this.state.gender}
                  style={{width: '250px', backgroundColor: '#f4fbff', color: 'black', boxShadow: '4px 4px 4px grey'}}
                >
                  <MenuItem eventKey="Male" onClick={this.selectedGender.bind(this, "Male")}>Male</MenuItem>
                  <MenuItem eventKey="Female" onClick={this.selectedGender.bind(this, "Female")}>Female</MenuItem>
                  <MenuItem eventKey="Other" onClick={this.selectedGender.bind(this, "Other")}>Other</MenuItem>
                  <MenuItem eventKey="Rather not choose" onClick={this.selectedGender.bind(this, "Rather not choose")}>Rather not choose</MenuItem>
                </DropdownButton>
            </ButtonToolbar>
          <br />
        </div>

        <div className='adjacentItemsParent' style={{marginTop: '-5px'}}>
          <h3 style={{marginLeft: '50px',fontSize: fontSize, width: col_width_wide, marginTop: '33px'}} className='fixedAdjacentChild'>PICTURE</h3><br/>
          <div class="upload-btn-wrapper" style={{  borderRadius: '3px'}} onMouseEnter={() => this.toggleHover(4)} onMouseLeave={() => this.toggleHover(4)}>
            <button style={{height: '35px',background: c4, width: '250px'}} >{this.state.picture == null ? 'UPLOAD' : 'UPLOADED'}</button>
            <input type="file" name="im-a-file" onChange={ (e) => this.profilePictureSelected(e.target.files) } style={{  boxShadow: '4px 4px 0px grey'}}/>
          </div>
          <div id="container">
            <h2 style={{marginLeft: '10px', height: '35px', marginTop: '30px'}}>{this.state.picture != null ? '👍' : '👎'}</h2>
          </div>

        </div>

        <h1 style={{marginLeft: '20px'}}>Select your plan.</h1><br/>

      {optComponent}

       <br/>

       <StripeProvider apiKey="pk_test_eDgW1qWOGdRdCnIQocPje0Gg">
         <div className="example" style={{marginLeft: '20px', width: '90%'}} >
           <h1>Payment Information</h1>
           <Elements>
             <CheckoutForm onSignUp={this.signUpUser} style={{}}/>
           </Elements>
         </div>
     </StripeProvider>

     <br />
        <br />
      <br />

      </div>
    );
  }


}

export default SignUp;
