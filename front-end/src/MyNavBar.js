import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { DropdownButton, MenuItem, Button, ButtonToolbar, ButtonGroup, Navbar, NavItem, NavDropdown, Nav } from 'react-bootstrap';
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
      navOpacity: 'rgba(255, 255, 255, 0)',
      history: props.history,
      user: user,
      profilePicture: null,
      width: document.body.clientWidth,
      navExpanded: false
    };

    if (user) {
      this.getProfilePicture(user.uid);
    }

    // this.login = this.login.bind(this); // <-- add this line
    this.logout = this.logout.bind(this); // <-- add this line

  }

  onLoad(feedItem) {
    this.setState({
       profilePicture: feedItem
    });
  }

  async getProfilePicture(uid) {
    let ref = firebase.database().ref('/users/' + uid + '/img/p');

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

    window.addEventListener("resize", function(event) {
      this.setState({width: document.body.clientWidth});
    }.bind(this))

    window.onscroll =()=>{
        let THRESHHOLD = 300;
        let currentY = (window.scrollY > THRESHHOLD) ? THRESHHOLD : window.scrollY;
        let opacity = (window.scrollY / THRESHHOLD)
     //   console.log(opacity)
        let formattedOpacity = 'rgba(255, 255, 255, ' + opacity + ')';

        this.setState({navOpacity: formattedOpacity})

   }





  }

  /**
   * Sign in button component
   * @return {[Object]} [HTML component]
   */
  signInButton() {
    if (!this.state.user)
      return <button style={{marginTop: '7px', marginLeft: '17px'}} onClick={this.login}>Log In</button>;
    else
      return <button style={{marginTop: '7px', marginLeft: '17px'}} onClick={this.logout}>Log Out</button>;

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

  //
  // /**
  //  * Log in and set persistance of session
  //  */
  // login() {
  //   // Sign in popup
  //   auth.signInWithPopup(provider)
  //     .then((result) => {
  //       // Get user (result)
  //       const user = result.user;
  //       //
  //       this.setState({user: user});
  //       firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)
  //       .then(function() {
  //         var provider = new firebase.auth.GoogleAuthProvider();
  //         // In memory persistence will be applied to the signed in Google user
  //         // even though the persistence was set to 'none' and a page redirect
  //         // occurred.
  //         return firebase.auth().signInWithProvider(provider);
  //       })
  //       .catch(function(error) {
  //         // Handle Errors here.
  //         var errorCode = error.code;
  //         var errorMessage = error.message;
  //         alert(errorMessage);
  //       });
  //     });
  // }
  setNavExpanded = (expanded) => {
    this.setState({ navExpanded: expanded });
  }

  closeNav = () => {
    this.setState({ navExpanded: false });

  }

  dynamicHComponent = (txt, size) => {
    if (size == 3) {
      return <h4 style={{color:'black', fontWeight: '850'}}>{txt}</h4>
    } else if (size==4)
    return <h4 style={{color:'black'}}>{txt}</h4>
      else if (size==5)
     return <h4 style={{color:'black'}}>{txt}</h4>
  }

  navigationBar = (margin, textSizeH) => {
    let marginTop = textSizeH < 4 ? '10px' : (textSizeH < 5 ? '9px' : '11px');
    if (this.state.width >= 770) {
      return <Navbar expand="xl" fixedTop  collapseOnSelect style={{backgroundColor: this.state.navOpacity, border: 'none', headerStyle: {
            borderBottomWidth: 0,
        }}} className='myNavbar'>
        <Navbar.Header style={{marginLeft: '', marginTop: '6px'}} pullLeft>
          <img src={imgs.logo_lg} height="50px" className='fixedAdjacentChild' alt="Picture" style={{marginTop: '16px', marginBottom: '20px', marginTop: '20px', borderRadius: '5px'}}></img>

            <Navbar.Toggle className='blackOnHover' style={{height: '50px'}}>
              <h4 style={{marginTop: '7px',height: '50px'}}>JUMP</h4>
            </Navbar.Toggle>
        </Navbar.Header>
        <Navbar.Collapse >
          <Nav pullRight style={{marginTop: marginTop}}>

            <ButtonGroup aria-label="Basic example"  style={{marginTop: marginTop}}>

              <button  className='navigationButton' style={{border: 'none', marginRight: '5px',height: '50px'}} onClick={this.logout}>
                {this.dynamicHComponent('LOGOUT',textSizeH)}
              </button>
              <span class="divider"></span>

            <Link to={urls.vaults} >
            <button  className='navigationButton' style={{border: 'none', marginRight: '5px',height: '50px'}}  onClick={this.closeNav}>
              {this.dynamicHComponent('VAULTS',textSizeH)}
              </button>
              <span class="divider"></span>
            </Link>

            <Link to={urls.stats} >
            <button  className='navigationButton' style={{border: 'none', marginRight: '5px',height: '50px'}}  onClick={this.closeNav}>
                {this.dynamicHComponent('INFO',textSizeH)}

              </button>
            </Link>
            <Link to={urls.vote} >
              <button  className='navigationButton' style={{border: 'none', marginRight: '0px',height: '50px'}}  onClick={this.closeNav}>
                {this.dynamicHComponent('VOTE',textSizeH)}
              </button>
            </Link>
            </ButtonGroup>





          </Nav>
        </Navbar.Collapse>
      </Navbar>;
    } else {
      return <Navbar expand="xl" fixedTop collapseOnSelect style={{backgroundColor: this.state.navOpacity, border: 'none', headerStyle: {
            borderBottomWidth: 0,
        }}} className='myNavbar' onToggle={this.setNavExpanded}
                expanded={this.state.navExpanded}>
        <Navbar.Header style={{marginLeft: margin, marginTop: '6px'}} pullLeft>
          <img src={imgs.logo_lg} height="50px" className='fixedAdjacentChild' alt="Picture" style={{marginTop: '16px', marginBottom: '20px', marginTop: '20px', borderRadius: '5px'}}></img>

            <Navbar.Toggle className='blackOnHover' style={{height: '50px'}}>
              <h4 style={{marginTop: '7px',height: '50px'}}>MENU</h4>
            </Navbar.Toggle>
        </Navbar.Header>
        <Navbar.Collapse >
          <Nav pullRight style={{marginTop: marginTop}}>

            <ButtonGroup aria-label="Basic example" vertical style={{marginTop: marginTop}}>

              <div className='navigationButton2' style={{border: 'none', 'letter-spacing': '2px', width: '220px', marginLeft: '20px',height: '50px', marginTop: '-5px'}} onClick={this.logout}>
                {this.dynamicHComponent('LOGOUT',textSizeH)}
              </div>
              <div style={{marginLeft: '10%', width: '90%', marginRight: '10%', height: '3px'}}/>
              <span class="divider"></span>

              <Link to={urls.vaults} >
                <div  className='navigationButton2' style={{border: 'none', width: '220px', marginLeft: '20px',height: '50px', marginTop: '7px'}}  onClick={this.closeNav}>
                  {this.dynamicHComponent('VAULTS',textSizeH)}
                </div>
              </Link>
              <div style={{marginLeft: '10%', width: '90%', marginRight: '10%', height: '3px'}}/>

              <span class="divider"></span>

                <Link to={urls.stats} >
                  <div  className='navigationButton2' style={{border: 'none', width: '220px', marginLeft: '20px',height: '50px', marginTop: '7px'}}  onClick={this.closeNav}>
                    {this.dynamicHComponent('INFO',textSizeH)}
                  </div>
                </Link>
              <div style={{marginLeft: '10%', width: '90%', marginRight: '10%', height: '3px'}}/>

              <Link to={urls.vote}>
              <div  className='navigationButton2' style={{border: 'none', width: '220px', marginLeft: '20px',height: '50px', marginTop: '7px'}}  onClick={this.closeNav}>
                {this.dynamicHComponent('VOTE',textSizeH)}
              </div>
              </Link>
            </ButtonGroup>





          </Nav>
        </Navbar.Collapse>
      </Navbar>;
    }



  }

  // navigationBar = (margin, textSizeH) => {
  //   let marginTop = textSizeH < 4 ? '10px' : (textSizeH < 5 ? '9px' : '11px');
  //   return <Navbar expand="xl" fixedTop collapseOnSelect style={{backgroundColor: this.state.navOpacity, border: 'none', headerStyle: {
  //         borderBottomWidth: 0,
  //     }}} className='myNavbar'>
  //     <Navbar.Header style={{marginLeft: margin, marginTop: '6px'}} pullLeft>
  //       <img src={imgs.logo_lg} height="50px" className='fixedAdjacentChild' alt="Picture" style={{marginTop: '16px', marginBottom: '20px', marginTop: '20px', borderRadius: '5px'}}></img>
  //
  //       <Navbar.Toggle className='blackOnHover' style={{height: '50px'}}>
  //         <h4 style={{marginTop: '7px',height: '50px'}}>MENU</h4>
  //       </Navbar.Toggle>
  //     </Navbar.Header>
  //     <Navbar.Collapse >
  //       <Nav pullRight style={{marginTop: marginTop}}>
  //
  //         <ButtonGroup aria-label="Basic example"  style={{marginTop: marginTop}}>
  //
  //           <button  className='navigationButton' style={{border: 'none', marginRight: '0px', marginLeft: '10px',height: '50px'}} onClick={this.logout}>
  //             {this.dynamicHComponent('SIGN OUT',textSizeH)}
  //           </button>
  //
  //           <Link to={urls.vaults} >
  //             <button  className='navigationButton' style={{border: 'none', marginRight: '0px', marginLeft: '10px',height: '50px'}} value={this.whoWeAre} onClick={this.scrollToWhoWeAre}>
  //               {this.dynamicHComponent('VAULTS',textSizeH)}
  //             </button>
  //           </Link>
  //           <span class="divider"></span>
  //
  //             <Link to={urls.stats} >
  //               <button  className='navigationButton' style={{border: 'none', marginLeft: '10px', marginRight: '10px',height: '50px'}} value={this.theProblem} onClick={this.scrollToTheProblem}>
  //                 {this.dynamicHComponent('INFO',textSizeH)}
  //                 </button>
  //             </Link>
  //           <span class="divider"></span>
  //
  //             <Link to={urls.vote}>
  //               <button  className='navigationButton' style={{border: 'none', marginRight: '10px',height: '50px'}} value={this.theSolution} onClick={this.scrollToTheSolution}>
  //                   {this.dynamicHComponent('VOTE',textSizeH)}
  //
  //                 </button>
  //               </Link>
  //
  //         </ButtonGroup>
  //
  //
  //
  //       </Nav>
  //     </Navbar.Collapse>
  //   </Navbar>;
  //
  //
  // }

  al = () => {
    console.log('x')
    alert(this.state.width)
  }



  render() {

    if (this.state.width < 770)
      this.state.navOpacity = 'white'

    var sizeAlertButton = <button onCLick={() => alert(this.state.width)}>SIZE</button>;

    // console.log(this.state.user)

      var header = (<Navbar.Header>
                <a>

                <span class="navbar-brand" style={{marginLeft: '-10px'}}>
                  <div className='adjacentItemsParent'>
                    <img src={imgs.logo_lg} height="50px" className='fixedAdjacentChild' alt="Picture" style={{marginTop: '6px', borderRadius: '5px', marginRight: '5px'}}></img>
                  </div>  </span>
              </a>
              <Navbar.Toggle />
            </Navbar.Header>);

  var rest = (



    <Navbar.Collapse>

      <Nav pullRight>

        <Navbar.Text style={{marginTop: '30px'}}>
          {this.signInButton()}
        </Navbar.Text>

        <NavItem  className='link' style={{border: 'none'}}>
          <Link to={urls.vaults} >
          <Button style={{}} className="button"> VAULTS </Button>
          </Link>
        </NavItem>

        <NavItem  className='link' style={{border: 'none'}}>
          <Link to={urls.stats} >
          <Button style={{}} className="button"> INFO </Button>
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



var fontSize = '20px';
var col_width_wide = '50%';
var margin = '25%';
var navMarginLeft = '-10px';
var textSizeH = 1;
var correct_dim;
var dim = {
  sm: {
    mL: '25%',
    width: '50%',
    fontSize: '40px',
    mb: '20px'
  },
  lg: {
    mL: '30%',
    width: '40%',
    fontSize: '60px',
    mb: '30px'
  },
  xl: {
    mL: '35%',
    width: '30%',
    fontSize: '80px',
    mb: '40px'
  },
  xxl: {
    mL: '40%',
    width: '20%',
    fontSize: '100px',
    mb: '50px'
  }
}

if (this.state.width < 1000) {
  correct_dim = dim.sm;
  navMarginLeft = '0px';
  textSizeH = 5;
} else if (this.state.width >= 1000 && this.state.width < 1150) {
  correct_dim = dim.lg;
  navMarginLeft = '-20px';
  textSizeH = 4;
} else if (this.state.width >= 1150 && this.state.width < 1300) {
  correct_dim = dim.xl;
  navMarginLeft = '-35px';
  textSizeH = 3;
} else if (this.state.width >= 1000 && this.state.width < 1500) {
  textSizeH = 3;
  correct_dim = dim.xxl;
  navMarginLeft = '-50px';
} else {
  textSizeH = 3;
  correct_dim = dim.xxl;
  navMarginLeft = '-150px';
}

if (this.state.width < 600) {
  textSizeH = 3;

}

return this.navigationBar(navMarginLeft, textSizeH);


  // return (
  //   <Navbar fixedTop inverse collapseOnSelect style={{backgroundColor: 'white', headerStyle: {
  //         height: '100px'
  //     }}} className='myNavbar'>
  //     {header}
  //     {rest}
  //
  //     </Navbar>
  // );


  }

}

export default withRouter(MyNavBar);
