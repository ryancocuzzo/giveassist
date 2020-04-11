import React, { PureComponent } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer,Cell,
} from 'recharts';



const gradient = [
    '#002f45',
    '#004962',
    '#00657e',
    '#008396',
    '#00a1aa',
    '#00c0b9',
    '#13e0c3',
    '#5cffc9'
];

function gradient_color_chooser(inn){
    return gradient[inn % 8];
}

export default class SM1 extends PureComponent {



  render() {
    return (
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart
            data={this.props.data}
            margin={{
              top: 10, right: 10, left: 0, bottom: 0,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="title" />
            <YAxis />
        <Bar dataKey="total" stroke="teal">
            {
          	this.props.data.map((entry, index) => {
                console.log(index);
            	return <Cell fill={gradient_color_chooser(index)} />;
            })
          }
        </Bar>
        </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }
}
