import React, { Component } from 'react';
import { Row, Col } from 'react-bootstrap';
import { Link, withRouter} from 'react-router-dom';
import firebase, { auth, provider } from './firebase.js';
import variables from './variables.js';
import TypeWriter from 'react-typewriter';
import imgs from './ImgFactory.js';
import { Parallax, Background } from 'react-parallax';
import Slider, { Range } from 'rc-slider';
import Popup from 'react-popup';
import 'rc-slider/assets/index.css';
import numeral from 'numeral';
import { DropdownButton, MenuItem, Button, ButtonToolbar, ButtonGroup, Navbar, NavItem, NavDropdown, Nav } from 'react-bootstrap';

var numberFormat = (number) => {
  return numeral(number).format('0,0');
}

var dec_numberFormat = (number) => {
  return numeral(number).format('0,0.00');
}

var moneyFormat = (number) => {
  return numeral(number).format('$0,0.00');
}



let urls = variables.local_urls;


class IntroPage extends Component {

  constructor(props) {
      super(props);

      window.history.pushState(null, '', '/home')

      this.whoWeAre =        React.createRef(); // Create a ref
      this.theProblem =      React.createRef(); // Create a ref
      this.theSolution =     React.createRef(); // Create a ref
      this.moneyBreakdown =  React.createRef(); // Create a ref
      this.faq =             React.createRef(); // Create a ref

      this.state = {
        width: document.body.clientWidth,
        sliderVal: 30,
        someVal: this.logslider(30),
        navOpacity: 'rgba(255, 255, 255, 0)',
        navExpanded: false
      };


  }


    /**
     * When the component mounts..
     */
    componentDidMount() {

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

     Popup.create({
         title: 'BETA TESTING',
         content: 'For the month of June we are in a live BETA mode. Nothing changes except we don\'t charge for the month. Live payments turn on July 1st. Enjoy!',
     });

     // this.scrollToMyRef();


    }

    sliderChanged = (val) => {
      this.setState({sliderVal: (val)});
      this.setState({someVal: this.logslider(val)});
    }

  logslider = (position) =>  {
    // position will be between 0 and 100
    var minp = 0;
    var maxp = 1000;

    // The result should be between 100 an 1,000,000
    var minv = Math.log(5);
    var maxv = Math.log(1000000);

    // calculate adjustment factor
    var scale = (maxv-minv) / (maxp-minp);
    var ret = Math.exp(minv + scale*(position-minp))
    console.log(ret);
    return ret;
  }

  calcTakeFromEachUser = (numUsers) => {
    // Set up
    let HIGHEST_CHARGE = 0.90;
    let LOWEST_CHARGE = 0.25;
    let DECREASE_PER_USER = 0.0004;

    let diff = HIGHEST_CHARGE - LOWEST_CHARGE;
    let calculated_cost = diff - (DECREASE_PER_USER * numUsers);
    if (calculated_cost < LOWEST_CHARGE)
      calculated_cost = LOWEST_CHARGE;
    return calculated_cost;
  }

  calcTotalRevenue = (ded_per_user, users) => {
    let MONTHLY_COSTS = 99;
    let INTAKE = ded_per_user * users;
    return (INTAKE - MONTHLY_COSTS > 0 ? 0 : INTAKE - MONTHLY_COSTS);
  }

scrollToWhoWeAre = () => {
  this.closeNav();
    window.scrollTo({
        top:this.whoWeAre.current.offsetTop-65,
        behavior: "smooth" // optional
    });
};

scrollToTheProblem = () => {
  this.closeNav();
    window.scrollTo({
        top:this.theProblem.current.offsetTop-65,
        behavior: "smooth" // optional
    });
};

scrollToTheSolution = () => {
  this.closeNav();
    window.scrollTo({
        top:this.theSolution.current.offsetTop-105,
        behavior: "smooth" // optional
    });
};

scrollToMoneyView = () => {
  this.closeNav();
    window.scrollTo({
        top:this.moneyBreakdown.current.offsetTop-115,
        behavior: "smooth" // optional
    });
};

scrollToFaq = () => {
  this.closeNav();
    window.scrollTo({
        top:this.faq.current.offsetTop-115,
        behavior: "smooth" // optional
    });
};

  // Scroll to ref function
scroll = (to) => {
    window.scrollTo({
        top:to.currentoffsetTop,
        // behavior: "smooth" // optional
    });
};

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
  return <h5 style={{color:'black', fontWeight: '850'}}>{txt}</h5>
    else if (size==5)
   return <h4 style={{color:'black', fontWeight: '850'}}>{txt}</h4>
}

  navigationBar = (margin, textSizeH) => {
    let marginTop = textSizeH < 4 ? '10px' : (textSizeH < 5 ? '8px' : '10px');
    if (this.state.width >= 770) {
      return <Navbar expand="xl" fixedTop collapseOnSelect style={{backgroundColor: this.state.navOpacity, border: 'none', headerStyle: {
            borderBottomWidth: 0,
        }}} className='myNavbar' onToggle={this.setNavExpanded}
                expanded={this.state.navExpanded}>
        <Navbar.Header style={{marginLeft: '', marginTop: '10px'}} pullLeft>
          <img src={imgs.logo_lg} height="50px" className='fixedAdjacentChild' alt="Picture" style={{marginTop: '16px', marginBottom: '20px', marginTop: '20px', borderRadius: '5px'}}></img>

            <Navbar.Toggle className='blackOnHover' style={{height: '50px'}}>
              <h4 style={{marginTop: '7px',height: '50px'}}>JUMP</h4>
            </Navbar.Toggle>
        </Navbar.Header>
        <Navbar.Collapse >
          <Nav pullRight style={{marginTop: marginTop}}>

            <ButtonGroup aria-label="Basic example"  style={{marginTop: marginTop}}>
              <button  className='navigationButton' style={{border: 'none', marginRight: '5px',height: '50px'}} value={this.whoWeAre} onClick={this.scrollToWhoWeAre}>
                {this.dynamicHComponent('WHO WE ARE',textSizeH)}
              </button>
              <span class="divider"></span>


            <button  className='navigationButton' style={{border: 'none', marginRight: '5px',height: '50px'}} value={this.theProblem} onClick={this.scrollToTheProblem}>
              {this.dynamicHComponent('THE PROBLEM',textSizeH)}
              </button>
              <span class="divider"></span>


            <button  className='navigationButton' style={{border: 'none', marginRight: '5px',height: '50px'}} value={this.theSolution} onClick={this.scrollToTheSolution}>
                {this.dynamicHComponent('THE SOLUTION',textSizeH)}

              </button>

              <button  className='navigationButton' style={{border: 'none', marginRight: '5px',height: '50px'}} value={this.moneyBreakdown} onClick={this.scrollToMoneyView}>
                {this.dynamicHComponent('MONEY',textSizeH)}
              </button>

              <button  className='navigationButton' style={{border: 'none', marginRight: '0px',height: '50px'}} value={this.faq} onClick={this.scrollToFaq}>
                {this.dynamicHComponent('FAQ',textSizeH)}
              </button>

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
              <div className='navigationButton2' style={{border: 'none', 'letter-spacing': '2px', width: '220px', marginLeft: '20px',height: '50px', marginTop: '-5px'}} value={this.whoWeAre} onClick={this.scrollToWhoWeAre}>
                {this.dynamicHComponent('WHO WE ARE',textSizeH)}
              </div>
              <div style={{marginLeft: '10%', width: '90%', marginRight: '10%', height: '3px'}}/>
              <span class="divider"></span>


            <div  className='navigationButton2' style={{border: 'none', width: '220px', marginLeft: '20px',height: '50px', marginTop: '7px'}} value={this.theProblem} onClick={this.scrollToTheProblem}>
              {this.dynamicHComponent('THE PROBLEM',textSizeH)}
              </div>
              <div style={{marginLeft: '10%', width: '90%', marginRight: '10%', height: '3px'}}/>

              <span class="divider"></span>


            <div  className='navigationButton2' style={{border: 'none', width: '220px', marginLeft: '20px',height: '50px', marginTop: '7px'}} value={this.theSolution} onClick={this.scrollToTheSolution}>
                {this.dynamicHComponent('THE SOLUTION',textSizeH)}

              </div>
              <div style={{marginLeft: '10%', width: '90%', marginRight: '10%', height: '3px'}}/>


            <div  className='navigationButton2' style={{border: 'none', width: '220px', marginLeft: '20px',height: '50px', marginTop: '7px'}} value={this.moneyBreakdown} onClick={this.scrollToMoneyView}>
                {this.dynamicHComponent('MONEY',textSizeH)}
              </div>

              <div style={{marginLeft: '10%', width: '90%', marginRight: '10%', height: '3px'}}/>


            <div  className='navigationButton2' style={{border: 'none', width: '220px', marginLeft: '20px',height: '50px', marginTop: '7px'}} value={this.faq} onClick={this.scrollToFaq}>
                {this.dynamicHComponent('FAQ',textSizeH)}
              </div>
            </ButtonGroup>





          </Nav>
        </Navbar.Collapse>
      </Navbar>;
    }



  }

  render() {


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
        fontSize: '50px',
        mb: '20px'
      },
      lg: {
        mL: '30%',
        width: '40%',
        fontSize: '90px',
        mb: '30px'
      },
      xl: {
        mL: '35%',
        width: '30%',
        fontSize: '90px',
        mb: '40px'
      },
      xxl: {
        mL: '40%',
        width: '20%',
        fontSize: '100px',
        mb: '50px'
      }
    }

    if (this.state.width < 770)
      this.state.navOpacity = 'white'

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

    if (this.state.width < 750) {
      textSizeH = 3;

    } else if (this.state.width < 1200) {
      textSizeH = 4;

    }

    var buttonsMT = '-5px'
    if (this.state.width > 900) {
      textSizeH = 3;
      buttonsMT = '-15px';
    } else {
      buttonsMT = '-5px'
    }



    let dedection_per_user = dec_numberFormat(this.calcTakeFromEachUser(this.state.someVal));

    var sizeAlertButton = <button onCLick={() => alert(this.state.width)}>SIZE</button>;

      var gap = (this.state.width > 770 ? '140px' : '140px')
      var lh = (this.state.width > 770 ? 0.8 : 1)

      var comp = (
        <div style={{marginBottom: buttonsMT}}>
          <h1 style={{marginLeft: '50px', width: '100%', 'letter-spacing': '1px', lineHeight: lh, marginBottom: correct_dim.mb, fontSize: correct_dim.fontSize}}>Welcome</h1>
        <h1 style={{marginLeft: '50px', width: '100%', 'letter-spacing': '1px', lineHeight:lh, marginBottom: correct_dim.mb, fontSize: correct_dim.fontSize}}>to the</h1>
        <h1 style={{marginLeft: '50px', width: '100%', 'letter-spacing': '1px', lineHeight: lh, marginBottom: correct_dim.mb, fontSize: correct_dim.fontSize, fontWeight: '900'}}> FUTURE</h1>
      <h1 style={{marginLeft: '50px', width: '100%', 'letter-spacing': '1px', lineHeight: lh, marginBottom: buttonsMT, fontSize: correct_dim.fontSize}}>of donation.</h1>
        </div>

    );



    var welcomeAndButtonsComponent = (
      <div style={{fontSize: '12px', width: '100%'}} className='myGradientBackground'>
          {this.navigationBar(navMarginLeft, textSizeH)}
          <div >
            <div style={{width: '100%', height: gap}}></div>
          <div style={{margin: '10px', fontSize: correct_dim.fontSize }}>

              {comp}
              <div style={{width: '100%', height: '60px'}}></div>

            </div>
            </div>

            <Link to={urls.signUp} style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: correct_dim.mL, width: correct_dim.width}}>
              <button style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: '0%', width: correct_dim.width}} > JOIN </button>
            </Link><br/>
            <Link to={urls.login} style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: correct_dim.mL, width: correct_dim.width}}>
              <button style={{fontSize: '22px', fontWeight: 'bold', height: '40px', marginLeft: '0%', width: correct_dim.width}} > LOGIN </button>
            </Link><br/>
          <div style={{width: '100%', height: '150px'}}></div>
      </div>
      )

    var whoWeAreParralaxComponent = (
      <div style={{ borderRadius: '7px', fontSize: '12px', width: '100%'}} className='myGradientBackgroundInverse'  ref={this.whoWeAre}>
        <Parallax className='par'
            blur={10}
            bgImage={imgs.hands_in}
            bgImageAlt="Fox"
            strength={800}
            >
              <div style={{ height: '120px' }} />
            <div style={{color: 'white', textAlign: 'center'}}>
              <h1 style={{color: 'white', display: 'inline-block', width: '100%', 'letter-spacing': '2px'}} >Who we are</h1>
            <h4 style={{ lineHeight: '40px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}><strong>Sparknotes version:</strong> An easy, inexpensive, subscription-based donation platform.
                <strong> Long version:</strong> We are a dynamic link between you and those who need your help. We are a nonprofit donation distribution service that believes
                that large buildings are built using many small bricks, that everyone collaborating drives the most change. For only a dollar or two a month, depending on your selected plan,
                you are immediately a donor contributing to the user-voted most pressing cause of the month (from our handpicked options - more info below).
                We believe everyone can make a difference in the donation space, and now we are looking to prove it.
              </h4>
            </div>

          <div style={{ height: '120px' }} />

        </Parallax>

      </div>
      )

    var problemComponent = (
      <div style={{backgroundColor: 'black'}} ref={this.theProblem}>
        <div style={{color: 'white', textAlign: 'center'}}>
            <br/>
            <h1 style={{color: 'white', display: 'inline-block', width: '100%', 'letter-spacing': '2px',  fontWeight: '600'}} >The Problem.</h1>
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
          <br/>
          <br/>
          <br/>
          <br/>

        </div>
      </div>
      )

    var solutionComponent = (
          <div style={{backgroundColor: 'white'}}>
            <div style={{color: 'black', textAlign: 'center'}}>
              <br/>
            <h1 style={{color: 'black', display: 'inline-block', width: '100%', 'letter-spacing': '2px', fontWeight: '600'}} ref={this.theSolution}>The Solution.</h1><br/>
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
                We push to keep our solution on the less-expensive side. This is because we believe everyone can be a part of change, not just a few select people.
              </h4>
              </Col>
              <Col sm={12} md={4}>
                <h1 style={{color: '#6babc4', fontWeight: '600'}}>Effectiveness</h1>
              <img src={imgs.earthB} width='35%' height='35%' />
                <br/>
                <br/>

              <h4 style={{ lineHeight: '35px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}>
                Every month the cumulative funds raised go to an important cause at that time in specific. So every donor can rest assured that they are making real, important change.
              </h4>
              </Col>
          </Row>
          <br/>
          <br/>
        </div>
      </div>

      )

    var formattedCalculatedRevenue = () => {

    }

    // var moneyAndSliderComponent = (
    //   <div>
    //     <div style={{color: 'black', textAlign: 'center'}}>
    //         <br/>
    //       <h1 style={{color: 'black', display: 'inline-block', width: '90%', marginLeft: '5%',  'letter-spacing': '2px', fontWeight: '600'}} ref={this.moneyBreakdown}>Now for the million dollar quesition...</h1><br/>
    //         <h2 style={{color: 'black', display: 'inline-block', width: '90%',  marginLeft: '5%',  'letter-spacing': '2px', fontWeight: '600'}}>Where is your money going?</h2><br/>
    //       <h4 style={{ lineHeight: '40px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}> <strong>We gaurantee that 90% of your money goes directly to its intended recipient.</strong></h4>
    //
    //     <br/><br/><br/><br/>
    //
    //       {this.state.width > 900 ? (
    //         <Slider
    //             min={1}
    //             max={1000}
    //             step={1}
    //             defaultValue={this.state.sliderVal}
    //             value={(this.state.sliderVal)}
    //             orientation='horizontal'
    //             tooltip={true}
    //             onChange={this.sliderChanged}
    //             style={{ marginLeft: '10%', height: '100px', width: '80%'}}
    //             trackStyle={{height: '60px', background: '#249cb5', background: '-moz-linear-gradient(left, #249cb5 0%, #b3ea8f 100%)', background: '-webkit-linear-gradient(left, #249cb5 0%,#b3ea8f 100%)', background: 'linear-gradient(to right, #249cb5 0%,#b3ea8f 100%)', filter: 'progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#249cb5\', endColorstr=\'#b3ea8f\',GradientType=1 )'}}
    //             railStyle={{height: '60px'}}
    //             handleStyle={{height: '100px', width: '100px', marginTop: '-20px', border: '-moz-linear-gradient(left, #249cb5 0%, #b3ea8f 100%)'}}
    //           ></Slider>
    //       ) : (
    //         <Slider
    //             min={1}
    //             max={1000}
    //             step={1}
    //             defaultValue={this.state.sliderVal}
    //             value={(this.state.sliderVal)}
    //             orientation='horizontal'
    //             tooltip={true}
    //             onChange={this.sliderChanged}
    //             style={{ marginLeft: '15%', height: '100px', width: '70%'}}
    //             trackStyle={{height: '40px', background: '#249cb5', background: '-moz-linear-gradient(left, #249cb5 0%, #b3ea8f 100%)', background: '-webkit-linear-gradient(left, #249cb5 0%,#b3ea8f 100%)', background: 'linear-gradient(to right, #249cb5 0%,#b3ea8f 100%)', filter: 'progid:DXImageTransform.Microsoft.gradient( startColorstr=\'#249cb5\', endColorstr=\'#b3ea8f\',GradientType=1 )'}}
    //             railStyle={{height: '40px'}}
    //             handleStyle={{height: '70px', width: '70px', marginTop: '-15px', border: '-moz-linear-gradient(left, #249cb5 0%, #b3ea8f 100%)'}}
    //           ></Slider>
    //       )
    //     }
    //
    //
    //             <h2><strong>{numberFormat(Math.round(this.state.someVal))}</strong> USERS</h2>
    //           <h2>We deduct {moneyFormat(dedection_per_user)} from each user's donation. </h2>
    //         <h2>Which would make our monthly net gain: <span style={{marginLeft: '9px', fontWeight: '600', 'letter-spacing': '1px', color: this.calcTotalRevenue(dedection_per_user, Math.round(this.state.someVal)) >= 0 ? 'green' : 'red'}}>{moneyFormat(this.calcTotalRevenue(dedection_per_user, Math.round(this.state.someVal)))}</span></h2>
    //
    //           <br/><br/><br/><br/>
    //         </div>
    //   </div>
    //   )
    //

    var moneyAndSliderComponent = (
      <div>
        <div style={{color: 'black', textAlign: 'center'}}>
            <br/>
          <h1 style={{color: 'black', display: 'inline-block', width: '90%', marginLeft: '5%',  'letter-spacing': '2px', fontWeight: '600'}} ref={this.moneyBreakdown}>Now for the million dollar question...</h1><br/>
            <h2 style={{color: 'black', display: 'inline-block', width: '90%',  marginLeft: '5%',  'letter-spacing': '2px', fontWeight: '600'}}>Where is your money going?</h2><br/>
          <h4 style={{ lineHeight: '40px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}> <strong>We guarantee that 91% of your money goes directly to its intended recipient.</strong></h4>

              <br/><br/><br/><br/>
            </div>
      </div>
      )

    var closingComponent = (
      <div style={{color: 'black', textAlign: 'center'}}>
        <br/>
          <h1 style={{color: 'black', display: 'inline-block', width: '90%', marginLeft: '5%', 'letter-spacing': '2px', fontWeight: '600'}}>All set? Join and become part of the change.</h1><br/>
            <br/>
              <Link to={urls.signUp} style={{fontSize: '25px', fontWeight: 'bold', height: '40px', width: correct_dim.width}}>
                <button style={{fontSize: '27px', 'letter-spacing': '2px', fontWeight: 'bold', height: '40px', marginLeft: '0%', width: correct_dim.width}} > JOIN </button>
              </Link><br/>
          <br></br>
          <div style={{ height: '200px' }} />
        <h5 style={{color: 'black', display: 'inline-block', width: '100%', 'letter-spacing': '2px', fontWeight: '600'}}>Copyright @ GiveAssist Inc. 2019.</h5><br/>
          <div style={{ height: '50px' }} />

      </div>
      );

      var faq_q = (question, answer) => (
        <div>
          <h3 style={{color: 'black', display: 'inline-block', width: '90%',  marginLeft: '5%',  'letter-spacing': '2px', fontWeight: '600'}}> {question} </h3>
        ` `<br/>
      <h5 style={{ lineHeight: '35px', 'letter-spacing': '2px',  display: 'inline-block', width: '80%'}}> {answer} </h5>
      <br/>
        </div>
      );

      var faq = (
        <div style={{color: 'black', textAlign: 'center'}} ref={this.faq}>
            <h1 style={{color: 'black', display: 'inline-block', width: '90%', marginLeft: '5%',  'letter-spacing': '2px', fontWeight: '600'}}>FAQ</h1>
          {faq_q('Who are you guys and what do you do?', 'We are a service that allows you to focus on what’s important in your life, while taking an interest in what’s important to the world. We streamline the donation process to only a click a month - from your phone!')}
          {faq_q('Why are you different than what exists?','There are a few different things that makes us stand out in the donation space. The first being we are a subscription-based model, allowing for you to make a difference without manual action. Secondly, we vary where the money is donated, each time to a cause that is relevant at the moment, helping us make the greatest impact possible. Lastly, we built our pricing structure to accommodate all different demographics, which we believe is the cornerstone of our model. We believe everyone can be impactful.')}
          {faq_q('Why should I sign up if I can just donate myself?','You are, we’re just helping you out! Through our service, you are donating to each cause, but life gets in the way! Sometimes you may forget to donate, or not have time to research where to donate to, and that’s where we come in. We do these things for you, and make this process super easy!')}
          {faq_q('How are the causes for each month chosen?','We use our proprietary, custom-built web-scraping technology to do the hard researching for us and, from there, we handpick the causes we feel are most important, recent, and relevant. We factor in the amount of attention a cause is receiving, the magnitude of the cause, and the recency of the emergence of the cause.')}
          {faq_q('Where does the other 9% go?','We have operating costs to run the company! We have a bunch of different kinds of expenses (servers, namespaces,  marketing, business tools & essentials, employees, etc. ).')}
        </div>
      );

    //
    // return (
    //   <div>
    //     {this.navigationBar()}
    //     <div style={{backgroundColor: 'green', height: '400px'}}></div>
    //       <div style={{backgroundColor: 'red', height: '400px'}} ref={this.whoWeAre}></div>
    //     <div style={{backgroundColor: 'blue', height: '400px'}} ref={this.theProblem}></div>
    //
    //   </div>
    // );

    return (
      <div style={{marginRight: '0%', width: '100%'}}>
        {welcomeAndButtonsComponent}
        {whoWeAreParralaxComponent}
        {problemComponent}
        {solutionComponent}
        {moneyAndSliderComponent}
        {faq}

        {closingComponent}
        <br/>

        <div style={{textAlign: 'center'}}>
          <button onClick={() => window.open('https://goo.gl/forms/y8JTxQyvn8LI9NWN2', "_blank")} >REPORT BUG</button>
            <br/>
              <br/>
                <br/>

        </div>
      </div>
    );
  }

}

export default IntroPage;
