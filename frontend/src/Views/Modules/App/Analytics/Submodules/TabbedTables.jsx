import React from 'react';
import styles from '../Styling/table_styles.module.css';
import {TabbedSummary, TabbedContent} from '../../../General/Tabbed/Tabbed.jsx';

function rnd2(num) { return Math.round(num * 100) / 100; }

const convert_to_iterable_object = (jsonObject) => {
    const objArray = [];
    if (jsonObject) {
        Object.keys(jsonObject).forEach(function(key) {
            const temp = {};
            temp.key = key;
            temp.value = jsonObject[key];
            objArray.push(temp);
        });
    }
    return objArray;
};

const event_history_component = (event) => {
    return (
        <tr>
            <td>{event.t}</td>
            <td>{event.tu}</td>
            <td>{rnd2((event.ttl))}</td>
            <td>{event.receipt ? (<button onClick={() => window.open(event.receipt)}>Receipt</button>) : 'Not available'}</td>
        </tr>
    );
};

const converted_component = (json_events) => {
    const objArray = convert_to_iterable_object(json_events);
    const ret = objArray.map(function(event) {
        return event_history_component(event.value);
    });
    return ret;
};

const TableCreator = (headers, visible_headers, data, classname) => {

    const heads = visible_headers.map((key) => {
        return <th key={key}>{key}</th>;
    });
    const body = data.map((event, index) => {
        return (
            <tr key={index}>
                <td>{event[headers[0]]}</td>
                <td>{event[headers[1]]}</td>
                {headers[2] != null ? <td>{event[headers[2]]}</td> : null}
                {headers[3] != null ? <td>{event[headers[3]] ? <div className={styles.receiptlink} onClick={() => window.open(event[headers[3]], '_blank')}>Here</div> : 'Pending..'}</td> : null}
            </tr>
        );
    });
    return (
        <div className={styles.maxheightpinned}>
            <table className={classname}>
                <thead>
                    <tr>{heads}</tr>
                </thead>
                <tbody>
                    {body}
                </tbody>
            </table>
        </div>
    );
};

function SSM1(data) {
    const headers = ["amount", "percent_users"];
    const vheaders = ["Amount", "% of Users"];
    return TableCreator(headers, vheaders, data, styles.darkTable);
}

function SSM2(data) {
    const headers = ["date", "num_users", "total_rev", "receipt"];
    const vheaders = ["Date", "Users", "Total", "Receipt"];
    return TableCreator(headers, vheaders, data, styles.darkTable);
}

export default function TabbedTables(data1, data2) {
    const x = data1 != null && data2 != null;
    if (!x) return <div></div>;
    const content = [
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
