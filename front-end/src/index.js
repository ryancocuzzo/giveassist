import React from 'react';
import ReactDOM from 'react-dom';
import './Styling/index.css';
import MyNavBar from './Custom-Components/MyNavBar';
import './Styling/App.css';
import registerServiceWorker from './registerServiceWorker';
import Popup from 'react-popup';
import axios from 'axios';
import { Form, FormControl, Jumbotron, FormGroup, Checkbox, ControlLabel, ProgressBar, Col, Row, Grid, DropdownButton, MenuItem, Button, ButtonToolbar, Well} from 'react-bootstrap';
import firebase, { auth, provider } from './Helper-Files/firebase.js';
import variables from './Helper-Files/variables.js';
import VotePage from './Core-Webpages/Vote.js';
import IntroPage from './Core-Webpages/IntroPage.js';
import SignUpPage from './Core-Webpages/signUp.js';
import StatsPage from './Core-Webpages/Stats.js';
import LoginPage from './Core-Webpages/login.js';
import VaultPage from './Core-Webpages/Vaults.js';
import Loadinggg from './Custom-Components/LoadingScreen.js';

import {
  BrowserRouter,
  Link,
  Route,
  Switch,
} from 'react-router-dom';

class App extends React.Component {
  /**
   * Constructs the default rendering
   * @param {[Object]} props [properties of class (inputs)]
   */
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      doneLooking: false,
    };
  }

  /**
   * When the component mounts..
   */
  componentDidMount() {
    //
    // var user = firebase.auth().currentUser;
    // // alert(user.uid);
    // this.setState({user: user, doneLooking: true});
    //


    // Check for new user (state change)
    firebase.auth().onAuthStateChanged(function(user) {
        this.setState({user: user, doneLooking: true});
        console.log("Found user: " + user.displayName);
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
        .then(function() {
          // var provider = new firebase.auth.GoogleAuthProvider();
          // // In memory persistence will be applied to the signed in Google user
          // // even though the persistence was set to 'none' and a page redirect
          // // occurred.
          // return firebase.auth().signInWithProvider(provider);
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorMessage);
        });
    }.bind(this));
  }

  popupMessage = (text) => {
    Popup.alert(text);
  }

  render() {

    const ErrorPage = () => (
      <div  style={{backgroundColor: '#dfedd6'}}>
      </div>
    );

    const Vote = ({ match }) => {
      return <VotePage popup={(msg) => this.popupMessage(msg)}/>;
    }

    const Stats = ({ match }) => {
      return <StatsPage popup={(msg) => this.popupMessage(msg)}/>;
    }

    const Intro = ({ match }) => {
      return <IntroPage popup={(msg) => this.popupMessage(msg)}/>;
    }

    const SignUp = ({ match }) => {
      return <SignUpPage popup={(msg) => this.popupMessage(msg)}/>;
    }

    const Login = ({ match }) => {
      return <LoginPage popup={(msg) => this.popupMessage(msg)}/>;
    }

    const Vaults = ({ match }) => {
      return <VaultPage popup={(msg) => this.popupMessage(msg)}/>;
    }

    var page;
    if (this.state.doneLooking ==  true) {
      page = this.state.user ?
      ( <div>
          <MyNavBar/>
        <div style={{ backgroundColor: 'white', width: '100%', height: '80px'}}></div>
          <Switch>
            <Route exact path='/' component={Vote}/>
            <Route path='/vote' component={Vote}/>
            <Route path='/vaults' component={Vaults}/>
            <Route path='/stats' component={Stats}/>
          <Route path="*" component={Vote} />
          </Switch>
        </div>
      ) :
      (
        <div >
          <Switch>
            <Route exact path='/' component={Intro}/>
            <Route path='/signup' component={SignUp}/>
          <Route path='/login' component={Login}/>
            <Route path="*" component={Intro} />
          </Switch>
        </div>

      );
    } else {

      page = <Loadinggg/>;
    }


    var footer = (
      <div style={{height: '50px', width: '100%'}}><h5 style={{color: 'black', marginLeft: '45%', width:  '15%', height: '20px'}}>Copyright © 2018 Cuzzzo</h5></div>
    );

      return (
        <div >
          <Popup/>

          {page}
        </div>
      );


  }



}

ReactDOM.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'))

// registerServiceWorker();
