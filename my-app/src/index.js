import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Link, Route, Switch} from 'react-router-dom';
import Popup from 'react-popup';
import './styles/index.css';
import './styles/popup_styles.css';
// import Composer from './Views/Pages/Composer/Composer.js';
import Intro from './Views/Pages/Intro/Intro.js';
import UISensei from './Views/Pages/Composer/UISensei.js';
import SignUp from './Views/Pages/SignUp/SignUp.js';
import Login from './Views/Pages/Login/Login.js';
// // import * as serviceWorker from './serviceWorker';


/* Pages */

const ErrorPage = <div style={{backgroundColor: '#dfedd6'}}>404</div>;
const ComposerPage = ({ match }) => {
  return <UISensei />;
}
const SignUpPage = ({ match }) => {
  return <SignUp />;
}
const LoginPage = ({ match }) => {
  return <Login/>;
}

const IntroPage = ({ match }) => {
  return <Intro/>;
}


/* App */

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      doneLooking: false,
    };
  }
  //
  // findUser = () => {
  //     // Check for new user (state change)
  //     firebase.auth().onAuthStateChanged(function(user) {
  //         this.setState({user: user, doneLooking: true});
  //         console.log("Found user: " + user.displayName);
  //         firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
  //         .then(function() {
  //         })
  //         .catch(function(error) {
  //           // Handle Errors here.
  //           var errorCode = error.code;
  //           var errorMessage = error.message;
  //           alert(errorMessage);
  //         });
  //     }.bind(this));
  // }

  componentDidMount() {
     let user = {uid: '123',name: 'john'};
     user = null;
    this.setState({user: user, doneLooking: true});
  }

  pop = () => {
      alert('hi')
  }

  render() {

     let switched_page = this.state.user ?
     (
         <Switch>
             <Route exact path="/" component={ComposerPage} />
            <Route path="*" component={ComposerPage} />
         </Switch>
     ) : (
         <Switch>
            <Route exact path='/' component={IntroPage}/>
            <Route path='/signup' component={SignUpPage}/>
            <Route path='/login' component={LoginPage}/>
            <Route path="*" component={IntroPage} />
         </Switch>
     );

     let loading = <div>hi</div>;

    var footer = (
      <h5>Copyright © 2020 Giveassist Inc.</h5>
    );

    let core_page = this.state.doneLooking ? switched_page : loading;

      return (
        <div >
          <Popup/>

          {core_page}
          {footer}
        </div>
      );


  }



}

ReactDOM.render((
  <BrowserRouter>
    <App />
  </BrowserRouter>
), document.getElementById('root'))


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
