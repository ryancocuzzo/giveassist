import React, {Component} from 'react';
import styles from './Styling/style.module.css';
import CheckoutForm from '../../General/Payment/CheckoutForm.jsx';
import imgs from '../../../../Helper-Files/ImgFactory.js';
import variables, {PLANS, priceForPlanWithTitle} from '../../../../Helper-Files/variables.js';
import {InputComponent} from '../../General/Form/InputComponent.jsx';
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
            <div className={styles.settingsCard}>
                <div className={styles.settingsHeader}>
                    <h2>{this.props.payInfoText || 'Payment & Plan'}</h2>
                    <span className="material-icons">credit_card</span>
                </div>
                
                <div className={styles.settingsForm}>
                    <div className={styles.subsection}>
                        <h3 className={styles.subsectionTitle}>Payment Method</h3>
                        <CheckoutForm 
                            onTokenChange={this.props.onTokenChange ? this.props.onTokenChange : null} 
                            onSubmit={this.props.onSubmitPayment} 
                            notSubmittable={this.props.notSubmittable} 
                            style={{width: '100%'}}
                        />
                    </div>

                    <div className={styles.subsection} style={{marginTop: 'var(--space-8)'}}>
                        <h3 className={styles.subsectionTitle}>{this.props.planSelectText || "Subscription Plan"}</h3>
                        <div className={styles.planGrid}>
                            {PLANS.map((plan) => (
                                <label 
                                    key={plan.title}
                                    className={`${styles.planOption} ${this.state.current === plan.title ? styles.planOptionActive : ''}`}
                                    onClick={() => this.setActive({target: {value: plan.title}})}
                                >
                                    <input 
                                        type="radio" 
                                        checked={this.state.current === plan.title} 
                                        onChange={this.setActive} 
                                        id={plan.title} 
                                        name="prem" 
                                        value={plan.title}
                                        style={{display: 'none'}}
                                    />
                                    <div className={styles.planContent}>
                                        <span className={styles.planPrice}>
                                            {plan.title !== 'PZ' ? ('$' + plan.cost) : 'Custom'}
                                        </span>
                                        {plan.title !== 'PZ' && <span className={styles.planPeriod}>/mo</span>}
                                    </div>
                                    {this.state.current === plan.title && (
                                        <span className={`material-icons ${styles.planCheck}`}>check_circle</span>
                                    )}
                                </label>
                            ))}
                        </div>
                        
                        {this.state.current === "PZ" && (
                            <div style={{marginTop: 'var(--space-4)'}}>
                                <InputComponent 
                                    type="number" 
                                    title="Custom Amount" 
                                    pretext="$" 
                                    validate={validateMoney} 
                                    onChange={this.customAmountChanged} 
                                />
                            </div>
                        )}
                    </div>

                    {!this.props.notSubmittable && (
                        <button className={styles.submit} onClick={this.handle_submit_plan}>
                            Save Changes
                        </button>
                    )}
                </div>
            </div>
        );
    }
}
