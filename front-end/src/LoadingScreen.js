import React, { Component } from "react";

export default class Loadinggg extends Component {
  render() {
    return <div className="giffy" style={{height: window.innerHeight+ 'px', display: 'block'}}><div style={{width:'70%', textAlign: 'center', margin: '0 auto'}}><div></div><br/><h1 style={{ marginTop: window.innerHeight/3+ 'px', fontSize: '80px'}}>Loading ...</h1></div></div>;
  }
}
