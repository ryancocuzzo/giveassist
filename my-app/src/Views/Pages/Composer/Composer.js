import React, {Component} from 'react';
import styles from './styles.module.css';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';

// import {navbar,tabbed,analytics,basicInfo,select,deleteAcct} from '../../../Views-Test-Files/Test-Components/Components.js';

var chunk = (tabbed, analytics, basicInfo, deleteAcct, select) => (
    <div >
        <div class={styles.twoWide}>
            <div class={styles.grid_block + " " + styles.two}>{tabbed}</div>
        <div class={styles.grid_block + " " + styles.three}>{analytics}</div>
        </div>

        <h1 class={styles.settings} style={{textAlign: 'left'}}>Settings</h1>
        <br/>

    <div class={styles.twoWide + " " + styles.bordered + " " + styles.basic}>
            <div class={styles.grid_block + " " + styles.four + " " + styles.not}>{basicInfo}{deleteAcct}</div>
        <div class={styles.grid_block + " " + styles.five + " " + styles.not}>{select}</div>
        </div>
    </div>
);

export default class Composer extends Component {
    /* tabbed, analytics, basicInfo, deleteAcct, select */
    constructor(props) {
        super(props);
        if (!props.tabbed || !props.analytics || !props.basicInfo || !props.deleteAcct || !props.select) throw 'Composer Issue: Invalid parameters.';
        this.state = { width: 0, height: 0 };
        window.history.pushState(null, '', '/');
    }

    componentDidMount() {
        window.scrollTo(0, 0);
      this.updateWindowDimensions();
      window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
      this.setState({ width: window.innerWidth, height: window.innerHeight });
    }
    render() {

        let height;
        // depends on width this time
        if (window.innerWidth > 1100 ) height = '1575px';
        else if (window.innerWidth > 900 ) height = '1625px';
        else if (window.innerWidth > 800 ) height = '1725px';
        else if (window.innerWidth > 500 ) height = '2775px';
        else height = '2800px';

        // let mobile = window.innerHeight < 650;
        // var isSafari, height;
        // var ua = navigator.userAgent.toLowerCase();
        // if (ua.indexOf('safari') != -1) {
        //   if (ua.indexOf('chrome') > -1) {
        //     isSafari = false; // Chrome
        //   } else {
        //     isSafari = true; // Safari
        //   }
        // }
        // // alert(mobile + " " + isSafari)
        // if (!mobile && !isSafari)
        //     height = (window.innerHeight * 1) + 'px';
        // if (mobile && !isSafari)
        //     height = (window.innerHeight * 1.4) + 'px';
        // if (mobile && isSafari)
        //     height = (window.innerHeight * 2.1) + 'px';
        // if (!mobile && isSafari)
        //     height = (window.innerHeight * 1.6) + 'px';

        let content_style = {
            height: height,
         };
          let params = {
            vertCenter: false,
            horCenter: true,
            centered: true,
            particleMargin: '0px',
          };


        return (
            <div class={styles.composer_boundary}>
            {ParticledContent(chunk(this.props.tabbed, this.props.analytics, this.props.basicInfo, this.props.deleteAcct, this.props.select), content_style, params)}
            </div>
        );
    }
}
