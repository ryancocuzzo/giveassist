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
      <div className="checkout" style={{alignContent: 'center', width: '100%'}}>
      <Popup />
      <h4 style={{'letter-spacing': '1px', lineHeight: '20px'}}>Please enter your payment information into our <span style={{fontWeight: '600'}}>secure</span> form. This info is sent to our third-party payment-processing platform securely as an illegible token. <strong>We do not store payment information.</strong> </h4>
      <br/>
      <CardElement style={{base: {fontSize: '18px'}, margin: 'auto', width: '100%'}} />
      <br/>
    <button style={{marginLeft: '0%',width: '100%',marginRight: '0%', height: '45px', fontSize: '20px', fontWeight: '2000'}} onClick={this.submit}><strong>JOIN</strong></button>
      <br /><br /><br /><br /><br /><br /></div>
    );
  }
}

export default injectStripe(CheckoutForm);
