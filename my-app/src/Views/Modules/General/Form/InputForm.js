import React, {Component}  from 'react';
import {InputComponent} from './InputComponent.js';
import styles from './Styling/styles.module.css';

export default class InputForm extends Component{
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
     */
    constructor(props) {
        super(props);
        if (props.fields == null || props.submit == null) throw 'InputForm Error: invalid params. Either fields or submit is NULL.';
        this.state = {
            fields: props.fields,
            isSequential: props.isSequential,
            length: props.fields.length,
            current: 0,
            values: []
        }
    }

    componentDidMount() {
        this.setState({current: this.getInitialIndex()});
    }

    getInitialIndex = () => {
        var j = 0;
        for (let field of this.state.fields) {
            let valid = field.validate(field.value);
            // console.log(field.value + ' is valid? ' + valid);
            if (!valid) {
                // console.log('Setting index to ' + index);
                return j;
            }
          j++;
        }
        j = this.state.fields.length-1;
        return j;
    }

    submitting = () => {
        if (this.getInitialIndex() === this.this.state.fields.length-1)
            this.props.submit(this.state.fields);
        else alert('Cannot submit - Form invalid');
    }

    formValidated = (index, content) => {
        if (this.state.isSequential) {
            if (index >= this.state.current) {
                this.setState({current:index+1});
            }
        }
    }
    formInvalidated = (index, content) => {
        if (this.state.isSequential) {
            if (index <= this.state.current) {
                this.setState({current:index});
            }
        }
    }

    inputValueChanged = (index, content) => {
        this.state.fields[index].value = content; // NOTE: may need to set state, not sure
    }



    render() {
        let fields = this.state.fields.map((field, index) => {
            // if (field.readonly)
                return (
                    <InputComponent
                        title={field.title}
                        pretext={field.pretext}
                        placeholder={field.placeholder}
                        value={field.value}
                        validate={field.validate}
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
        let submit = <button className={styles.submit} style={{display: this.props.notSubmittable ? 'none' : 'block'}} onClick={this.submitting}>{this.props.submitText || 'Submit'}</button>;

        return (
            <div>
                {fields}
                {submit}
            </div>
        );
    }
}
