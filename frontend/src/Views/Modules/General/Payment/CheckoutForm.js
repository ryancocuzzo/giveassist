import React, { Component } from 'react';
import styles from './Styling/styles.module.css';

const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === 'true';

/**
 * Payment card input form.
 * In demo mode, renders a mock card element.
 * In production, this would integrate with Stripe Elements.
 */
class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    if (!(props.onTokenChange || props.onSubmit)) {
      throw new Error('CheckoutForm: no handling function provided!');
    }
    this.state = { width: 0, height: 0, cardFilled: false };
  }

  submit = async () => {
    if (DEMO_MODE) {
      const demoToken = 'tok_demo_' + Date.now();
      if (this.props.onSubmit) this.props.onSubmit(demoToken);
    } else {
      alert('Stripe integration requires production mode.');
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.updateWindowDimensions);
    this.updateWindowDimensions();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.updateWindowDimensions);
  }

  updateWindowDimensions = () => {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  onCardInfoChange = () => {
    if (DEMO_MODE) {
      const demoToken = 'tok_demo_' + Date.now();
      this.setState({ cardFilled: true });
      if (this.props.onTokenChange) this.props.onTokenChange(demoToken);
      if (this.props.onValid) this.props.onValid(demoToken);
    }
  }

  render() {
    const cardElementStyle = {
      padding: '12px',
      border: '1px solid #ccc',
      borderRadius: '4px',
      backgroundColor: '#f9f9f9',
      fontSize: this.state.width > 500 ? '16px' : '14px',
      fontFamily: 'monospace',
      color: '#666',
      marginBottom: '10px'
    };

    return (
      <div className={styles.contained}>
        <div className={styles.inner_contained}>
          <div style={{ width: '100%', height: '3px' }}></div>
          <h4 style={{ lineHeight: '23px' }}>
            This will be securely sent away to a third-party payment processor as an illegible token.
            {' '}<strong>We do not store payment information.</strong>
          </h4>
          {DEMO_MODE ? (
            <div style={cardElementStyle} onClick={this.onCardInfoChange}>
              {this.state.cardFilled
                ? '4242 4242 4242 4242  |  12/25  |  123'
                : 'Click to simulate card entry (DEMO)'}
            </div>
          ) : (
            <div style={cardElementStyle}>Stripe CardElement (production mode)</div>
          )}
          <div style={{ marginTop: '15px' }}>
            <button
              className={styles.submit}
              style={{ display: this.props.notSubmittable ? 'none' : 'block' }}
              onClick={this.submit}
            >
              {this.props.submitText || 'Update'}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default CheckoutForm;
