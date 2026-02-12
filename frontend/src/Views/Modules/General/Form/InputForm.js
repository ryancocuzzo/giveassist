import React, {Component} from 'react';
import {InputComponent} from './InputComponent.js';
import styles from './Styling/styles.module.css';

export default class InputForm extends Component {
    /*
        Fields:
            [{
                title: ..
                pretext: $?
                placeholder: ..
                value: ..
                validate: f(),
                onChange: f(),
                readonly: 'true'?
            },
            ..., ]
        submit: f(),
        submitText: ..
        customErrorText: ..
        confirmFields: [ {index: .., confirmWithIndex: ..} ],
        fieldsChanged: f(),
        firstInvalidIndexUpdate: f()
     */
    constructor(props) {
        super(props);
        if (props.fields == null || (!props.notSubmittable && props.submit == null)) throw new Error('InputForm Error: invalid params. Either fields or submit is NULL.');
        this.state = {
            fields: props.fields,
            isSequential: props.isSequential,
            length: props.fields.length,
            current: 0,
            values: [],
            confirmFields: props.confirmFields || [],
        };
    }

    componentDidMount() {
        this.updateCurrent(this.getInitialIndex());
    }

    getInitialIndex = () => {
        let j = 0;
        for (let field of this.state.fields) {
            const confirmField = this.isConfirmField(j);
            const confirmIndex = confirmField?.confirmWithIndex;
            if (confirmField) {
                if (field.value !== this.state.fields[confirmIndex].value)
                    return j;
            } else {
                const valid = field.validate(field.value);
                if (!valid) {
                    return j;
                }
            }
            j++;
        }
        j = this.state.fields.length;
        return j;
    }

    submitting = () => {
        if (this.getInitialIndex() === this.state.fields.length)
            this.props.submit(this.state.fields);
        else alert(this.props.customErrorText || 'Cannot submit - Form info invalid');
    }

    updateCurrent = (to) => {
        if (this.state.current !== to) {
            this.setState({current: to});
            if (this.props.firstInvalidIndexUpdated)
                this.props.firstInvalidIndexUpdated(to);
        }
    }

    formValidated = (index, content) => {
        if (this.state.isSequential) {
            if (index >= this.state.current) {
                this.updateCurrent(this.getInitialIndex());
            }
        }
    }

    formInvalidated = (index, content) => {
        if (this.state.isSequential) {
            if (index <= this.state.current) {
                this.updateCurrent(index);
            }
        }
    }

    inputValueChanged = (index, content) => {
        this.state.fields[index].value = content;
        if (this.props.fieldsChanged)
            this.props.fieldsChanged(this.state.fields);
    }

    isConfirmField = (index) => {
        let i = null;
        this.state.confirmFields.forEach((field) => {
            if (field.index === index) {
                i = field;
            }
        });
        return i;
    }

    render() {
        const fields = this.state.fields.map((field, index) => {
            const confirmField = this.isConfirmField(index);
            const confirmIndex = confirmField?.confirmWithIndex;
            const matches = (field_val) => field_val === this.state.fields[confirmIndex].value;
            return (
                <InputComponent
                    title={field.title}
                    pretext={field.pretext}
                    placeholder={field.placeholder}
                    value={field.value}
                    validate={confirmIndex ? matches : field.validate}
                    onChange={field.onChange}
                    formOnChange={this.inputValueChanged}
                    onValid={this.formValidated}
                    onInvalid={this.formInvalidated}
                    formIndex={index}
                    type={field.type}
                    locked={field.locked || (this.state.isSequential && index > this.state.current)}
                    readonly={field.readonly || (this.state.isSequential && index > this.state.current)}
                    key={index}
                />
            );
        });
        const submit = <button className={styles.submit} style={{display: this.props.notSubmittable ? 'none' : 'block'}} onClick={this.submitting}>{this.props.submitText || 'Submit'}</button>;

        return (
            <div>
                {fields}
                {submit}
            </div>
        );
    }
}
