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

let urls = variables.local_urls;

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

  send() {
    const method = "POST";
    const body = new FormData(this.form);
    console.log(body);
    // // Get current username
    // var user = firebase.auth().currentUser;
    //
    // // Create a Storage Ref w/ username
    // var storageRef = firebase.storage().ref(user + '/profilePicture/' + file.name);
    //
    // // Upload file
    // var task = storageRef.put(file);

  }

  datePicked = (current) => {
    this.setState({dob: current.format('LL')})
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
        <h1 style={{marginLeft: '30px', fontSize: '20px'}}>Join</h1><br/>

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
          <h1 style={{marginLeft: '50px', fontSize: '20px'}} className='fixedAdjacentChild'>DOB</h1><br/>
        <Datetime isValidDate={ valid } onChange={this.datePicked} timeFormat={false} inputProps={{ placeholder: 'Please select your DOB', style: {width: '250px', marginTop: '15px', textAlign: 'center'}}}/>
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
          <input style={{marginTop: '20px', backgroundColor: 'transparent', boxShadow: '0px'}} type="file" name="im-a-file" />
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
         <div className="example" >
           <h1>React Stripe Elements Example</h1>
           <Elements>
             <CheckoutForm />
           </Elements>
         </div>
     </StripeProvider>
        <Link to={urls.signUp}>
          <Button className="navButton" > PROCEED </Button>
        </Link>

      </div>
    );
  }


}

export default SignUp;
