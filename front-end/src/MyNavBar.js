import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DropdownButton, MenuItem, Button, ButtonToolbar, Navbar, NavItem, NavDropdown, Nav } from 'react-bootstrap';
import imgs from './ImgFactory.js';
import './App.css';
import vars from './variables.js';
import { Link, withRouter} from 'react-router-dom';
// import auth0Client from './Auth';
import firebase, { auth, provider } from './firebase.js';

let urls = vars.local_urls;

class MyNavBar extends Component {

  /**
   * Constructs the default rendering
   * @param {[Object]} props [properties of class (inputs)]
   */
  constructor(props) {
    super(props);

    // get firebase user
    var user = firebase.auth().currentUser;

    this.state = {
      navOpacity: 'rgba(122, 198, 105, 0)',
      history: props.history,
      user: user
    };

    this.login = this.login.bind(this); // <-- add this line
    this.logout = this.logout.bind(this); // <-- add this line

  }

  /**
   * When the component mounts..
   */
  componentDidMount() {
    // Check for new user (state change)
    firebase.auth().onAuthStateChanged(function(user) {
        this.setState({user: user});
    }.bind(this));

    window.onscroll =()=>{
        // Establish the threshold Y
        let THRESHHOLD = 100;
        // Get opacity
        let opacity = (window.scrollY / THRESHHOLD)
        // Format opacity
        let formattedOpacity = 'rgba(122, 198, 105, ' + opacity+0.1 + ')';
        // Set state
        this.setState({navOpacity: formattedOpacity});

    }

  }

  /**
   * Sign in button component
   * @return {[Object]} [HTML component]
   */
  signInButton() {
    if (!this.state.user)
      return <button style={{marginTop: '7px'}} onClick={this.login}>Log In</button>;
    else
      return <button style={{marginTop: '7px'}} onClick={this.logout}>Log Out: {this.state.user.displayName || this.state.user.email}</button>;

  }

  /**
   * Log out
   */
  logout() {
    // Sign out of google auth
    auth.signOut()
    .then(() => {
      this.setState({
        user: null
      });
    });
  }


  /**
   * Log in and set persistance of session
   */
  login() {
    // Sign in popup
    auth.signInWithPopup(provider)
      .then((result) => {
        // Get user (result)
        const user = result.user;
        //
        this.setState({user: user});
        firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
        .then(function() {
          var provider = new firebase.auth.GoogleAuthProvider();
          // In memory persistence will be applied to the signed in Google user
          // even though the persistence was set to 'none' and a page redirect
          // occurred.
          return firebase.auth().signInWithProvider(provider);
        })
        .catch(function(error) {
          // Handle Errors here.
          var errorCode = error.code;
          var errorMessage = error.message;
          alert(errorMessage);
        });
      });
  }

  render() {

    // console.log(this.state.user)

      var header = (<Navbar.Header>
                <a onClick={() => window.open("https://localhost:8000", "_blank")}>
                <span class="navbar-brand" style={{marginLeft: '0px'}}><img src={(this.state.user && this.state.user.photoURL) ? this.state.user.photoURL : imgs.unknown} width="50px" height="50px" alt="Picture" marginTop="25px"></img></span>
              </a>
              <Navbar.Toggle />
            </Navbar.Header>);
  var rest = (

    <Navbar.Collapse>
      <Navbar.Text style={{marginTop: '24px'}}>
        {this.signInButton()}
      </Navbar.Text>
      <Nav pullRight>

          <NavItem  className='link' style={{border: 'none'}}>
            <Link to={urls.vote}>
            <Button style={{}} className="navButton" > VOTE </Button>
            </Link>
          </NavItem>

          <NavItem  className='link' style={{border: 'none'}}>
            <Link to={urls.stats} >
            <Button style={{}} className="navButton"> STATS </Button>
            </Link>
          </NavItem>
    </Nav>
  </Navbar.Collapse>

);


  return (
    <Navbar fixedTop inverse collapseOnSelect style={{backgroundColor: 'rgb(122, 198, 105)', headerStyle: {
          height: '100px'
      }}} className='myNavbar'>
      {header}
      {rest}

      </Navbar>
  );


  }

}

export default withRouter(MyNavBar);
