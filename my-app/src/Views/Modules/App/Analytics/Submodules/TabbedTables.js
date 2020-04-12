import React, { Component } from 'react';
import styles from '../Styling/table_styles.module.css';
import {TabbedSummary, TabbedContent} from '../../../General/Tabbed/Tabbed.js';
function rnd2(num) { return Math.round(num * 100) / 100; }

let convert_to_iterable_object = (jsonObject) => {
  var objArray = [];
  if (jsonObject) {
    Object.keys(jsonObject).forEach(function(key) {
      var temp = {}
      temp.key = key;
      temp.value = jsonObject[key];
      objArray.push(temp);
    });
  }
  return objArray;
}
let event_history_component = (event)  => {
  return (
    <tr>
        <td>{event.t}</td>
        <td>{event.tu}</td>
      <td>{rnd2((event.ttl  * 0.91))}</td>
      <td>{event.receipt ? (<button onclick={() => window.open(event.receipt)}>Receipt</button>) : 'Not available'}</td>
    </tr>
  );
}
let converted_component = (json_events) => {
    var objArray = this.convert_to_iterable_object(json_events);
    let ret = objArray.map(function(event) {
        return event_history_component(event.value);
    });
    return ret;
}

let TableCreator = (headers, visible_headers, data, classname) => {

    let heads = visible_headers.map((key) => {
        return <th key={key}>{key}</th>;
    });
    let body = data.map((event, index) => {
        return (
            <tr key={index}>
                <td>{event[headers[0]]}</td>
                <td>{event[headers[1]]}</td>
            {headers[2] != null ? <td>{event[headers[2]]}</td> : null}
                {headers[3] != null ? <td>{event[headers[3]]}</td> : null}
            </tr>
        );
    })
    return (
        <table class={classname}>
            <thead>
                {heads}
            </thead>
            <tbody>
                {body}
            </tbody>
        </table>
    );
}

function SSM1(data) {
    let headers = ["amount", "percent_users"];
    let vheaders = ["Amount", "% of Users"];
    return TableCreator(headers, vheaders, data, styles.darkTable);
}

function SSM2(data) {
    let headers = ["date", "num_users", "total_rev", "receipt"];
    let vheaders = ["Date", "Users", "Total", "Receipt"];
    return TableCreator(headers, vheaders, data, styles.darkTable);
}


export default function TabbedTables(data1, data2) {
    let x = data1 != null && data2 != null;
    if (!x) return <div></div>;
    let content = [
        {
            title: 'Users',
            content: SSM1(data1)
        },
        {
            title: 'Events',
            content: SSM2(data2)
        }
    ];

    return <TabbedContent topics={content} />;
}
