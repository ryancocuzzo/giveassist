import React, { Component } from "react";


export default class PayPlanOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      isActive: false,
      isSelected: props.isSelected,
      cost: props.cost,
      description: props.description
    };
    console.log("got the bagg? " + props.isSelected);
  }

  activate = () => {
    this.setState({ isActive: true });
  };
  deactivate = () => {
    this.setState({ isActive: false });
  };

  componentWillReceiveProps(nextProps) {
    this.setState({ isSelected: nextProps.isSelected });
  }

  callback = () => {
    // this.setState({ isSelected: !this.state.isSelected });
    this.props.callback(this.state.title);
  };

  render() {
    // console.log(this.state.title + "=> " + this.state.isSelected);
    // if (this.state.isSelected) alert(this.state.isSelected);

    return (
      <div
        style={{
          margin: "25px",
          alignContent: "center",
          textAlign: "center",
          opacity: this.state.isActive || this.state.isSelected ? 1 : 0.8,
          borderWidth: "10px",
          borderColor: "blue",
          borderRadius: "15px",
          boxShadow: "3px 6px darkGrey",
          backgroundColor: this.state.isSelected ? "#0E3F81" : "white",
        }}
        value={this.state.title}
        onClick={() => this.callback()}
        onMouseEnter={() => this.activate()}
        onMouseLeave={() => this.deactivate()}
      >
        <div
          onselectstart="return false"
          style={{
            borderRadius: "15px"
          }}
        >
          <div
            style={{
              border: this.state.isSelected
                ? "5px solid white"
                : "0px solid blue",
              borderRadius: "15px",
              padding: '10px',

            }}
          >
            <h1
              style={{
                fontWeight: "900",
                paddingTop: "20px",
                color: this.state.isSelected ? "white" : "black"
              }}
            >
              {this.state.title}
            </h1>
            <br />
            <h2 style={{ color: this.state.isSelected ? "white" : "black" }}>
              ${this.state.cost} / mo.
            </h2>
            <br />
            <p
              style={{
                paddingBottom: "20px",
                color: this.state.isSelected ? "white" : "black"
              }}
            >
              {this.state.description}
            </p>
          </div>
        </div>
      </div>
    );
  }
}
