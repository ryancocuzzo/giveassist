import React, {Component} from 'react';
import styles from './Styling/style.module.css';
import CheckoutForm from '../../General/Payment/CheckoutForm.js';
import imgs from '../../../../Helper-Files/ImgFactory.js';
import variables, {PLANS, priceForPlanWithTitle} from '../../../../Helper-Files/variables.js';
import {InputComponent} from '../../General/Form/InputComponent.js';
import {validateMoney} from '../../General/Form/FormUtils.js';

const urls = variables.local_urls;

export default class PayAndPlanSelect extends Component {

    /* planSelectText, onTokenChange, planChanged, customAmountChanged, onSubmitPayment, notSubmittable, payInfoText, onSubmitPlan */
    constructor(props) {
        super(props);
        this.state = { current: null, customAmount: 0 };
        const submittable = !props.notSubmittable;
        if (submittable && (props.onSubmitPayment === null || props.onSubmitPlan === null)) throw new Error('PayAndPlanSelect Error: onSubmit not provided as params -> ' + (props.onSubmitPayment) + " " + (props.onSubmitPlan));
    }

    setActive = (event) => {
        const val = event.target.value;
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
        const plan = this.state.current + ',' + (priceForPlanWithTitle(this.state.current) || this.state.customAmount);
        if (this.props.onSubmitPlan)
            this.props.onSubmitPlan(plan);
    }

    render() {
        return (
            <div className={styles.gridded_centered}>
                <div className={styles.infoView}>

                    <h1>{this.props.payInfoText || 'Update Payment Info'}</h1>
                    <CheckoutForm onTokenChange={this.props.onTokenChange ? this.props.onTokenChange : null} onSubmit={this.props.onSubmitPayment} notSubmittable={this.props.notSubmittable} style={{width: '100%'}}/>

                    <h1 style={{marginTop: '35px'}}>{this.props.planSelectText || "Change Plan"}</h1>
                    <div className={styles.restrictedPayView}>
                        <div className={styles.payment}>
                            <ul>
                                {PLANS.map((plan) => (
                                    <li key={plan.title}>
                                        <input type="radio" checked={this.state.current === plan.title} onClick={this.setActive} id={plan.title} name="prem" value={plan.title}/>
                                        <div className={styles.woah} onClick={() => {
                                            this.setActive({target: {value: plan.title}});
                                        }}></div>
                                        <label htmlFor={plan.title}>{plan.title !== 'PZ' ? ('$' + plan.cost) : 'Other'}</label><br/>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                    <br/>
                    <div className={styles.restrictedPayView2} style={{textAlign: 'left'}}>
                        {this.state.current === "PZ" ? <div className={styles.restrictedInput} style={{minWidth: '250px'}}><InputComponent type="number" title="Custom Amount" pretext="$" validate={validateMoney} onChange={this.customAmountChanged} /></div> : ''}
                    </div>

                    <div style={{marginTop: '15px'}}>
                        <button style={{display: this.props.notSubmittable ? 'none' : 'block'}} className={styles.submit} onClick={this.handle_submit_plan}>Update</button>
                    </div>

                </div>
            </div>
        );
    }
}
