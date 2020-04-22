import React, {Component} from 'react';
import styles from './Styling/style.module.css';
import CheckoutForm from '../../General/Payment/CheckoutForm.js';
import {Elements, StripeProvider} from 'react-stripe-elements';
import imgs from '../../../../Helper-Files/ImgFactory.js';
import variables, {PLANS, priceForPlanWithTitle} from '../../../../Helper-Files/variables.js';
import {InputComponent} from '../../General/Form/InputComponent.js';
import {validateMoney} from '../../General/Form/FormUtils.js';;
let urls = variables.local_urls;
let stripe_api_key = variables.stripe_api_key;




export default class PayAndPlanSelect extends Component {

    /* planSelectText, onTokenChange, planChanged, customAmountChanged, onSubmitPayment, notSubmittable, payInfoText, onSubmitPlan */
    constructor(props) {
        super(props);
        this.state = { current: null, customAmount: 0 };
        let submittable = !props.notSubmittable;
        if (submittable && (props.onSubmitPayment === null || props.onSubmitPlan === null)) throw ('PayAndPlanSelect Error: onSubmit not provided as params -> ' + (props.onSubmitPayment) + " " + (props.onSubmitPlan));
    }
    setActive = (event) => {
        let val = event.target.value;
        if (val) {
            this.setState({current: val});
        }
        if (this.props.planChanged)
            this.props.planChanged(val);
    }

    customAmountChanged = (amt) => {
        this.setState({customAmount: parseInt(amt)});
        if (this.props.customAmountChanged)
            this.props.customAmountChanged(amt);
    }

    handle_submit_plan = () => {
        let plan = this.state.current + ',' + (priceForPlanWithTitle(this.state.current) || this.state.customAmount);
        if (this.props.onSubmitPlan)
            this.props.onSubmitPlan(plan);
    }

    render() {
        return (
            <div class={styles.gridded_centered}>
                <StripeProvider apiKey={stripe_api_key}>
                    <div class={styles.infoView}>

                         <h1>{this.props.payInfoText || 'Update Payment Info'}</h1>
                         <Elements >
                           <CheckoutForm onTokenChange={this.props.onTokenChange ? this.props.onTokenChange : null} onSubmit={this.props.onSubmitPayment} notSubmittable={this.props.notSubmittable} style={{width: '100%'}}/>
                         </Elements>

                         <h1 style={{marginTop: '35px'}}>{this.props.planSelectText || "Change Plan"}</h1>
                     <div class={styles.restrictedPayView}>
                         <div class={styles.payment}>
                            <ul>
                                {PLANS.map((plan) => (
                                    <li key={plan.title}>
                                        <input type="radio"  onClick={this.setActive} id={plan.title} name="prem" value={plan.title}/>
                                        <div class={styles.woah}></div>
                                    <label htmlFor={plan.title} >{plan.title !== 'PZ' ? ('$' + plan.cost) : 'Other' }</label><br/>
                                    </li>
                                ))}

                            </ul>


                        </div>
                        </div>
                        <br/>
                    <div class={styles.restrictedPayView2} style={{textAlign: 'left'}}>
                            { this.state.current == "PZ" ? <div class={styles.restrictedInput} style={{minWidth: '250px'}}><InputComponent type="number" title="Custom Amount" pretext="$" validate={validateMoney} onChange={this.customAmountChanged} /></div> : ''}
                        </div>

                        <div style={{marginTop: '15px'}}>
                            <button style={{display: this.props.notSubmittable ? 'none' : 'block'}} class={styles.submit} onClick={this.handle_submit_plan}>Update</button>
                        </div>

                    </div>
                </StripeProvider>
            </div>
        );

    }

}
