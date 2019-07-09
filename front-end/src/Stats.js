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
import PayPlanOption from "./PayPlanOption";
import MyInput from './MyInput.js';
import { _signUpUser, untrimSelectedOption, trimSelectedOption } from './User.js';

var moneyFormat = (number) => {
  return numeral(number).format('$0,0.00');
}

var num_regex = /[0-9]*/;


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
      displayName: '',
      joined: '',
      width: document.body.clientWidth
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
              name: info.n,
              email: info.e,
              gender: info.g,
              currentPlan: untrimSelectedOption(info.p),
              joined: info.j,
              displayName: info.dn
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
             firebase.database().ref('/users/' + user + '/img/p').update(body.name);

      }

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
      if (this.state.user) {
        let user = this.state.user.uid;
        let nameIsOk = value != null && value != '';
        console.log(user);
        console.log(nameIsOk);
        if (user && nameIsOk) {
          firebase.database().ref('/users/' + user + '/i/n').update(value);
          Popup.alert('Updated name in database!');
        } else {
          Popup.alert('Could not update name in database!');
        }
      } else {
        Popup.alert('Account error. It seems you are not logged in!')
      }
    };

    displayNameClicked = (event) => {
      const { target: { value } } = event;
      if (this.state.user) {
        let user = this.state.user.uid;
        let displayNameIsOk = value != null && value != '' && value.length >= 7;
        if (user && displayNameIsOk) {
          firebase.database().ref('/users/' + user + '/i/dn').update(value);
          firebase.database().ref('/queriable/' + user + '/n').update(value);
          Popup.alert('Updated Display Name in database!');
        } else {
          Popup.alert('Could not update Display Name in database!');
        }
      } else {
        Popup.alert('Account error. It seems you are not logged in!')
      }

    };

    emailClicked = (event) => {
      const { target: { value } } = event;

      let user = this.state.user;
      let emailIsOk = value != null && this.validateEmail(value);

      if (user && emailIsOk) {
        var u = firebase.auth().currentUser;
        firebase.auth()
          .signInWithEmailAndPassword('you@domain.com', 'correcthorsebatterystaple')
          .then(function(userCredential) {
              userCredential.user.updateEmail('newyou@domain.com')
        })
        u.updateEmail(value).then(function(ok) {
          if (ok) {
            firebase.database().ref('/users/' + user + '/i/e').update(value);
            Popup.alert('Updated email in database!');
          }

        }).catch(function(err) {
          console.log('XX:' + err);

          Popup.alert('Could not update email in database! Code 9');
        });

      } else {
        Popup.alert('Could not update email in database! Code 7');
      }
    };

    genderClicked = (event) => {
      const { target: { value } } = event;
      let user = this.state.user.uid;
      let genderIsOk = value != null && value != '';

      if (user && genderIsOk) {
        firebase.database().ref('/users/' + user + '/i/g').update(value);
        Popup.alert('Updated name in database!');
      } else {
        Popup.alert('Could not update gender in database!');
      }
    };

    deleteAccount = () => {
      if (this.state.token) {
        let token = this.state.token;
        axios.get(server_urls.deleteUser, {params: { idToken: token }}).then(
          function(response) {
            console.log(response);
            Popup.alert('Successfully deleted user!');
            document.location.reload(true);
          }).catch(
            function(err) {
              console.log(err);
              Popup.alert('Could not change payment method!')
            })      }
    }

    deletePopup = () => {
      Popup.create({
          title: 'DELETE ACCOUNT',
          content: 'You are about to delete your account. This action cannot be undone. If you wish to confirm this action, you may proceed by clicking confirm.',
          buttons: {
              left: [ {
                  text: 'Confirm',
                  className: 'danger',
                  action: function () {
                      this.deleteAccount();
                      Popup.alert('Account deleted!');

                      /** Close this popup. Close will always close the current visible one, if one is visible */
                      Popup.close();
                  }.bind(this)
              }]
          }
      });
    }

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

   submitPlanChange = async () => {
     Popup.alert('Processing your request..');
     let token = this.state.token;
     if (token && this.state.selected_option) {
       axios.get(server_urls.change_plan, {params: { idToken: token, plan: untrimSelectedOption(this.state.selected_option) }}).then(
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

   nameSubmitted = value => {
     this.setState({ name: value });
   };

   displayNameSubmitted = value => {
     this.setState({ displayName: value });
   };

   option_selected = title => {
     this.state.selected_option = title;
     this.setState({ selected_option: title });
     this.forceUpdate();
   };

  render() {

    var min = Datetime.moment().subtract( 16, 'year' );
    var valid = function( current ){
        return current.isBefore( min );
    };

    var isReadOnly = !this.state.isEditingInfo;

    console.log('READONLY: ' + isReadOnly);

    var applyButtonStyle = {
      marginLeft: '10px',
      marginRight: '25px',
      marginTop: '4px',
    };
    var disabledButtonStyle = {
      marginLeft: '10px',
      marginRight: '25px',
      backgroundColor: '#556065',
      marginTop: '4px',
    };

    let buttonStyle = (!isReadOnly ? applyButtonStyle : disabledButtonStyle );
    let def = this.state.name;
    console.log('NAME: ' + def);
    var getSuffix = (this.state.width <= 1200) ? '' : <span style={{paddingLeft: '230px'}}> - Click EDIT to access.</span>;
    var getSuffixPlan = (this.state.width <= 1200) ? '' : <span style={{paddingLeft: '304px'}}> - Click EDIT to access.</span>;

    var fontSize = 22;
    var col_width_wide = 150;
    var leftMargin = 40;
    var topMargin = -2;
    var bottomMargin = '300px'

    if (this.state.width < 700) {
      fontSize = 19;
      col_width_wide = 220;
      leftMargin = 45;
      bottomMargin = '50px'
    }

    if (this.state.width < 500) {
      fontSize = 14;
      col_width_wide = 190;
      leftMargin = 10;
    }

    var name_component = () => {
      return (
        <MyInput
          id={1}
          label="Name"
          locked={false}
          active={false}
          minLength={4}
          handleSubmit={this.nameSubmitted}
          handleVal={this.nameSubmitted}
        />
      );
    };

    var display_name_component = () => {
      return (
        <MyInput
          id={2}
          label="Display Name"
          locked={false}
          active={false}
          minLength={7}
          handleSubmit={this.displayNameSubmitted}
          handleVal={this.displayNameSubmitted}
        />
      );
    };

    var custom_component = () => {
      return (

          <div style={{marginLeft: '5%', width: '100%'}}>
              <MyInput
                id={5}
                label="Custom Amount"
                locked={false}
                active={false}
                regex={num_regex}
                handleSubmit={this.customPlanSubmitted}
                type="number"
                handleVal={this.customPlanSubmitted}
                minLength={1}
                maxWidth="90%"
                fontSize='25px'

              />
            </div>


      );
    };

    var isMobile = this.state.width <= 1000;

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




    var a = this.state.selected_option == "Premium X";
    var b = this.state.selected_option == "Premium Y";
    var c = this.state.selected_option == "Premium Z";

    return (
      <Row>
        <Col>
          <div style={{ borderRadius: '7px', fontSize: '12px'}} className='myGradientBackground'>
            <div style={{marginLeft: '5%', width: '90%'}}>

            <div style={{ backgroundColor: '#249cb5', width: '100%', height: '20px'}}></div>
            <Popup />

          <h1 style={{marginLeft: '30px', fontSize: '40px'}}>STATISTICS</h1><br/>

        <div className='adjacentItemsParent' style={{marginLeft: isMobile ? '25px' : '30px'}}>
            <h1 style={{marginLeft: (leftMargin)+'px',fontSize: (fontSize+5)+'px', width: (col_width_wide+40)+'px', marginTop: (topMargin)+'px'}} className='fixedAdjacentChild'>CURRENT PLAN</h1><br/>
            <h1 className='flexibleAdjacentChild' style={{marginLeft: leftMargin,fontSize: fontSize+5, width: col_width_wide, marginTop: (topMargin)+'px'}} >{this.state.currentPlan}</h1>
              <br />
          </div>

        <div className='adjacentItemsParent' style={{marginLeft: isMobile ? '25px' : '30px'}}>
            <h1 style={{marginLeft: (leftMargin)+'px',fontSize: (fontSize+5)+'px', width: (col_width_wide+40)+'px', marginTop: (topMargin)+'px'}}className='fixedAdjacentChild'>JOINED</h1><br/>
          <h1 className='flexibleAdjacentChild' style={{marginLeft: leftMargin,fontSize: fontSize+5, width: col_width_wide, marginTop: (topMargin)+'px'}} >{this.state.joined}</h1>
            <br />
        </div>

        <div className='adjacentItemsParent' style={{marginLeft: isMobile ? '25px' : '30px'}}>
            <h1 style={{marginLeft: (leftMargin)+'px',fontSize: (fontSize+5)+'px', width: (col_width_wide+40)+'px', marginTop: (topMargin)+'px'}} className='fixedAdjacentChild'>TOTAL DONATED</h1><br/>
          <h1 className='flexibleAdjacentChild' style={{marginLeft: leftMargin,fontSize: fontSize+5, width: col_width_wide, marginTop: (topMargin)+'px'}} >{moneyFormat(this.state.total_donated*0.01)}</h1>
            <br />
        </div>


          <h1 style={{marginLeft: '30px', fontSize: '40px'}}>ACCOUNT DETAILS</h1><br/>
          <div style={{marginLeft: '50px'}}>
              <h1>Change your information</h1>

            <div style={{width: '90%'}}>
              {name_component()}
            </div>
            <br />
            <button disabled={ isReadOnly } value={this.state.name} style={buttonStyle} onClick={this.nameClicked} >APPLY</button><br/>
                  <br />

                  <div style={{width: '90%'}}>
                {display_name_component()}
              </div>
                  <br />
                      <button disabled={ isReadOnly } value={this.state.displayName} style={buttonStyle} onClick={this.displayNameClicked} >APPLY</button><br/>
                  <br />

          </div>

            <StripeProvider apiKey="pk_test_eDgW1qWOGdRdCnIQocPje0Gg">
              <div className="example" style={{marginLeft: '50px'}} >
                <h1>Change your payment. {isReadOnly ? getSuffix : ''}</h1>
              { !isReadOnly ?
                (
                  <div style={{marginLeft: '2%', width: '90%'}}>
                    <Elements >
                      <CheckoutForm onSignUp={this.changePaymentSource} submitText="Submit"/>
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

          <div className="example" style={{marginLeft: '50px'}} >
            <h1>Change your plan.</h1>
        </div>

        <div disabled={ isReadOnly } style={{pointerEvents: isReadOnly ? 'none': 'auto', opacity: isReadOnly ? 0.4 : 1, display: isReadOnly ? 'none' : 'block'}}>

          {options}

          <br />
        <button disabled={ isReadOnly } style={buttonStyle} onClick={this.submitPlanChange} >APPLY</button><br/>

        </div>



          <hr/>
          { !isReadOnly ?
            (
                <div>
                  <div style={{marginLeft: '50px', marginTop: '20px'}}>
                    <h1>Delete your account.</h1>
                  <Button bsStyle='danger' style={{marginLeft: '20px', marginTop: '15px'}} onClick={this.deletePopup}>DELETE ACCOUNT</Button>

                  </div>
                  <hr/>
              </div>
            ) :
            (
              <div></div>
            )
          }

            <button style={{marginLeft: '10px', marginTop: '10px'}} onClick={() => this.changeEditing()}>{(this.state.isEditingInfo ? 'DONE' : 'EDIT')}</button>
            <br/>
              <div style={{textAlign: 'center'}}>
              <br/><br/>
                <button onClick={() => window.open('https://goo.gl/forms/y8JTxQyvn8LI9NWN2', "_blank")} >REPORT BUG</button>
                  <br/>
                    <br/>
                      <br/>

              </div>
            <div style={{width: '100%', height: bottomMargin}}></div>
          </div>
        </div>
        </Col>
      </Row>

    );
  }

}

export default Stats;
