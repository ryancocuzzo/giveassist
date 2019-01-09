import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DropdownButton, MenuItem, Button, ButtonToolbar, Navbar, NavItem, NavDropdown, Nav } from 'react-bootstrap';
import imgs from './ImgFactory.js';
// import './App.css';
import vars from './variables.js';
import { Link, withRouter} from 'react-router-dom';
// import auth0Client from './Auth';
import firebase, { auth, provider } from './firebase.js';
// Imports the Google Cloud client library
// import  {Storage} from '@google-cloud/storage';
import { getProfilePictureFilename } from './Database.js';

// Creates a client
// const storage = new Storage();


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
      navOpacity: '#A9DBEF',
      history: props.history,
      user: user,
      profilePicture: null
    };

    if (user) {
      this.getProfilePicture(user.uid);
    }

    this.login = this.login.bind(this); // <-- add this line
    this.logout = this.logout.bind(this); // <-- add this line

  }

  onLoad(feedItem) {
    this.setState({
       profilePicture: feedItem
    });
  }

  async getProfilePicture(uid) {
    let ref = firebase.database().ref('/users/' + uid + '/images/profilePicture');

      ref.once('value').then (function(snap) {
          console.log('Snapback & unload');
          console.log(snap.val())
          if (snap && snap.val()) {
              let raw_filename = snap.val();
              console.log('X_found raw filename: ' + raw_filename);
              // Create a reference to the file we want to download
              var ref = firebase.storage().ref(uid+'/profilePicture/' + raw_filename);
              console.log('found ref: ' + ref);
              // Get the download URL
              ref.getDownloadURL().then(function(url) {
                console.log('Found download URL: ' + url);
                this.setState({
                    picture: url
                });
              }.bind(this)).catch(function(error) {

                // A full list of error codes is available at
                // https://firebase.google.com/docs/storage/web/handle-errors
                switch (error.code) {
                  case 'storage/object-not-found':
                    // File doesn't exist
                    break;

                  case 'storage/unauthorized':
                    // User doesn't have permission to access the object
                    break;

                  case 'storage/canceled':
                    // User canceled the upload
                    break;

                  case 'storage/unknown':
                    // Unknown error occurred, inspect the server response
                    break;
                }
              });
          } else {
            console.log('No prifdaaj pic!')
          }
      }.bind(this))


    // let destFilename = './' + raw_filename;
    //
    // const bucketName = uid;
    // const srcFilename = raw_filename;
    // const options = {
    //   // The path to which the file should be downloaded, e.g. "./file.txt"
    //   destination: destFilename,
    // };
    //
    // // // Downloads the file
    // // await storage
    // //   .bucket(bucketName)
    // //   .file(srcFilename)
    // //   .download(options);
    //
    // console.log(
    //   `gs://${bucketName}/${srcFilename} downloaded to ${destFilename}.`
    // );



  }

  /**
   * When the component mounts..
   */
  componentDidMount() {
    // Check for new user (state change)
    firebase.auth().onAuthStateChanged(function(user) {
        this.setState({user: user});
        if (user) {
          this.getProfilePicture(user.uid);
        }
    }.bind(this));

    if (this.state.user) {
      this.getProfilePicture(this.state.user.uid);
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
                <a>
                <span class="navbar-brand" style={{marginLeft: '0px'}}><img src={(this.state.picture) ? this.state.picture : imgs.unknown} width="50px" height="50px" alt="Picture" style={{marginTop: '6px', borderRadius: '5px'}}></img></span>
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
          <Link to={urls.vaults} >
          <Button style={{}} className="button"> VAULTS </Button>
          </Link>
        </NavItem>

        <NavItem  className='link' style={{border: 'none'}}>
          <Link to={urls.stats} >
          <Button style={{}} className="button"> STATS </Button>
          </Link>
        </NavItem>

          <NavItem  className='link' style={{border: 'none'}}>
            <Link to={urls.vote}>
            <Button style={{}} className="button" > VOTE </Button>
            </Link>
          </NavItem>



    </Nav>
  </Navbar.Collapse>

);


  return (
    <Navbar fixedTop inverse collapseOnSelect style={{backgroundColor: '#357244', headerStyle: {
          height: '100px'
      }}} className='myNavbar'>
      {header}
      {rest}

      </Navbar>
  );


  }

}

export default withRouter(MyNavBar);
