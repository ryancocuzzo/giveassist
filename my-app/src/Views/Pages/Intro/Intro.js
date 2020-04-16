import React from 'react';
import styles from './Styling/styles.module.css';
import {SpecificParticledContent} from '../../Modules/General/Particle/ParticleBackground.js';
import imgs from '../../../Helper-Files/ImgFactory';
export default class IntroPage extends React.Component {

    constructor(props) {
        super(props);

      this.whoWeAre =        React.createRef(); // Create a ref
      this.theProblem =      React.createRef(); // Create a ref
      this.theSolution =     React.createRef(); // Create a ref
      this.moneyBreakdown =  React.createRef(); // Create a ref
      this.faq =             React.createRef(); // Create a ref

        window.history.pushState(null, '', '/')

    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    scroll = (to) => {
        window.scrollTo({
            top:to.currentoffsetTop,
            // behavior: "smooth" // optional
        });
    }

    _buffer(top, bottom, color) {
        return <div style={{width: '50%', maxWidth: '500px',height: '3px', marginTop: top + 'px', marginBottom: bottom + 'px', backgroundColor: color}}></div>
    }

    render() {
        let img_size = window.innerWidth > 600 ? 300 : 100;
        let content =
        (<div class={styles.contentcontainer}>
            <h1 class={styles.big}><span class={styles.offcolor}>Donation</span> for everone.</h1>
        <p class={styles.whitepar}>We are a simple, inexpensive, subscription-based donation platform that serves as a dynamic link between you and those who need your help. </p>
            <button class={styles.join}>join</button>
            <button class={styles.login}>login</button>
        </div>);
            return (
        <div class={styles.wrapper}>
            <div class={styles.particlecontainer}>
                {SpecificParticledContent(content, {height: '600px', backgroundColor: 'black', color: 'var(--quartiary)', paddingTop:70})}
            </div>
            <div class={styles.blackWhite + ' ' + styles.gridded} style={{textAlign: 'center'}}>
                <h2>The Problem.</h2>
                <h3>People. Don't. Donate.</h3>
                { this._buffer(30,10,'var(--primary)') }
                <h2>Why?</h2>
                
                {/* Time */}
                { this._buffer(10,30,'var(--quartiary)') }
                <h2 class={styles.topic}>Time</h2>
                { this._buffer(10,10,'transparent') }
                <img src={imgs.clockB} width={img_size} height={img_size} />
                <p class={styles.blackpar}>Getting people the help they need means, first, finding them. The research phase filters out the majority of those considering donation.</p>
                
                {/* Money */}
                { this._buffer(4,4,'transparent') }
                <h2 class={styles.topic}>Money</h2>
                { this._buffer(10,10,'transparent') }
                <img src={imgs.dollarB} width={img_size} height={img_size} />
                <p class={styles.blackpar}>People often think that contributing a little makes little difference. This is just not true, difference-making comes from collaboration.</p>

                {/* Effectiveness */}
                { this._buffer(4,4,'transparent') }
                <h2 class={styles.topic}>Effectiveness</h2>
                { this._buffer(10,10,'transparent') }
                <img src={imgs.earthB} width={img_size} height={img_size} />
                <p class={styles.blackpar}>People want their money going somewhere that matters. Well-advertised does not mean well-run or well-intentioned.</p>
            </div>
            <div class={styles.whiteBlack + ' ' + styles.gridded} style={{textAlign: 'center'}}>
                <h2>The Solution.</h2>
                <p class={styles.whitepar}>With us, you're at the forefront of supplying aid while letting you decide how active a role you want to play. Every month our staff handpicks the most pressing issues at the time, which you then can vote on at any point throughout the month. At the end of the month, money collected from the users goes to the cause with the most votes.</p>
                
                {/* Time */}
                { this._buffer(10,30,'transparent') }
                <h2 class={styles.topic}>Time</h2>
                { this._buffer(10,10,'transparent') }
                <img src={imgs.clockW} width={img_size} height={img_size} />
                <p class={styles.whitepar}>After our lightning-fast sign up flow, there is no more commitment! Forever! While we highly encourage staying active in voting, your impact will remain,regardless of your activity level on the platform.</p>
                
                {/* Money */}
                { this._buffer(4,4,'transparent') }
                <h2 class={styles.topic}>Money</h2>
                { this._buffer(10,10,'transparent') }
                <img src={imgs.dollarW} width={img_size} height={img_size} />
                <p class={styles.whitepar}>We balance our services between affordability and actionability. We believe this eliminates entry barriers and creates the participation levels that would leave lasting impacts.</p>

                {/* Effectiveness */}
                { this._buffer(4,4,'transparent') }
                <h2 class={styles.topic}>Effectiveness</h2>
                { this._buffer(10,10,'transparent') }
                <img src={imgs.earthW} width={img_size} height={img_size} />
                <p class={styles.whitepar}>Every month the cumulative funds raised go to an important cause at that time in specific. So every donor can rest assured that they are making real, important change.</p>
            </div>

            <div class={styles.mostlygridded}>
                <div class={styles['bg-text']+ ' ' + styles.gridded}>
                    <h2>Your Donation</h2>
                    { this._buffer(10,5,'var(--quartiary)') }
                    <p class={styles.whitepar}>
                    We are a nonprofit organization, therefore we only withold operating expenses from direct donation. 
                    Collectively, we guarantee that 91% of your money goes directly to its intended recipient. 
                    We intend on raising this percentage as we scale.
                    </p>
                </div>
            </div>

            <div class={styles['bg-image']}></div>

            <div class={styles.blueYellow}>
                <h1 class={styles.big} style={{color: 'white'}}>Subscriptions start at <span class={styles.offcolor}>$3.99/mo.</span></h1>
                { this._buffer(10,30,'transparent') } 
                <div class={styles.mostlygridded +' ' +styles.listSection}>
                <div class={styles.youWillRecieve}>
                    <ul>
                    <li>Hand-selected Donation options every month</li>
                    <li>Text/Email Updates when it's time to vote</li>
                    <li>Donation Analytics: Where our community and yourself are at in the donation process</li>
                    <li>A simple, delightful interface that makes donaiton easier than ever</li>
                    </ul>
                    <button class={styles.centered_join}>join</button>
                </div>
                </div>
                
            </div>

        </div>
        
            );
    }
}


/*

FAQ
Who are you guys and what do you do?` `
We are a service that allows you to focus on what’s important in your life, while taking an interest in what’s important to the world. We streamline the donation process to only a click a month - from your phone!
Why are you different than what exists?` `
There are a few different things that makes us stand out in the donation space. The first being we are a subscription-based model, allowing for you to make a difference without manual action. Secondly, we vary where the money is donated, each time to a cause that is relevant at the moment, helping us make the greatest impact possible. Lastly, we built our pricing structure to accommodate all different demographics, which we believe is the cornerstone of our model. We believe everyone can be impactful.
Why should I sign up if I can just donate myself?` `
You are donating it yourself, we’re just helping you out! Through our service, you are donating to each cause, but life gets in the way! Sometimes you may forget to donate, or not have time to research where to donate to, and that’s where we come in. We do these things for you, and make this process super easy!
How are the causes for each month chosen?` `
We use our proprietary, custom-built web-scraping technology to do the hard researching for us and, from there, we handpick the causes we feel are most important, recent, and relevant. We factor in the amount of attention a cause is receiving, the magnitude of the cause, and the recency of the emergence of the cause.
Where does the other 9% go?` `
We have operating costs to run the company! We have a bunch of different kinds of expenses (servers, namespaces, marketing, business tools & essentials, employees, etc. ).

All set? Join and become part of the change.










 */
