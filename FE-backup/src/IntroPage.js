import React, { Component } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import firebase, { auth, provider } from './firebase.js';
import variables from './variables.js';
import TypeWriter from 'react-typewriter';

let urls = variables.local_urls;

class IntroPage extends Component {

  constructor(props) {
      super(props);
      this.state = {
        width: document.body.clientWidth
      };

      window.history.pushState(null, '', '/home')
  }


    /**
     * When the component mounts..
     */
    componentDidMount() {

      window.addEventListener("resize", function(event) {
        this.setState({width: document.body.clientWidth});
      }.bind(this))

    }

  render() {
    var fontSize = '20px';
    var col_width_wide = '50%';
    var margin = '25%';
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

    if (this.state.width < 700) {
      correct_dim = dim.sm;
    } else if (this.state.width >= 700 && this.state.width < 1000) {
      correct_dim = dim.lg;
    } else if (this.state.width >= 1000 && this.state.width < 1300) {
      correct_dim = dim.xl;
    } else {
      correct_dim = dim.xxl;
    }


    return (
          <div style={{ borderRadius: '7px', fontSize: '12px', width: '100%'}} className='myGradientBackground'>
            <div style={{textAlign: 'center'}}>
              <br/><br/>
              <TypeWriter typing={0.35} style={{margin: '10px'}}>
                <h1 style={{display: 'inline-block', width: '100%', marginBottom: correct_dim.mb, fontSize: correct_dim.fontSize}}>Welcome to</h1>
                <h1 style={{display: 'inline-block', width: '100%', marginBottom: correct_dim.mb, fontSize: correct_dim.fontSize}}>the</h1>
              <h1 style={{display: 'inline-block', width: '100%', marginBottom: correct_dim.mb, fontSize: correct_dim.fontSize, fontWeight: '900'}}> FUTURE</h1>
            <h1 style={{display: 'inline-block', width: '100%', marginBottom: '10px', fontSize: correct_dim.fontSize}}>of donation.</h1>
<br/><br/><br/><br/>
            </TypeWriter>
            </div>

        <Link to={urls.signUp} style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: correct_dim.mL, width: correct_dim.width}}>
          <button style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: '0%', width: correct_dim.width}} > JOIN </button>
        </Link><br/>
        <Link to={urls.login} style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: correct_dim.mL, width: correct_dim.width}}>
          <button style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: '0%', width: correct_dim.width}} > LOGIN </button>
        </Link><br/>
      <div style={{width: '100%', height: '300px'}}></div>

        </div>

    )
  }

}

export default IntroPage;
