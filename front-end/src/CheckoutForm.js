import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';
import axios from 'axios';
import Popup from 'react-popup';

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
  }

  async submit(ev) {
    console.log(ev)
    console.log(this.props.stripe);
    let {token} = await this.props.stripe.createToken();
    console.log(token);
    if (token)
      this.props.onSignUp(token.id);
    else
      Popup.alert('Your payment information is invalid!')
}

  render() {
    return (
      <div className="checkout">
        <Popup />
      <h4 style={{'letter-spacing': '1px', lineHeight: '20px'}}>Please enter your payment information into our <span style={{fontWeight: '600'}}>secure</span> form. This info is stored securely as an illegible token. </h4>
    <br/>
        <CardElement style={{base: {fontSize: '18px'}}} />
      <button onClick={this.submit}>JOIN</button>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
