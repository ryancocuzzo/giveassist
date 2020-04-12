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
        onSubmit: f()
     */
    constructor(props) {
        super(props);
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
        // let fields = this.state.fields.forEach((field, index) => {
        //     let valid = field.validate(field.value);
        //     console.log(field.value + ' is valid? ' + valid);
        //     if (!valid) {
        //         console.log('Setting index to ' + index);
        //         i = index;
        //         break;
        //     }
        // })
        // return i;
        // console.log('Setting index to n');
        // return this.state.fields.length-1;
    }

    formValidated = (index, content) => {
        if (this.state.isSequential) {
            if (index >= this.state.current) {
                this.setState({current:index+1});
            }
        }

        // alert('Form index ' + index + ' is Valid!')
    }
    formInvalidated = (index, content) => {
        if (this.state.isSequential) {
            if (index <= this.state.current) {
                this.setState({current:index});
            }
        }
        // if (index > this.state.current) this.setState({current:index});
        // alert('Form index ' + index + ' is Invalid!')
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
                        onValid={this.formValidated}
                        onInvalid={this.formInvalidated}
                        formIndex={index}
                        type={field.type}
                        locked={field.locked || (this.state.isSequential && index > this.state.current)}
                        readonly={field.readonly || (this.state.isSequential && index > this.state.current)}
                        key={index}
                    />
                );
            // else return (
            //     <InputComponent
            //         title={field.title}
            //         pretext={field.pretext}
            //         placeholder={field.placeholder}
            //         value={field.value}
            //         validate={field.validate}
            //         onChange={field.onChange}
            //         onValid={this.formValidated}
            //         onInvalid={this.formInvalidated}
            //         locked={field.locked || (this.state.isSequential && index > this.state.current)}
            //         formIndex={index}
            //         key={index}
            //
            //     />
            // )
        });
        let submit = <button className={styles.submit} style={{display: this.props.notSubmittable ? 'none' : 'block'}} onClick={this.props.submit}>Submit</button>;

        return (
            <div>
                {fields}
                {submit}
            </div>
        );
    }
}
