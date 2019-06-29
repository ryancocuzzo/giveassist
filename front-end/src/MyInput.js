import React from "react";
import { render } from "react-dom";
import './styles.css';

var strong_pass_regex = new RegExp(
  "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{6,})"
);
const email_regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default class MyInput extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      active: (props.locked && props.active) || false,
      value: props.value || "",
      error: props.error || "Invalid " + this.props.label,
      label: props.label || "Label",
      minLength: props.minLength || 5,
      regex: props.regex || null,
      id: props.id || Math.round(Math.random() * 500),
      type: props.type || 'text'
    };
  }

  changeValue(event) {
    const value = event.target.value;
    this.setState({ value: value });
  }

  handleKeyPress(event) {
    let val = this.state.value;
    if (this.state.regex != null) {
      if (
        val.match(this.state.regex) &&
        this.state.value.length > this.state.minLength
      ) {
        //if (event.which === 13) {
        this.props.handleSubmit(this.state.value);
        //} else {
        this.setState({ error: null });
        //}
      } else {
        this.setState({ error: "Invalid " + this.props.label });
      }
    } else {
      if (val.length > this.state.minLength) {
        //if (event.which === 13) {
        this.props.handleSubmit(this.state.value);
        //} else {
        this.setState({ error: null });
        //}
      } else {
        this.setState({ error: "Invalid " + this.props.label });
      }
    }
  }

  render() {
    const { active, value, error, label } = this.state;
    const { locked } = this.props;
    const fieldClassName = `field ${(locked ? active : active || value) &&
      "active"} ${locked && !active && "locked"}`;

    return (
      <div className={fieldClassName} style={locked ? { opacity: 0.4 } : {}}>
        <input
          id={1}
          value={value}
          placeholder={label}
          onChange={this.changeValue.bind(this)}
          onKeyPress={this.handleKeyPress.bind(this)}
          onFocus={() => !locked && this.setState({ active: true })}
          onBlur={() => !locked && this.setState({ active: false })}
          type={this.state.type}
        />
        <label htmlFor={1} className={error && "error"}>
          {error != null ? error : label}
        </label>
      </div>
    );
  }
}
