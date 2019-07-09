import React from "react";
import { render } from "react-dom";
import "./styles.css";
import { checkPropTypes } from "prop-types";

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
      minVal: 5,
      regex: props.regex || null,
      id: props.id || Math.round(Math.random() * 500),
      type: props.type || "text",
      handleVal: props.handleVal,
      autocomplete: props.name || 'new-password',
      prefix: props.prefix || ""
    };
  }

  trimmedPrefix = val => {
    // if (this.state.type == 'Number') {
    //
    // }
    return val.replace(this.state.prefix, "");
  };
  untrimmedPrefix = val => {
    return this.state.prefix + val;
  };

  changeValue(event) {
    // alert('c val changed! to ' + event.target.value + 'or ' + this.trimmedPrefix(event.target.value));
    const value = this.trimmedPrefix(event.target.value);
    this.setState({ value: value });
    let val = value;
    var isNumber = this.state.type == 'number';
    var string_length_match =  value.length > this.state.minLength;
    var number_min_match = isNumber  ? Number(value) > this.state.minVal :  null;
    if (this.state.regex != null) {
      if (
        val.match(this.state.regex) &&
        (isNumber ? number_min_match : string_length_match)
      ) {
        this.props.handleSubmit(this.state.value);

        this.setState({ error: null });
      } else {
        this.setState({ error: "Invalid " + this.props.label });
      }
    } else {
      if (isNumber ? number_min_match : string_length_match) {
        this.props.handleSubmit(this.state.value);
        this.setState({ error: null });
      } else {
        this.setState({ error: "Invalid " + this.props.label });
      }
    }

    this.props.handleVal != null
      ? this.props.handleVal(this.state.id, val)
      : console.log("");
  }

  handleKeyPress(event) {
    // alert('c val changed! to ' + event.target.value + 'or ' + this.trimmedPrefix(event.target.value));
    const value = this.trimmedPrefix(event.target.value);
    this.setState({ value: value });
    let val = value;
    var isNumber = this.state.type == 'number';
    var string_length_match =  value.length > this.state.minLength;
    var number_min_match = isNumber  ? Number(value) > this.state.minVal :  null;
    if (this.state.regex != null) {
      if (
        val.match(this.state.regex) &&
        (isNumber ? number_min_match : string_length_match)
      ) {
        this.props.handleSubmit(this.state.value);

        this.setState({ error: null });
      } else {
        this.setState({ error: "Invalid " + this.props.label });
      }
    } else {
      if (isNumber ? number_min_match : string_length_match) {
        this.props.handleSubmit(this.state.value);
        this.setState({ error: null });
      } else {
        this.setState({ error: "Invalid " + this.props.label });
      }
    }

    this.props.handleVal != null
      ? this.props.handleVal(this.state.id, val)
      : console.log("");
  }



  render() {
    const { active, value, error, label } = this.state;
    const { locked, maxWidth } = this.props;
    const fieldClassName = `field ${(locked ? active : active || value) &&
      "active"} ${locked && !active && "locked"}`;

    // alert(maxWidth);

    var style = {
      opacity: locked ? 0.4 : 1,
      maxWidth: maxWidth != null ? maxWidth : "100%"
    };

    console.log('rendering.. ' + value + 'or ' + this.untrimmedPrefix(value));

    return (
      <div className={fieldClassName} style={style}>
        <input
          id={1}
          value={this.untrimmedPrefix(value)}
          placeholder={label}
          onChange={this.changeValue.bind(this)}
          onKeyPress={this.handleKeyPress.bind(this)}
          onFocus={() => !locked && this.setState({ active: true })}
          onBlur={() => !locked && this.setState({ active: false })}
          type={this.state.type}
          autocomplete={this.state.autocomplete}
          name={this.props.name}
          pattern={this.state.type == 'number' ? '[0-9]*' : null}
        />
        <label htmlFor={1} className={error && "error"}>
          {error != null ? error : label}
        </label>
      </div>
    );
  }
}
