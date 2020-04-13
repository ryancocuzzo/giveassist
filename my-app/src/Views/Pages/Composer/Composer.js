import React, {Component} from 'react';
import styles from './styles.css';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';

// import {navbar,tabbed,analytics,basicInfo,select,deleteAcct} from '../../../Views-Test-Files/Test-Components/Components.js';

var chunk = (tabbed, analytics, basicInfo, deleteAcct, select) => (
    <div >
        <div class="twoWide">
            <div class="grid_block two">{tabbed}</div>
            <div class="grid_block three">{analytics}</div>

        </div>

        <h1 class="settings" style={{textAlign: 'left'}}>Settings</h1>
        <br/>

        <div class="twoWide bordered basic">
            <div class="grid_block four not">{basicInfo}{deleteAcct}</div>
            <div class="grid_block five not">{select}</div>
        </div>
    </div>
);

export default class Composer extends Component {
    /* tabbed, analytics, basicInfo, deleteAcct, select */
    constructor(props) {
        super(props);
        if (!props.navbar || !props.tabbed || !props.analytics || !props.basicInfo || !props.deleteAcct || !props.select) throw 'Composer Issue: Invalid parameters.';
        this.state = { width: 0, height: 0 };
        window.history.pushState(null, '', '/home')
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
        if (window.innerWidth > 1100 ) height = '1500px';
        else if (window.innerWidth > 900 ) height = '1550px';
        else if (window.innerWidth > 800 ) height = '1650px';
        else if (window.innerWidth > 500 ) height = '2700px';
        else height = '2750px';
        return (
            <div class="composer_boundary">
            <div class="one not nav">{this.props.navbar}</div>
            {ParticledContent(chunk(this.props.tabbed, this.props.analytics, this.props.basicInfo, this.props.deleteAcct, this.props.select), {width: '100%', height: height})}
            </div>
        );
    }
}
