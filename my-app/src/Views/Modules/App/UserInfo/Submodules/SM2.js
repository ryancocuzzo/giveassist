import React, {Component} from 'react';
import '../Styling/style.css';
// import '../Styling/sickcss.css';
import CheckoutForm from './CheckoutForm.js';
import {Elements, StripeProvider} from 'react-stripe-elements';
import imgs from '../../../../Helper-Files/ImgFactory.js';
import variables from '../../../../Helper-Files/variables.js';
import {InputComponent} from '../../Form/InputComponent.js';
let urls = variables.local_urls;
let stripe_api_key = variables.stripe_api_key;

function secure(the) {
    // alert("bag secure -> " + the.target.value);
 }


 let money_regex = /^[0-9]+(\.[0-9]{1,2})?$/;

 function validateMoney(amt) {
     if (!amt) return false;
     if (amt.includes('$')) return false;
     return money_regex.test(amt);
 }

export default class SM2 extends Component {
    /* planSelectText, onSubmitPayment, ..*/
    constructor(props) {
        super(props);
        this.state = { current: null };
    }
    setActive = (event) => {
        let val = event.target.value;
        if (val) {
            this.setState({current: val});
        }
    }

    render() {
        return (
            <div>
                <StripeProvider apiKey={stripe_api_key}>
                    <div>
                         <h1>{this.props.payInfoText || 'Update Payment Info'}</h1>
                         <Elements >
                           <CheckoutForm onSubmit={this.props.onSubmitPayment} notSubmittable={this.props.notSubmittable} style={{width: '100%'}}/>
                         </Elements>

                         <h1 style={{marginTop: '35px'}}>{this.props.planSelectText || "Change Plan"}</h1>

                     <div class="payment">
                        <ul>
                            <li>
                                <input type="radio"  onClick={this.setActive} id="premX" name="prem" value="PX"/>
                                <div class="woah"></div>
                                <label for="premX" >$4.99</label><br/>
                            </li>
                            <li>
                                <input type="radio" onClick={this.setActive} id="premY" name="prem" value="PY"/>
                                <div class="woah"></div>
                                <label for="premY">$3.99</label><br/>
                            </li>
                            <li>
                                <input type="radio" onClick={this.setActive} id="premZ" name="prem" value="PZ"/>
                                <div class="woah"></div>
                                <label for="premZ">Other</label><br/><br/>
                            </li>
                        </ul>


                    </div>
                    <br/>
                    <div >
                        { this.state.current == "PZ" ? <div class="restrictedInput"><InputComponent type="number" title="Custom Amount" placeholder="12" pretext="$" validate={validateMoney} onChange={secure} /></div> : ''}
                    </div>

                    <div style={{marginTop: '15px'}}>
                        <button style={{display: this.props.notSubmittable ? 'none' : 'block'}} class="submit" onClick={this.props.onSubmitPlan}>Update</button>
                    </div>

                    </div>
                </StripeProvider>
            </div>
        );
        /* Inputs:
            title, placeholder, onChange(text), validate(text) */
    }

}
