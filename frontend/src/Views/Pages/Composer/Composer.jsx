import React, { Component } from 'react';
import styles from './styles.module.css';

const chunk = (tabbed, analytics, basicInfo, deleteAcct, select) => (
  <div>
    <div className={styles.twoWide}>
      <div className={styles.grid_block + ' ' + styles.two}>{tabbed}</div>
      <div className={styles.grid_block + ' ' + styles.three}>{analytics}</div>
    </div>

    <h1 className={styles.settings}>Settings</h1>
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
    window.history.pushState(null, '', '/');
  }

  componentDidMount() {
    window.scrollTo(0, 0);
  }

  render() {
    return (
      <div className={styles.composer_boundary}>
        {chunk(this.props.tabbed, this.props.analytics, this.props.basicInfo, this.props.deleteAcct, this.props.select)}
      </div>
    );
  }
}
