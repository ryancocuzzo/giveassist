import React, { Component } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import firebase, { auth, provider } from './firebase.js';
import variables from './variables.js';
// import './App.css';

let urls = variables.local_urls;

class IntroPage extends Component {

  constructor(props) {
      super(props);
      window.history.pushState(null, '', '/home')
  }

  render() {
    return (
          <div style={{ backgroundColor: 'rgba(122, 198, 105, 0)', textAlign: 'center', borderRadius: '7px', fontSize: '12px'}}>
            <h1 style={{display: 'inline-block'}}>Welcome</h1><br/>
            <h1 style={{display: 'inline-block'}}>to the</h1><br/>
            <h1 style={{display: 'inline-block'}}>FUTURE</h1><br/>
          <h1 style={{display: 'inline-block'}}>of donation.</h1><br/><br/><br/>
          <Row>
            <Col sm={12} md={6}>
              <Link to={urls.signUp} style={{marginLeft: '60%', width: '20%'}}>
                <button style={{width: '40%', height: '40px'}}> JOIN </button>
              </Link>
            </Col>
            <Col sm={12} md={6}>
              <Link to={urls.login} style={{marginRight: '60%', width: '20%'}}>
                <button  style={{width: '40%', height: '40px'}}> LOGIN </button>
              </Link>
            </Col>
          </Row>
        </div>
    )
  }

}

export default IntroPage;
