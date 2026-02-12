import React, { Component, createRef } from "react";
import styles from "./Styling/styles.module.css";

export class InputComponent extends Component {
    /* Inputs:
        title, placeholder, onChange(text), validate(text)
        formIndex, onValid
     */
    constructor(props) {
        super(props);

        if (props.validate == null)
            throw new Error("InputComponent Error: no validation function provided");
        if (props.title == null) throw new Error("InputComponent Error: no title provided");

        this.containerRef = createRef();

        let style_val, isPassing;
        if (props.value) {
            isPassing = this.props.validate(props.value);
            style_val = "input_label shrunk_label";
            if (isPassing) style_val += " passing_input";
            else style_val += " failing_input";
        } else {
            isPassing = false;
            style_val = "input_label expanded_label";
        }

        this.state = {
            passed: isPassing,
            val: props.value,
            isEditing: false,
            formIndex: props.formIndex,
            onValid: props.onValid,
            onInvalid: props.onInvalid,
            p_style: style_val
        };
    }

    componentDidMount() {
        document.addEventListener("click", this.handleClickOutside, true);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.handleClickOutside, true);
    }

    handleClickOutside = event => {
        const domNode = this.containerRef.current;

        if (!domNode || !domNode.contains(event.target)) {
            if (this.state.val == null || this.state.val === "") this.turnOffEditing();
        }
    };

    onChange = event => {
        const val = event.target.value;
        if (this.props.onChange) this.props.onChange(val);
        if (this.props.formOnChange) {
            this.props.formOnChange(this.state.formIndex, val);
        }
        if (this.props.validate(val)) {
            this.setState({ passed: true, val: val });
            this.passing();
            if (this.state.onValid != null)
                this.state.onValid(this.state.formIndex, val);
        } else {
            this.setState({ passed: false, val: val });
            this.notPassing();
            if (this.state.onInvalid != null)
                this.state.onInvalid(this.state.formIndex, val);
        }
    };

    p_style_to_editing_passing = () => {
        this.setState({ p_style: "input_label shrunk_label passing_input" });
    };

    p_style_to_editing = () => {
        this.setState({ p_style: "input_label shrunk_label" });
    };

    p_style_to_editing_failing = () => {
        this.setState({ p_style: "input_label shrunk_label failing_input" });
    };

    p_style_to_not_editing = () => {
        this.setState({ p_style: "input_label expanded_label" });
    };

    passing = () => {
        this.p_style_to_editing_passing();
    };

    notPassing = () => {
        this.p_style_to_editing_failing();
    };

    turnOnEditing = () => {
        this.setState({ isEditing: true });
        if (!this.state.val) this.p_style_to_editing();
        else {
            if (this.state.passed) this.p_style_to_editing_passing();
            else this.p_style_to_editing_failing();
        }
    };

    turnOffEditing = () => {
        this.setState({ isEditing: false });
        this.p_style_to_not_editing();
    };

    compiled_p_styling = (passing, editing) => {
        let style = "input_label";
        if (!editing) style += " expanded_label";
        else style += " shrunk_label";
        if (passing) style += " passing_input";
        else style += " failing_input";
        return style;
    };

    refFx = (input, editing) => {
        const canFocus = !this.props.readonly && !this.props.locked;
        const shouldFocus = !this.state.passed;
        return input && (canFocus && shouldFocus ? input.focus() : null);
    }

    render() {
        const p_style = this.state.p_style;
        let module_mapped_p_style = "";
        p_style.split(" ").forEach(style => {
            module_mapped_p_style += styles[style] + " ";
        });

        const editing =
            this.state.isEditing === true ||
            (this.state.val != null && this.state.val !== "");

        const locked = {
            opacity: 0.25,
            editable: false,
            pointerEvents: "none",
            backgroundColor: "#E8E8E8"
        };
        const off = {
            opacity: 0.5,
            editable: true,
            pointerEvents: "all"
        };
        const on = {
            opacity: 1,
            editable: true,
            pointerEvents: "all"
        };

        const pretext_present = editing && this.props.pretext != null;

        const in_normal = (
            <input
                type={this.props.type ? this.props.type : ""}
                onChange={this.onChange}
                placeholder={this.props.placeholder}
                value={this.state.val != null ? this.state.val : ""}
                ref={input => this.refFx(input, editing)}
            />
        );
        const in_readonly = (
            <input
                type={this.props.type ? this.props.type : ""}
                onChange={this.onChange}
                placeholder={this.props.placeholder}
                value={this.state.val != null ? this.state.val : ""}
                readOnly
                ref={input => this.refFx(input, editing)}
            />
        );

        const editable = (
            <div
                className={styles.outside}
                ref={this.containerRef}
                style={
                    this.props.locked || this.props.readonly ? locked : editing ? on : off
                }
                onClick={() => this.turnOnEditing()}
            >
                <span className={module_mapped_p_style}>{this.props.title}</span>
                <div className={styles.siblings} style={{ display: editing }}>
                    {pretext_present ? (
                        <h5 style={{fontFamily: 'Quicksand', fontWeight: 'bold'}}>
                            {this.props.pretext}
                        </h5>
                    ) : null}
                    {editing ? (this.props.locked ? in_readonly : in_normal) : null}
                </div>
            </div>
        );

        return editable;
    }
}
