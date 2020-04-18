import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';
import axios from 'axios';
import Popup from 'react-popup';
import styles from './Styling/styles.module.css';

class CheckoutForm extends Component {
    /* onValid(), onTokenChange() */
    constructor(props) {
        super(props);
        if (!(props.onTokenChange || props.onSubmit)) throw 'CheckoutForm Error: no handling function provided!';
         this.state = { width: 0, height: 0 };
    }

  submit = async (ev) => {
    let {token} = await this.props.stripe.createToken();
    if (token)
      this.props.onSubmit(token.id);
    else
      Popup.alert('Your payment information is invalid!')
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

  onCardInfoChange = async (ev) => {
      let {token} = await this.props.stripe.createToken();
      if (this.props.onTokenChange)
        this.props.onTokenChange(token?.id);
      if (token && this.props.onValid)
        this.props.onValid(token.id);
  }

  render() {
      let card_style = (this.state.width > 500 ) ? {base: {fontSize: '22px'}} :{base: {fontSize: '17px'}}; //{base: {fontSize: '22px'}, margin: 'auto', width: '100%'}
    return (
      <div class={styles.contained}>
        <Popup />
        <div class={styles.inner_contained}>
            <div style={{width: '100%', height: '3px'}}></div>
            <h4 style={{lineHeight: '23px'}}>This will be securely sent away to a third-party payment processor as an illegible token. <strong>We do not store payment information.</strong> </h4>
        <CardElement onChange={this.onCardInfoChange} style={card_style} />            <div style={{marginTop: '15px'}}>
            <button class={styles.submit} style={{display: this.props.notSubmittable ? 'none' : 'block'}} onClick={this.submit}>{this.props.submitText || 'Update'}</button>
            </div>
        </div>
       </div>
    );
  }
}

export default injectStripe(CheckoutForm);
