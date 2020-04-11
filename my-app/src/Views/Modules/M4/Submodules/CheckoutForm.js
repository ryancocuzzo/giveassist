import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';
import axios from 'axios';
import Popup from 'react-popup';

class CheckoutForm extends Component {

  submit = async (ev) => {
    let {token} = await this.props.stripe.createToken();
    if (token)
      this.props.onSubmit(token.id);
    else
      Popup.alert('Your payment information is invalid!')
  }

  render() {
    return (
      <div class="contained">
        <Popup />
        <div class="inner_contained">
            <div style={{width: '100%', height: '3px'}}></div>
            <h4 style={{lineHeight: '23px'}}>This will be securely sent away to a third-party payment processor as an illegible token. <strong>We do not store payment information.</strong> </h4>
            <CardElement style={{base: {fontSize: '22px'}, margin: 'auto', width: '100%'}} />            <div style={{marginTop: '15px'}}>
            <button class="submit" style={{display: this.props.notSubmittable ? 'none' : 'block'}} onClick={this.submit}>{this.props.submitText || 'Update'}</button>
            </div>
        </div>
       </div>
    );
  }
}

export default injectStripe(CheckoutForm);
