import React from 'react';
import ReactDOM from 'react-dom';


class GradientSVG extends React.Component {
  render() {
    let { startColor, endColor, idCSS, rotation } = this.props;

    let gradientTransform = `rotate(${rotation})`;

    return (
      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id={idCSS} gradientTransform={gradientTransform}>
            <stop offset="0%" stopColor={startColor} />
            <stop offset="100%" stopColor={endColor} />
          </linearGradient>
        </defs>
      </svg>
    );
  }
}

class CustomGradientSVG extends React.Component {
  render() {
    let { idCSS, rotation } = this.props;

    let gradientTransform = `rotate(${rotation})`;

    return (
      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id={idCSS} gradientTransform={gradientTransform}>
            <stop offset="0%" stopColor='#06005d' />
            <stop offset="10%" stopColor='#0d0655' />
            <stop offset="19%" stopColor='#201673' />
            <stop offset="57%" stopColor='#1b5381' />
            <stop offset="100%" stopColor='#b24bff' />
          </linearGradient>
        </defs>
      </svg>
    );
  }
}

export default CustomGradientSVG;
