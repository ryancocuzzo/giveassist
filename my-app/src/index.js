import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router, Link, Route, Switch} from 'react-router-dom';
import Popup from 'react-popup';
import './styles/index.css';
import './styles/css_view_transitions.css';
import './styles/popup_styles.css';
import Intro from './Views/Pages/Intro/Intro.js';
import UISensei from './Views/Pages/Composer/UISensei.js';
import SignUp from './Views/Pages/SignUp/SignUp.js';
import Login from './Views/Pages/Login/Login.js';
import Navbar, {EmptyNavbar} from './Views/Modules/App/Nav/Navbar.js';
import services from './Helper-Files/service';
import { getUserInfo, logout } from './Helper-Files/Temp-DB-Utils.js';
import CheckoutForm from './Views/Modules/General/Payment/CheckoutForm.js';
import { CSSTransition } from 'react-transition-group';
// // import * as serviceWorker from './serviceWorker';

services.createEvent('User');
services.createEvent('Page-Changed');

/*          <Switch>
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

         const routes = [
           { path: '/', name: 'One', Component: Home, parentRoutes: [], childRoutes: ['two'] },
           { path: '/two', name: 'Two', Component: About, parentRoutes: ['/one'], childRoutes: ['/three']  },
           { path: '/three', name: 'Three', Component: Contact, parentRoutes: ['/two'], childRoutes: []  },
           { path: '*', name: 'Four', Component: Home, parentRoutes: ['/three'], childRoutes: []  },
         ]

*/

/* Pages */

let x = <UISensei/>

const routes_loggedIn = [
    { path: '*', name: 'sensei', Component: UISensei, parentRoutes: ['login', 'signup'], childRoutes: ['intro'] },
];

const routes_notLoggedIn = [
    { path: '/signup', name: 'signup', Component: SignUp, parentRoutes: ['intro'], childRoutes: ['login','sensei'] },
    { path: '/login', name: 'Login', Component: Login, parentRoutes: ['intro'], childRoutes: ['signup','sensei'] },
    { path: '/', name: 'intro', Component: Intro, parentRoutes: [], childRoutes: ['login','signup'] },
];

/* handle pages */

function handled_page_render(name, component) {
    services.triggerEvent('Page-Changed', name);
    return < component />;
}

/* App */

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      user: null,
      doneLooking: false,
      curr: null
    };
  }

  findUser = async () => {
      let user = await getUserInfo();
      // console.log('user -> ' + user ? JSON.stringify(user, null, 3) : 'null');
      // alert(user)
      this.setState({user: user, doneLooking: true, curr: user ? 'sensei' : 'intro'});
      // Check for new user (state change)
      // firebase.auth().onAuthStateChanged(function(user) {
      //     this.setState({user: user, doneLooking: true});
      //     console.log("Found user: " + user.displayName);
      //     firebase.auth().setPersistence(firebase.auth.Auth.Persistence.LOCAL)
      //     .then(function() {
      //     })
      //     .catch(function(error) {
      //       // Handle Errors here.
      //       var errorCode = error.code;
      //       var errorMessage = error.message;
      //       alert(errorMessage);
      //     });
      // }.bind(this));
  }

  componentDidMount() {
      this.findUser(); // check if one is present immediately
      // get user status updates
      services.listenEventWithId('User', 'index.js-listener', (user) => {
          console.log('index.js retrieved user status!\n\tUser info: ' + (user ? JSON.stringify(user) : 'No user found!'));
          this.setState({user: user, doneLooking: true, curr: user ? 'sensei' : 'intro'});
      });
      services.listenEventWithId('Page-Changed', 'index.js-listenere', (page_name) => {
          // console.log('page name: ' + page_name);
          if (page_name != this.state.curr) {
              // console.log(this.state.curr + ' -> ' + page_name)
            this.setState({curr: page_name});
          }
      });
  }

  render() {
      // let switched_page = <div>huncho</div>;
     // let switched_page = this.state.user ?
     // (
     //     <div>
     //         {routes_loggedIn.map(({path, name, component}) => ( // handle 'exact' here + w/ 'exact' prop in routes_loggedIn
     //             <Route key={path} path={path} component={handled_page_render(name, component)} />
     //         ))}
     //     </div>
     // ) : (
     //     <div>
     //         {routes_notLoggedIn.map(({path, name, component}) => (
     //             <Route key={path} path={path} component={handled_page_render(name, component)} />
     //         ))}
     //     </div>
     // );
     //
     // let switched_page = routes_loggedIn.map(({path, name, component}) => { // handle 'exact' here + w/ 'exact' prop in routes_loggedIn
     //            // console.log('\nGenerated page: \n\tName: ' + name + '\n\tPath: ' + path + '\n\tComp: ' + JSON.stringify(handled_page_render(name, component)))
     //             let x = <Route key={path} path={path} component={handled_page_render(component)} />;
     //             return <div>{x}</div>
     //         });
     // alert(this.state.curr)
    let switched_page = this.state.user ?
        routes_loggedIn.map(({ path, name, Component }) => {
            console.log(name + ' vs ' + this.state.curr);
            return <Route key={path} exact path={path}>
              {({ match }) => (
                <CSSTransition
                  in={match !== null}
                  timeout={500}
                  classNames="page"
                  unmountOnExit
                >
                  <div className="page">
                    < Component />
                  </div>
                </CSSTransition>
              )}
            </Route>
        })
         : /* else */
         routes_notLoggedIn.map(({ path, name, Component }) => {
             console.log(name + ' vs ' + this.state.curr);
             return <Route key={path} exact path={path}>
               {({ match }) => (
                 <CSSTransition
                   in={match !== null}
                   timeout={500}
                   classNames="page"
                   unmountOnExit
                 >
                   <div className="page">
                     < Component />
                   </div>
                 </CSSTransition>
               )}
             </Route>
         })


     /* Navbar element */
     let signupOrLogin = this.state.curr === 'signup' || this.state.curr === 'login';
     const navbar =
        signupOrLogin ? EmptyNavbar('give','assist','/')
        : /* else if */ (this.state.user ?
                        Navbar("give","assist",'logout', '/', logout)
        : /* else */    Navbar("give","assist",'login', '/', '/login'));

     let loading = <div>Loading..</div>;

    var footer = (
      <div class="footer">
        <h5>Copyright © 2020 Giveassist Inc.</h5>
      </div>
    );

    let core_page = this.state.doneLooking ? <div class="css-movement-container">{switched_page}</div> : loading;

      return (
        <div class="css-movement-container">
          <Popup/>
      <div class="nav">{navbar}</div>
          {core_page}
          {footer}
        </div>
      );


  }



}

ReactDOM.render((
  <Router>
    <App />
  </Router>
), document.getElementById('root'))

// const routes = [
//   { path: '/', name: 'One', Component: Home, parentRoutes: [], childRoutes: ['two'] },
//   { path: '/two', name: 'Two', Component: About, parentRoutes: ['/one'], childRoutes: ['/three']  },
//   { path: '/three', name: 'Three', Component: Contact, parentRoutes: ['/two'], childRoutes: []  },
//   { path: '*', name: 'Four', Component: Home, parentRoutes: ['/three'], childRoutes: []  },
// ]



// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
//serviceWorker.unregister();
