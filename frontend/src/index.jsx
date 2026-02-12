import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import './styles/index.css';
import './styles/css_view_transitions.css';
import { firebaseReady } from './Helper-Files/firebase.js';
import Intro from './Views/Pages/Intro/Intro.jsx';
import UISensei from './Views/Pages/Composer/UISensei.jsx';
import SignUp from './Views/Pages/SignUp/SignUp.jsx';
import Login from './Views/Pages/Login/Login.jsx';
import Navbar, { EmptyNavbar } from './Views/Modules/App/Nav/Navbar.jsx';
import services from './Helper-Files/service';
import { getUserInfo, logout, establishPersistence, setupFirebaseUserListener } from './Helper-Files/Temp-DB-Utils.js';
import DemoBanner from './demo/DemoBanner.jsx';

services.createEvent('User');
services.createEvent('Page-Changed');

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

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
    const user = await getUserInfo();
    console.log('user: ' + user?.uid);
    this.setState({ user, doneLooking: true, curr: user ? 'sensei' : 'intro' });
  }

  componentDidMount() {
    this.findUser();

    services.listenEventWithId('User', 'index.js-listener', (user) => {
      console.log('index.js retrieved user status: ' + (user ? user.uid : 'No user found'));
      this.setState({ user, doneLooking: true, curr: user ? 'sensei' : 'intro' });
    });

    services.listenEventWithId('Page-Changed', 'index.js-listener', (page_name) => {
      if (page_name !== this.state.curr) {
        this.setState({ curr: page_name });
      }
    });

    establishPersistence();
    setupFirebaseUserListener();
  }

  render() {
    const { user, doneLooking, curr } = this.state;

    const signupOrLogin = curr === 'signup' || curr === 'login';
    
    let navbar;
    if (signupOrLogin) {
      navbar = <EmptyNavbar titleClickHref="/" />;
    } else if (user) {
      navbar = <Navbar titleClickHref="/" buttonTitle="logout" buttonOnClick={logout} showDashboard={true} />;
    } else {
      navbar = <Navbar titleClickHref="/" buttonTitle="login" buttonOnClick="/login" showDashboard={false} />;
    }

    const loading = <div className="loading">Loading..</div>;

    const footer = (
      <div className="footer">
        <h5>Copyright &copy; 2020 Giveassist Inc.</h5>
      </div>
    );

    const content = doneLooking ? (
      <Routes>
        {user ? (
          <>
            <Route path="/" element={<Intro user={user} />} />
            <Route path="/app" element={<UISensei />} />
            <Route path="*" element={<Navigate to="/app" replace />} />
          </>
        ) : (
          <>
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Intro user={null} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </>
        )}
      </Routes>
    ) : loading;

    return (
      <div className={`css-movement-container${DEMO_MODE ? ' demo-mode' : ''}`}>
        {DEMO_MODE && <DemoBanner />}
        <div className="nav">{navbar}</div>
        <main className="main-content">{content}</main>
        {footer}
      </div>
    );
  }
}

// Wait for firebase to initialize before rendering
firebaseReady.then(() => {
  const container = document.getElementById('root');
  const root = createRoot(container);
  root.render(
    <Router>
      <App />
    </Router>
  );
}).catch((err) => {
  console.error('Failed to initialize firebase:', err);
  document.getElementById('root').innerHTML = '<p>Failed to initialize. Check console.</p>';
});
