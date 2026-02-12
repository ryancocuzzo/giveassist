import React from 'react';
import styles from './Styling/styles.module.css';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';
import imgs from '../../../Helper-Files/ImgFactory';
import { Link } from 'react-router-dom';

export default class IntroPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = { width: window.innerWidth };
    this.whoWeAre = React.createRef();
    this.theProblem = React.createRef();
    this.theSolution = React.createRef();
    this.moneyBreakdown = React.createRef();
    this.faq = React.createRef();
    window.history.pushState(null, '', '/');
  }

  componentDidMount() {
    window.scrollTo(0, 0);
    window.addEventListener('resize', () => this.setState({ width: window.innerWidth }));
  }

  _buffer(top, bottom, color) {
    return <div style={{ width: '50%', maxWidth: '400px', height: '3px', marginTop: top + 'px', marginBottom: bottom + 'px', backgroundColor: color }}></div>;
  }

  render() {
    const img_size = this.state.width > 600 ? 150 : 100;

    const content = (
      <div className={styles.contentcontainer}>
        <h1 className={styles.big}><span className={styles.offcolor}>Donation</span> for everyone.</h1>
        <p className={styles.whitepar}>We are a simple, inexpensive, subscription-based donation platform that serves as a dynamic link between you and those who need your help.</p>
        <div className={styles.buttonsview}>
          <Link to="/signup"><button className={styles.join}>join</button></Link>
          <Link to="/login"><button className={styles.login}>login</button></Link>
        </div>
      </div>
    );

    const fullscreen_split_grid = (
      <div>
        <div className={styles.blackWhite} style={{ textAlign: 'center' }}>
          <div className={styles.threeSplitGrid}>
            <h2 className={styles.topic}>Time</h2>
            <h2 className={styles.topic}>Money</h2>
            <h2 className={styles.topic}>Effectiveness</h2>
            <img src={imgs.clockB} width={img_size} height={img_size} alt="Time" />
            <img src={imgs.dollarB} width={img_size} height={img_size} alt="Money" />
            <img src={imgs.earthB} width={img_size} height={img_size} alt="Effectiveness" />
            <p className={styles.blackpar}>Getting people the help they need means, first, finding them. The research phase filters out the majority of those considering donation.</p>
            <p className={styles.blackpar}>People often think that contributing a little makes little difference. This is just not true, making a difference comes from collaboration.</p>
            <p className={styles.blackpar}>People want their money going somewhere that matters. Well-advertised does not mean well-run or well-intentioned.</p>
          </div>
        </div>
        <div className={styles.whiteBlack + ' ' + styles.gridded} style={{ textAlign: 'center' }}>
          <h2>The Solution.</h2>
          <p className={styles.whitepar}>With us, you're at the forefront of supplying aid while letting you decide how active a role you want to play. Every month our staff handpicks the most pressing issues at the time, which you then can vote on at any point throughout the month. At the end of the month, money collected from the users goes to the cause with the most votes.</p>
          {this._buffer(10, 30, 'transparent')}
          <div className={styles.threeSplitGrid}>
            <h2 className={styles.topic}>Time</h2>
            <h2 className={styles.topic}>Money</h2>
            <h2 className={styles.topic}>Effectiveness</h2>
            <img src={imgs.clockW} width={img_size} height={img_size} alt="Time" />
            <img src={imgs.dollarW} width={img_size} height={img_size} alt="Money" />
            <img src={imgs.earthW} width={img_size} height={img_size} alt="Effectiveness" />
            <p className={styles.whitepar}>After our lightning-fast sign up flow, there is no more commitment! Forever! While we highly encourage staying active in voting, your impact will remain, regardless of your activity level on the platform.</p>
            <p className={styles.whitepar}>We balance our services between affordability and actionability. We believe this eliminates entry barriers and creates the participation levels that would leave lasting impacts.</p>
            <p className={styles.whitepar}>Every month the cumulative funds raised go to an important cause at that time in specific. So every donor can rest assured that they are making real, important change.</p>
          </div>
        </div>
      </div>
    );

    const mobile_split_grid = (
      <div>
        <div className={styles.blackWhite + ' ' + styles.gridded}>
          <div className={styles.gridblock}>
            <h2 className={styles.topic}>Time</h2>
            {this._buffer(10, 10, 'transparent')}
            <img src={imgs.clockB} width={img_size} height={img_size} alt="Time" />
            <p className={styles.blackpar}>Getting people the help they need means, first, finding them. The research phase filters out the majority of those considering donation.</p>
          </div>
          <div className={styles.gridblock}>
            {this._buffer(4, 4, 'transparent')}
            <h2 className={styles.topic}>Money</h2>
            {this._buffer(10, 10, 'transparent')}
            <img src={imgs.dollarB} width={img_size} height={img_size} alt="Money" />
            <p className={styles.blackpar}>People often think that contributing a little makes little difference. This is just not true, making a difference comes from collaboration.</p>
          </div>
          <div className={styles.gridblock}>
            {this._buffer(4, 4, 'transparent')}
            <h2 className={styles.topic}>Effectiveness</h2>
            {this._buffer(10, 10, 'transparent')}
            <img src={imgs.earthB} width={img_size} height={img_size} alt="Effectiveness" />
            <p className={styles.blackpar}>People want their money going somewhere that matters. Well-advertised does not mean well-run or well-intentioned.</p>
          </div>
        </div>
        <div className={styles.whiteBlack + ' ' + styles.gridded} style={{ textAlign: 'center' }}>
          <h2>The Solution.</h2>
          <p className={styles.whitepar}><span style={{ color: 'var(--quartiary)' }}>Simple, affordable, regular donation.</span> Every month our staff handpicks the most pressing issues at the time, which you then can vote on at any point throughout the month. At the end of the month, money collected from the users goes to the cause with the most votes.</p>
          {this._buffer(10, 30, 'transparent')}
        </div>
        <div className={styles.whiteBlack + ' ' + styles.gridded}>
          <div className={styles.gridblock}>
            <h2 className={styles.topic}>Time</h2>
            {this._buffer(10, 10, 'transparent')}
            <img src={imgs.clockW} width={img_size} height={img_size} alt="Time" />
            <p className={styles.whitepar}>After our lightning-fast sign up flow, there is no more commitment! Forever! While we highly encourage staying active in voting, your impact will remain, regardless of your activity level on the platform.</p>
          </div>
          <div className={styles.gridblock}>
            {this._buffer(4, 4, 'transparent')}
            <h2 className={styles.topic}>Money</h2>
            {this._buffer(10, 10, 'transparent')}
            <img src={imgs.dollarW} width={img_size} height={img_size} alt="Money" />
            <p className={styles.whitepar}>We balance our services between affordability and actionability. We believe this eliminates entry barriers and creates the participation levels that would leave lasting impacts.</p>
          </div>
          <div className={styles.gridblock}>
            {this._buffer(4, 4, 'transparent')}
            <h2 className={styles.topic}>Effectiveness</h2>
            {this._buffer(10, 10, 'transparent')}
            <img src={imgs.earthW} width={img_size} height={img_size} alt="Effectiveness" />
            <p className={styles.whitepar}>Every month the cumulative funds raised go to an important cause at that time in specific. So every donor can rest assured that they are making real, important change.</p>
          </div>
        </div>
      </div>
    );

    const check = <span className="material-icons" style={{ fontSize: '40px', paddingTop: '40px', color: 'var(--quartiary)', marginRight: '3px' }}>done</span>;

    const content_style = {
      height: this.state.width > 350 ? '550px' : '530px',
      backgroundColor: 'black',
      color: 'var(--quartiary)'
    };
    const params = { vertCenter: false, centered: true, particleMargin: '0px 0px 0px 0px' };

    return (
      <div className={styles.wrapper}>
        <div className={styles.particlecontainer}>
          {ParticledContent(content, content_style, params)}
        </div>
        <div className={styles.blackWhite + ' ' + styles.gridded} style={{ textAlign: 'center' }}>
          <h2>The Problem.</h2>
          <h3>People. Don't. Donate.</h3>
          {this._buffer(30, 10, 'var(--primary)')}
          <h2>Why?</h2>
          {this._buffer(15, 30, 'var(--quartiary)')}
        </div>

        {this.state.width > 625 ? fullscreen_split_grid : mobile_split_grid}

        <div className={styles.mostlygridded}>
          <div className={styles['bg-text'] + ' ' + styles.gridded}>
            <h2>Your Donation</h2>
            {this._buffer(10, 5, 'var(--quartiary)')}
            <p className={styles.whitepar}>
              We are a nonprofit organization, therefore we only withhold operating expenses from direct donation.
              100% of proceeds will go to its intended recipient.
            </p>
          </div>
        </div>

        <div className={styles['bg-image']}></div>

        <div className={styles.blueYellow}>
          {this._buffer(50, 50, 'transparent')}
          <h1 className={styles.big} style={{ color: 'white', marginLeft: this.state.width > 700 ? '50px' : '20px' }}>Subscriptions start at <span className={styles.offcolor}>$2.99/mo.</span></h1>
          {this._buffer(10, 30, 'transparent')}
          <div className={styles.mostlygridded}>
            <div className={styles.mostlygridded + ' ' + styles.listSection}>
              <div className={styles.youWillRecieve}>
                <ul>
                  <li>{check}Hand-selected donation options every month</li>
                  <li>{check}Text/Email updates when it's time to vote</li>
                  <li>{check}Donation Analytics: Where our community and yourself are at in the donation process</li>
                  <li>{check}A simple, delightful interface that makes donation easier than ever</li>
                </ul>
                <Link to="/signup"><button className={styles.centered_join}>join</button></Link>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.blackWhite + ' ' + styles.gridded} style={{ textAlign: 'center' }}>
          <h2>Questions?</h2>
          <h3>Please feel free to reach our support team at <a href="mailto:admin@giveassist.org?Subject=Questions" target="_top">admin@giveassist.org</a></h3>
          {this._buffer(10, 10, 'transparent')}
          <h2>Looking for Updates?</h2>
          <h3>Follow us on our Socials</h3>
          <div className={styles.socials}>
            <div className={styles.insta} onClick={() => window.open('https://www.instagram.com/giveassist/', '_blank')}></div>
            <div className={styles.twitter} onClick={() => window.open('https://twitter.com/give_assist/', '_blank')}></div>
            <div className={styles.fb} onClick={() => window.open('https://www.facebook.com/give.assist', '_blank')}></div>
          </div>
        </div>
      </div>
    );
  }
}
