import React, {Component} from 'react';
import {CardElement, injectStripe} from 'react-stripe-elements';
import axios from 'axios';
import Popup from 'react-popup';

class CheckoutForm extends Component {
  constructor(props) {
    super(props);
    this.submit = this.submit.bind(this);
    this.state = {
      width: props.clientWidth || document.body.clientWidth
    };
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

componentDidMount() {

  window.addEventListener("resize", function(event) {
    // console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
    this.setState({width: document.body.clientWidth});
  }.bind(this))

}

  render() {
    var isMobile = this.state.width <= 1000;

    let button_style={
      width: (isMobile ? '100%' : '500px'),
       height: '45px',
       fontSize: '20px',
        fontWeight: '2000',
        margin: "0 auto",
        display: "table"
      };

    let button_wrapper_style = isMobile ?
    {
      width:  '100%',
      margin: "0 auto",
      display: "table"
    } :
    {
      width:  '100%',
      margin: "0 auto",
      display: "table"
    } ;

    return (
      <div className="checkout" style={{alignContent: 'center', width: '100%'}}>
      <Popup />
      <h4 style={{'letter-spacing': '1px', lineHeight: '20px'}}>Please enter your payment information into our <span style={{fontWeight: '600'}}>secure</span> form. This info is sent to our third-party payment-processing platform securely as an illegible token. <strong>We do not store payment information.</strong> </h4>
      <br/>
      <CardElement style={{base: {fontSize: '18px'}, margin: 'auto', width: '100%'}} />
      <br/>
    <br /><br />
  {!isMobile ? <div><br /><br /><br /></div> : ''}
  <div style={button_wrapper_style}>
      <button style={button_style} onClick={this.submit}><strong>{this.props.submitText || 'JOIN'}</strong></button>
    </div>
      <br /><br /><br /><br /><br /><br /></div>
    );
  }
}

export default injectStripe(CheckoutForm);
