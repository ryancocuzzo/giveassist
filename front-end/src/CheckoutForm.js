import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';
import axios from 'axios';

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
      alert('Your payment information is invalid!')
}

  render() {
    return (
      <div className="checkout">
        <p>Please enter your payment information into the secure form.</p>
        <CardElement style={{base: {fontSize: '18px'}}} />
      <button onClick={this.submit}>JOIN</button>
      </div>
    );
  }
}

export default injectStripe(CheckoutForm);
