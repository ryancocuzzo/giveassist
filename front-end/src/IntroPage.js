import React, { Component } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import firebase, { auth, provider } from './firebase.js';
import variables from './variables.js';
import TypeWriter from 'react-typewriter';
import imgs from './ImgFactory.js';
import { Parallax, Background } from 'react-parallax';

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
      <div>
        <div style={{ borderRadius: '7px', fontSize: '12px', width: '100%'}} className='myGradientBackground'>
              <img src={imgs.logo_lg} height="50px" className='fixedAdjacentChild' alt="Picture" style={{marginTop: '20px', borderRadius: '5px', marginLeft: '20px'}}></img>
              <div style={{textAlign: 'center'}}>
                <br/><br/>
              <TypeWriter typing={0.4} style={{margin: '10px'}}>
                  <h1 style={{display: 'inline-block', width: '100%', marginBottom: correct_dim.mb, fontSize: correct_dim.fontSize}}>Welcome</h1>
                <h1 style={{display: 'inline-block', width: '100%', marginBottom: correct_dim.mb, fontSize: correct_dim.fontSize}}>to the</h1>
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
            <div style={{width: '100%', height: '200px'}}></div>
      </div>
      <div style={{ borderRadius: '7px', fontSize: '12px', width: '100%'}} className='myGradientBackgroundInverse'>
        <Parallax className='par'
            blur={6}
            bgImage={imgs.hands_in}
            bgImageAlt="Fox"
            strength={800}
            >
              <div style={{ height: '150px' }} />
            <div style={{color: 'white', textAlign: 'center'}}>
              <h1 style={{color: 'white', display: 'inline-block', width: '100%', 'letter-spacing': '2px'}}>What we are</h1>
            <h3 style={{ lineHeight: '40px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>Sparknotes version: An easy, inexpensive, subscription-based donation platform.
                Long version: We are a dynamic link between you and those who need your help. We are a nonprofit donation distribution service that believes
                that large buildings are built using many small bricks, that everyone collaborating drives the most change. For only a dollar or two a month, depending on your selected plan,
                you are immediately a donor contributing to the user-voted most pressing cause of the month (from our handpicked options - more info below).
                We believe everyone can make a difference in the donation space, and now we are looking to prove it.
              </h3>
            </div>

          <div style={{ height: '150px' }} />

        </Parallax>

        <div style={{backgroundColor: 'black'}}>
          <div style={{color: 'white', textAlign: 'center'}}>
            <br/>
          <h1 style={{color: 'white', display: 'inline-block', width: '100%', 'letter-spacing': '2px',  fontWeight: '600'}}>The Problem.</h1>
            <h3 style={{ lineHeight: '40px', 'letter-spacing': '2px'}}>3 words.</h3><br/>
          <h2 style={{ lineHeight: '40px', 'letter-spacing': '2px', fontWeight: '400'}}>People. Don't. Donate.</h2><br/>
            <h3 style={{ lineHeight: '40px', 'letter-spacing': '2px'}}>Why?</h3><br/>
          <h3 style={{ lineHeight: '40px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>It's effort-intensive! The research, the physical donating, the tax return documents, etc. can be time-consuming, expensive, and so on. <strong>This is not how the story has to go.</strong> </h3><br/><br/>
        <Row>
          <Col sm={12} md={4}>
            <h1 style={{color: '#6babc4', fontWeight: '600'}}>Time</h1>
          <img src={imgs.clockW} width='35%' height='35%' />
          <br/>
          <br/>

        <h4 style={{ lineHeight: '35px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>
            Getting people the help they need means, firstly, finding them. Next, finding how to get them what they need. Lastly, getting them it.
          </h4>
          </Col>
          <Col sm={12} md={4}>
            <h1 style={{color: '#6babc4', fontWeight: '600'}}>Money</h1>
          <img src={imgs.dollarW} width='35%' height='35%' />
            <br/>
            <br/>

          <h4 style={{ lineHeight: '35px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>
            People often think that contributing a little makes little difference. This is just not true, but becomes true when everyone adopts
            this mentality and nobody steps forward.
          </h4>
          </Col>
          <Col sm={12} md={4}>
            <h1 style={{color: '#6babc4', fontWeight: '600'}}>Effectiveness</h1>
          <img src={imgs.earthW} width='35%' height='35%' />
            <br/>
            <br/>

          <h4 style={{ lineHeight: '35px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>
            People want their money going somewhere that matters. Often times the places that do the best advertising
            are not necessarily the ones that need help the most.
          </h4>
          </Col>
        </Row>
        <br/>        <br/>
        <br/>
        <br/>

          </div>
        </div>
        <div style={{backgroundColor: 'white'}}>
          <div style={{color: 'black', textAlign: 'center'}}>
            <br/>
          <h1 style={{color: 'black', display: 'inline-block', width: '100%', 'letter-spacing': '2px', fontWeight: '600'}}>The Solution.</h1><br/>
        <h4 style={{ lineHeight: '40px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}> Our platform lets all users be at the forefront of giving aid to those who need it while letting you decide how active a role you want
              to play in where the money goes each month. Every month our staff handpicks the most pressing issues at the time, which the users then
              can vote on at any point throughout the month. At the end of the month, money collected from the users goes to the cause with the most votes.
            </h4>
            <br/>
        <Row>
          <Col sm={12} md={4}>
            <h1 style={{color: '#6babc4', fontWeight: '600'}}>Time</h1>
          <img src={imgs.clockB} width='35%' height='35%' style={{color: 'black'}}/>
            <br/>
            <br/>

          <h4 style={{ lineHeight: '35px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>
            After signing up in our quick, minimalistic sign up flow, there is no more commitment! Forever! You, from that point forward, will be a perpetual
            donor to the places that need the most urgent help. You are, however, highly encouraged to stay active in voting so we get the donation to the right place!

          </h4>

          </Col>
          <Col sm={12} md={4}>
            <h1 style={{color: '#6babc4', fontWeight: '600'}}>Money</h1>
          <img src={imgs.dollarB} width='35%' height='35%' />
            <br/>
            <br/>

          <h4 style={{ lineHeight: '35px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>
            Our solution is, generally speaking, on the less expensive side. This is because believe everyone can be a part of change, not just a few select people.
          </h4>
          </Col>
          <Col sm={12} md={4}>
            <h1 style={{color: '#6babc4', fontWeight: '600'}}>Effectiveness</h1>
          <img src={imgs.earthB} width='35%' height='35%' />
            <br/>
            <br/>

          <h4 style={{ lineHeight: '35px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>
            Every month the cumulative funds raised go to an important cuase at that time in specific. So every donor can rest assured that they are making real, important change.
          </h4>
          </Col>
        </Row>
        <br/>
        <br/>
        <div style={{color: 'black', textAlign: 'center'}}>
          <br/>
        <h1 style={{color: 'black', display: 'inline-block', width: '100%', 'letter-spacing': '2px', fontWeight: '600'}}>Now for the million dollar quesition...</h1><br/>
      <h2 style={{color: 'black', display: 'inline-block', width: '100%', 'letter-spacing': '2px', fontWeight: '600'}}>Where is your money going?</h2><br/>
    <h4 style={{ lineHeight: '40px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}> Short answer: To wherever users vote it to.. mostly. (Longer answer) The only hitch
      in this is that we do have to at least partially cover operating costs of about $120 a month. This is to pay for servers, business/domain fees, and our awesome developers :).
      We are a nonprofit, so we are not going to intake more than just the minimum to cover our expenses.
      As we get more users, we will take less per user until we are taking only a very small portion of each user's monthly contribution. As our operating costs are sizeable,
      we accept that we will take a loss until our user base hits a certain threshold. We will never take more than $0.60 per donation, but that number comes down veyr rapidly as the user base grows even only a little.
          </h4>
        </div>

          </div>
        </div>

        <div style={{color: 'black', textAlign: 'center'}}>
          <br/>
        <h1 style={{color: 'black', display: 'inline-block', width: '100%', 'letter-spacing': '2px', fontWeight: '600'}}>All set? Join and become part of the change.</h1><br/>
          <br/>
        <Link to={urls.signUp} style={{fontSize: '22px', fontWeight: 'bold', height: '40px', display: 'inline-block',width: correct_dim.width}}>
            <button style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: '0%', width: correct_dim.width}} > JOIN </button>
          </Link><br/>
        <br></br>
      <div style={{ height: '200px' }} />
    <h5 style={{color: 'black', display: 'inline-block', width: '100%', 'letter-spacing': '2px', fontWeight: '600'}}>Copyright @ giveassist LLC 2018.</h5><br/>
      <div style={{ height: '50px' }} />

        </div>

      </div>
      </div>


    )
  }

}

export default IntroPage;
