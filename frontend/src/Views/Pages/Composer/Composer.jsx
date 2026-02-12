import React, { Component } from 'react';
import styles from './styles.module.css';

export default class Composer extends Component {
  constructor(props) {
    super(props);
    if (!props.tabbed || !props.analytics || !props.basicInfo || !props.deleteAcct || !props.select) {
      throw new Error('Composer: Invalid parameters.');
    }
    window.history.pushState(null, '', '/app');
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    const { tabbed, analytics, basicInfo, deleteAcct, select } = this.props;
    
    return (
      <div className={styles.composer_boundary}>
        {/* Main Dashboard Content */}
        <div className={styles.dashboardGrid}>
          <div className={styles.mainColumn}>
            <div className={styles.grid_block}>{tabbed}</div>
          </div>
          
          <div className={styles.sideColumn}>
            <div className={styles.grid_block}>{analytics}</div>
          </div>
        </div>
        
        {/* Settings Section */}
        <div className={styles.settingsSection} style={{ padding: '0 var(--space-8) var(--space-12)' }}>
          <h1 className={styles.settings}>Settings</h1>
          <div className={styles.basic}>
            <div className={styles.grid_block + ' ' + styles.not}>
              {basicInfo}
              <div style={{ marginTop: 'var(--space-10)' }}>{deleteAcct}</div>
            </div>
            <div className={styles.grid_block + ' ' + styles.not}>{select}</div>
          </div>
        </div>
      </div>
    );
  }
}
