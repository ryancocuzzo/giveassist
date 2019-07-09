import React, { Component } from "react";

export default class PayPlanOption extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: props.title,
      isActive: false,
      isSelected: props.isSelected,
      cost: props.cost,
      description: props.description,
      customIn: props.customIn || null,
      width: props.clientWidth || document.body.clientWidth
    };
    console.log("got the bagg? " + props.isSelected);
  }

  activate = () => {
    this.setState({ isActive: true });
  };
  deactivate = () => {
    this.setState({ isActive: false });
  };

  componentDidMount() {
    window.addEventListener(
      "resize",
      function(event) {
        // console.log(document.body.clientWidth + ' wide by ' + document.body.clientHeight+' high');
        this.setState({ width: document.body.clientWidth });
      }.bind(this)
    );
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ isSelected: nextProps.isSelected });
  }

  callback = () => {
    // this.setState({ isSelected: !this.state.isSelected });
    this.props.callback(this.state.title);
  };

  render() {
    var isMobile = this.state.width <= 500;

    var amt_component = (
      <div
        style={{
          maxWidth: this.state.isMobile ? "100px" : "400px",
          margin: "0 auto",
          display: "table",
          // backgroundColor: "yellow"
          // paddingLeft: '0px',
        }}
      >
        <table
          style={{
            margin: isMobile ? "3%" : "0 auto",
            marginLeft: isMobile ? "0%" : "0 auto",
            display: "table"
          }}
        >
          <tr>
            <td >
              <h1
                style={{
                  color: this.state.isSelected ? "black" : "white",
                  width: "30px",
                  maxWidth: "40px"
                }}
              >
                $
              </h1>
            </td>
            <td
              style={{
                textAlign: "center",
                minWidth: this.state.customIn != null ? "200px" : "100px",
                // backgroundColor: "black"
              }}
            >
              {this.state.customIn || (
                <div style={{ textAlign: "center" }}>
                  <h1
                    style={{
                      color: this.state.isSelected ? "black" : "white",
                      textAlign: "center",
                      marginLeft: "0px",
                      fontSize: isMobile ? "35px" : "40px"
                    }}
                  >
                    {this.state.cost}
                  </h1>
                </div>
              )}
            </td>
          </tr>
        </table>
      </div>
    );

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
          borderRadius: "15px",
          boxShadow: "3px 6px #454545"
        }}
        className={this.state.isSelected ? "gradientButton2" : "gradientButton"}
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
              // border: this.state.isSelected
              //   ? "5px solid white"
              //   : "0px solid blue",
              borderRadius: "15px",
              padding: "10px",
              width: "100%"
            }}
          >
            {/*  -------------  BEGIN MAGIC  -------------*/}

            {amt_component}
            <h3
              style={{
                width: "100%",
                paddingLeft: "0%",
                paddingTop: "-10px",
                color: this.state.isSelected ? "black" : "white"
              }}
            >
              <span> per month</span>
            </h3>
          </div>
        </div>
      </div>
    );
  }
}
