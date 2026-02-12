import React, { Component } from 'react';
import styles from './styles.module.css';
import ParticledContent from '../../Modules/General/Particle/ParticleBackground.js';

const chunk = (tabbed, analytics, basicInfo, deleteAcct, select) => (
  <div>
    <div className={styles.twoWide}>
      <div className={styles.grid_block + ' ' + styles.two}>{tabbed}</div>
      <div className={styles.grid_block + ' ' + styles.three}>{analytics}</div>
    </div>

    <h1 className={styles.settings} style={{ textAlign: 'left' }}>Settings</h1>
    <br />

    <div className={styles.twoWide + ' ' + styles.bordered + ' ' + styles.basic}>
      <div className={styles.grid_block + ' ' + styles.four + ' ' + styles.not}>{basicInfo}{deleteAcct}</div>
      <div className={styles.grid_block + ' ' + styles.five + ' ' + styles.not}>{select}</div>
    </div>
  </div>
);

export default class Composer extends Component {
  constructor(props) {
    super(props);
    if (!props.tabbed || !props.analytics || !props.basicInfo || !props.deleteAcct || !props.select) {
      throw new Error('Composer: Invalid parameters.');
    }
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
    if (window.innerWidth > 1100) height = '1600px';
    else if (window.innerWidth > 900) height = '1650px';
    else if (window.innerWidth > 800) height = '1750px';
    else if (window.innerWidth > 650) height = '2850px';
    else if (window.innerWidth > 500) height = '2775px';
    else height = '2825px';

    const content_style = { height };
    const params = { vertCenter: false, horCenter: true, centered: true, particleMargin: '0px' };

    return (
      <div className={styles.composer_boundary}>
        {ParticledContent(
          chunk(this.props.tabbed, this.props.analytics, this.props.basicInfo, this.props.deleteAcct, this.props.select),
          content_style,
          params
        )}
      </div>
    );
  }
}
