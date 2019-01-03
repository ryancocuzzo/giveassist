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
import {eventSnapshot, userVotes, getActiveEventId, votersFor, createEvent, getOptions, genKey, castVote, getUserInfo, getTotalDonated} from './Database.js';
import numeral from 'numeral';

var moneyFormat = (number) => {
  return numeral(number).format('$0,0.00');
}



let server_urls = variables.server_urls;

class Stats extends React.Component {

  constructor(props) {
    super(props);

    var user = firebase.auth().currentUser;


    this.state = {
      user: user,
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
      isEditingInfo: false,
      joined: ''
    };

    window.history.pushState(null, '', '/stats')


  }

  componentDidMount() {
    window.addEventListener("resize", function(event) {
      console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
      this.setState({width: document.body.clientWidth});
    }.bind(this))


    // Check for new user (state change)
    firebase.auth().onAuthStateChanged(function(user) {
        this.setState({user: user});
        if (user) {
          getUserInfo(user.uid).then(function(info) {
            this.setState({
              name: info.name,
              email: info.email,
              gender: info.gender,
              currentPlan: info.plan,
              joined: info.joined
            });
          }.bind(this)).catch(function(err) {
            // ...
          }.bind(this))

        firebase.auth().currentUser.getIdToken(/* forceRefresh */ true).then(function(idToken) {

          this.setState({token: idToken});

        }.bind(this)).catch(function(error) {
          // Handle error
        });

        this.retrieveTotalDonated(user.uid);

        }



    }.bind(this));



  }

    retrieveTotalDonated = async (uid) => {
      let total = await getTotalDonated(uid);
      // alert(total)
      this.setState({total_donated: total})
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


    datePicked = (current) => {
      // console.log(current);
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

    changeEditing = () => {
      console.log('EDITING: ' + this.state.isEditingInfo);
      this.setState({isEditingInfo: !this.state.isEditingInfo})
    }

    applyChanges = (e, data) => {
      alert(util.inspect(data));
    }

    eventComponent = (total, where_it_went, where_you_voted) => {
      return
        (
          <div style={{width: '60%', marginLeft: '20%', marginRight: '20%'}}>
            <Row>
              <Col sm={4}>{total}</Col>
              <Col sm={4}>{where_it_went}</Col>
              <Col sm={4}>{where_you_voted}</Col>
            </Row>
          </div>
        );
    }

    nameClicked = (event) => {
      const { target: { value } } = event;
      let user = this.state.user.uid;
      let nameIsOk = value != null && value != '';
      console.log(user);
      console.log(nameIsOk);
      if (user && nameIsOk) {
        firebase.database().ref('/users/' + user + '/info/name').set(value);
        Popup.alert('Updated name in database!');
      } else {
        Popup.alert('Could not update name in database!');
      }
    };
    emailClicked = (event) => {
      const { target: { value } } = event;

      let user = this.state.user.uid;
      let emailIsOk = value != null && this.validateEmail(value);

      if (user && emailIsOk) {

        user.updateEmail(value).then(function(ok) {
          if (ok) {
            firebase.database().ref('/users/' + user + '/info/email').set(value);
            Popup.alert('Updated email in database!');
          }

        }).catch(function(err) {
          Popup.alert('Could not update email in database!');
        });

      } else {
        Popup.alert('Could not update email in database!');
      }
    };

    genderClicked = (event) => {
      const { target: { value } } = event;
      let user = this.state.user.uid;
      let genderIsOk = value != null && value != '';

      if (user && genderIsOk) {
        firebase.database().ref('/users/' + user + '/info/gender').set(value);
        Popup.alert('Updated name in database!');
      } else {
        Popup.alert('Could not update gender in database!');
      }
    };

   changePaymentSource = (paymentToken) => {
     let token = this.state.token;
     if (token && paymentToken) {
       axios.get(server_urls.changePaymentSource, {params: { idToken: token, paymentToken: paymentToken }}).then(
         function(response) {
           console.log(response);
           Popup.alert('Successfully changed payment method!')
         }).catch(
           function(err) {
             console.log(err);
             Popup.alert('Could not change payment method!')
           })
     }
   }

   submitPlanChange = async (plan) => {
     let token = this.state.token;
     if (token && this.state.plan) {
       axios.get(server_urls.change_plan, {params: { idToken: token, plan: this.state.plan }}).then(
         function(response) {
           console.log(response);
           Popup.alert('Successfully changed plan!')
         }).catch(
           function(err) {
             console.log(err);
             Popup.alert('Could not change plan!')
           })
     }
   }

  render() {

    var min = Datetime.moment().subtract( 16, 'year' );
    var valid = function( current ){
        return current.isBefore( min );
    };

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

    var isReadOnly = !this.state.isEditingInfo;

    console.log('READONLY: ' + isReadOnly);

    var applyButtonStyle = {
      marginLeft: '10px',
      marginRight: '25px',
      marginTop: '20px',
    };
    var disabledButtonStyle = {
      marginLeft: '10px',
      marginRight: '25px',
      marginTop: '20px',
      backgroundColor: 'darkGrey'
    };

    let buttonStyle = (!isReadOnly ? applyButtonStyle : disabledButtonStyle );
    let def = this.state.name;
    console.log('NAME: ' + def);
    var getSuffix = (this.state.width <= 1200) ? '' : <span style={{paddingLeft: '230px'}}> - Click EDIT to access.</span>;
    var getSuffixPlan = (this.state.width <= 1200) ? '' : <span style={{paddingLeft: '304px'}}> - Click EDIT to access.</span>;
    var isMobile = this.state.width <= 800;
    var optComponent;
    if (!isMobile) {
      optComponent = (
        <div>
          <ButtonToolbar>
             <ToggleButtonGroup type="radio" defaultValue='Premium Pro' name="toggle plan" style={{marginLeft: '2%', alignContent: 'center'}}>
                 <ToggleButton value='Premium X' onClick={() => this.selectedPlan('Premium X')} onMouseEnter={() => this.toggleHover(1)} onMouseLeave={() => this.toggleHover(1)} style={{background: c1,  whiteSpace: 'normal', maxWidth: '31%'}}><h1>Premium X</h1><br/><p>This will be a description of the Premium X plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
               <ToggleButton value='Premium Y' onClick={() => this.selectedPlan('Premium Y')} onMouseEnter={() => this.toggleHover(2)} onMouseLeave={() => this.toggleHover(2)} style={{background: c2,   whiteSpace: 'normal', maxWidth: '31%'}}><h1>Premium Y</h1><br/><p>This will be a description of the Premium Y plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
             <ToggleButton value='Premium Z' onClick={() => this.selectedPlan('Premium Z')} onMouseEnter={() => this.toggleHover(3)} onMouseLeave={() => this.toggleHover(3)} style={{background: c3,   whiteSpace: 'normal', maxWidth: '31%'}}><h1>Premium Z</h1><br/><p>This will be a description of the Premium Z plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
             </ToggleButtonGroup>

         </ButtonToolbar>
         <button style={{marginLeft: '20px', marginTop: '25px'}} value={this.state.plan} onClick={this.submitPlanChange}>SUBMIT</button>
        </div>
      )
    } else {
      optComponent = (
        <div>
          <ButtonToolbar>
             <ToggleButtonGroup type="radio" vertical defaultValue='Premium Pro' name="toggle plan" style={{marginLeft: '2%', alignContent: 'center'}}>
                 <ToggleButton value='Premium X' onClick={() => this.selectedPlan('Premium X')} onMouseEnter={() => this.toggleHover(1)} onMouseLeave={() => this.toggleHover(1)} style={{background: c1,  whiteSpace: 'normal', maxWidth: '90%'}}><h1>Premium X</h1><br/><p>This will be a description of the Premium X plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
               <ToggleButton value='Premium Y' onClick={() => this.selectedPlan('Premium Y')} onMouseEnter={() => this.toggleHover(2)} onMouseLeave={() => this.toggleHover(2)} style={{background: c2,   whiteSpace: 'normal', maxWidth: '90%'}}><h1>Premium Y</h1><br/><p>This will be a description of the Premium Y plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
             <ToggleButton value='Premium Z' onClick={() => this.selectedPlan('Premium Z')} onMouseEnter={() => this.toggleHover(3)} onMouseLeave={() => this.toggleHover(3)} style={{background: c3,   whiteSpace: 'normal', maxWidth: '90%'}}><h1>Premium Z</h1><br/><p>This will be a description of the Premium Z plan. It's a really good plan. It jsut fits very well. </p></ToggleButton>
             </ToggleButtonGroup>

         </ButtonToolbar>
         <button style={{marginLeft: '20px', marginTop: '25px'}} value={this.state.plan} onClick={this.submitPlanChange}>SUBMIT</button>
        </div>
      )
    }
    return (
      <Row>
        <Col>
          <div style={{ backgroundColor: 'rgba(122, 198, 105, 0)', borderRadius: '7px', fontSize: '12px'}}>
            <Popup />

          <h1 style={{marginLeft: '30px', fontSize: '40px'}}>STATISTICS</h1><br/>

          <div className='adjacentItemsParent' style={{marginLeft: '30px'}}>
              <h1 style={{marginLeft: '20px', fontSize: '20px'}} className='fixedAdjacentChild'>CURRENT PLAN</h1><br/>
            <h1 className='flexibleAdjacentChild' style={{marginLeft: '20px', fontSize: '25px'}} >{this.state.currentPlan}</h1>
              <br />
          </div>

        <div className='adjacentItemsParent' style={{marginLeft: '30px'}}>
            <h1 style={{marginLeft: '20px', fontSize: '20px'}} className='fixedAdjacentChild'>JOINED</h1><br/>
          <h1 className='flexibleAdjacentChild' style={{marginLeft: '20px', fontSize: '25px'}} >{this.state.joined}</h1>
            <br />
        </div>

        <div className='adjacentItemsParent' style={{marginLeft: '30px'}}>
            <h1 style={{marginLeft: '20px', fontSize: '20px'}} className='fixedAdjacentChild'>TOTAL DONATED</h1><br/>
          <h1 className='flexibleAdjacentChild' style={{marginLeft: '20px', fontSize: '25px'}} >{moneyFormat(this.state.total_donated*0.01)}</h1>
            <br />
        </div>


          <h1 style={{marginLeft: '30px', fontSize: '40px'}}>ACCOUNT DETAILS</h1><br/>
          <div style={{marginLeft: '50px'}}>
              <h1>Change your information</h1>


                <div className='adjacentItemsParent'>
                  <h1 style={{marginLeft: '20px', fontSize: '20px'}} className='fixedAdjacentChild'>NAME</h1><br/>
                  <InputGroup className="mb-3" style={{marginTop:"15px"}} className='fixedAdjacentChild2'
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
                          readOnly={ isReadOnly }
                          className='fixedAdjacentChild2'
                          defaultValue={def}

                        />
                      </InputGroup>
                      <button disabled={ isReadOnly } value={this.state.name} style={buttonStyle} onClick={this.nameClicked} >APPLY</button><br/>

                  <br />
                </div>

                <div className='adjacentItemsParent'>
                  <h1 style={{marginLeft: '20px', fontSize: '20px'}} className='fixedAdjacentChild'>EMAIL</h1><br/>
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
                          readOnly={ isReadOnly }
                          className='fixedAdjacentChild2'
                        />
                      </InputGroup>
                      <button disabled={ isReadOnly } value={this.state.email} style={buttonStyle} onClick={this.emailClicked} >APPLY</button><br/>

                  <br />
                </div>


              <div className='adjacentItemsParent'>
                <h1 style={{marginLeft: '20px', fontSize: '20px', marginTop:'17px'}} className='fixedAdjacentChild'>GENDER</h1><br/>
              <ButtonToolbar style={{marginTop:"11px", marginRight: '5px'}} className='fixedAdjacentChild3'>
                      <DropdownButton
                        drop='right'
                        variant="secondary"
                        title={(this.state.gender != '' ? this.state.gender : 'Please select your gender.')}
                        key='gender'
                        value={this.state.gender}
                        disabled={ isReadOnly }
                        className='fixedAdjacentChild3'

                      >
                        <MenuItem eventKey="Male" onClick={this.selectedGender.bind(this, "Male")}>Male</MenuItem>
                        <MenuItem eventKey="Female" onClick={this.selectedGender.bind(this, "Female")}>Female</MenuItem>
                        <MenuItem eventKey="Other" onClick={this.selectedGender.bind(this, "Other")}>Other</MenuItem>
                        <MenuItem eventKey="Rather not choose" onClick={this.selectedGender.bind(this, "Rather not choose")}>Rather not choose</MenuItem>
                      </DropdownButton>

                  </ButtonToolbar>
                  <button disabled={ isReadOnly } value={this.state.gender} style={buttonStyle} onClick={this.genderClicked} >APPLY</button><br/>
                <br />
              </div>

          </div>

            <StripeProvider apiKey="pk_test_eDgW1qWOGdRdCnIQocPje0Gg">
              <div className="example" style={{marginLeft: '50px'}} >
                <h1>Change your payment. {isReadOnly ? getSuffix : ''}</h1>
              { !isReadOnly ?
                (
                  <div style={{marginLeft: '2%'}}>
                    <Elements >
                      <CheckoutForm onSignUp={this.changePaymentSource} />
                    </Elements>
                  </div>

                ) :
                (
                  <div></div>
                )


              }

              </div>
          </StripeProvider>

          <hr/>


          <div style={{marginLeft: '50px'}}>
            <h1>Change your plan. {isReadOnly ? getSuffixPlan : ''}</h1>
            { !isReadOnly ?
              (
                optComponent

           ) :
           (
             <div></div>
           )
         }
          </div>

          <hr/>
          { !isReadOnly ?
            (
              <div style={{marginLeft: '50px', marginTop: '20px'}}>
                <h1>Delete your account.</h1>
              <Button bsStyle='danger' style={{marginLeft: '20px', marginTop: '15px'}} >DELETE ACCOUNT</Button>
              <hr/>

              </div>
            ) :
            (
              <div></div>
            )
          }

            <button style={{marginLeft: '30px', marginTop: '10px'}} onClick={() => this.changeEditing()}>{(this.state.isEditingInfo ? 'DONE' : 'EDIT')}</button>


          </div>
        </Col>
      </Row>

    );
  }

}

export default Stats;
