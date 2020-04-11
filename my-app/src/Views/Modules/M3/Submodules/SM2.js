import React, { Component } from 'react';

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
    return TableCreator(headers, vheaders, data, "darkTable");
}

function SSM2(data) {
    let headers = ["date", "num_users", "total_rev", "receipt"];
    let vheaders = ["Date", "Users", "Total", "Receipt"];
    return TableCreator(headers, vheaders, data, "darkTable");
}

class TabbedContent extends Component {
    /* Inputs:
        topics : list { title: .. , content: .. }
     */
    constructor(props) {
        super(props);
        this.state = { active: this.props.topics[0] };
    }
    render() {
        let tabs = this.props.topics.map(
        (topic) =>
            (
                <li class="in">
                    <a class={topic === this.state.active ? "active" : "passive"} onClick={() => { this.setState({ active: topic }); }}>{topic.title}</a>
                    <div class={topic === this.state.active ? "active" : "passive"}></div>
                </li>
            )
        );
        let tabbar = <ul class="bar">{tabs}</ul>
        let content =
        (
            <div class="confined_viewport">
                <div >{tabbar}</div><br/>
            <div >{this.state.active.content}</div>
            </div>
        );
        return content;
    }
}

export default function SM2(data1, data2) {
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
