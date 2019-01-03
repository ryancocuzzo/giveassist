import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import MyNavBar from './MyNavBar';
import './App.css';
import registerServiceWorker from './registerServiceWorker';
import Popup from 'react-popup';
import axios from 'axios';
import { Form, FormControl, Jumbotron, FormGroup, Checkbox, ControlLabel, ProgressBar, Col, Row, Grid, DropdownButton, MenuItem, Button, ButtonToolbar, Well} from 'react-bootstrap';
import firebase, { auth, provider } from './firebase.js';
import VotePage from './Vote.js';
import IntroPage from './IntroPage.js';
import SignUpPage from './signUp.js';
import StatsPage from './Stats.js';
import LoginPage from './login.js';

import {
  BrowserRouter,
  Link,
  Route,
  Switch,
} from 'react-router-dom';
import variables from './variables.js';

class App extends React.Component {
  /**
   * Constructs the default rendering
   * @param {[Object]} props [properties of class (inputs)]
   */
  constructor(props) {
    super(props);

    var user = firebase.auth().currentUser;

    this.state = {
      user: user
    };


  }

  /**
   * When the component mounts..
   */
  componentDidMount() {

    // Check for new user (state change)
    firebase.auth().onAuthStateChanged(function(user) {
        this.setState({user: user});
        console.log("Found user: " + user.displayName);
    }.bind(this));
  }

  popupMessage = (text) => {
    Popup.alert(text);
  }

  render() {

    const ErrorPage = () => (
      <div>
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

    var page = this.state.user ?
    ( <div>
        <MyNavBar/>
          <br/>
          <br/>
          <br/>
          <br/>
          <br/>
        <Switch>
          <Route exact path='/' component={Vote}/>
          <Route path='/vote' component={Vote}/>
          <Route path='/stats' component={Stats}/>
        <Route path="*" component={Vote} />
        </Switch>
      </div>
    ) :
    (
      <div>
        <Switch>
          <Route exact path='/' component={Intro}/>
          <Route path='/signup' component={SignUp}/>
        <Route path='/login' component={Login}/>
          <Route path="*" component={Intro} />
        </Switch>
      </div>

    );

      return (
        <div>
          <Popup />

          {page}

          <div style={{height: '50px', width: '100%'}}><h5 style={{color: 'white', marginLeft: '45%', width:  '15%', height: '20px'}}>Copyright © 2018 Cuzzzo</h5></div>
        </div>
      );


  }



}

ReactDOM.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'))

registerServiceWorker();
