import React, {Component} from 'react';
import styles from './Styling/styles.module.css';

export class TabbedSummary extends Component {
    /* Inputs:
        topics : list
        doSomething : function
     */
    constructor(props) {
        super(props);
        if (!props.topics || !props.doSomething) throw new Error('Tabbed Summary Error: Parameters are invalid');
        if (props.topics.length === 0) throw new Error('Tabbed Summary Error: no topics provided');
        this.state = { active: this.props.topics[0] };
    }

    render() {
        const { topics, doSomething } = this.props;
        const { active } = this.state;

        const fullTabs = topics.map((topic) => (
            <li key={topic.title || topic.id} className={styles.in}>
                <a className={topic === active ? styles.active : styles.passive} onClick={() => this.setState({ active: topic })}>{topic.title}</a>
                <div className={topic === active ? styles.active : styles.passive}></div>
            </li>
        ));

        const compactTabs = topics.map((topic) => (
            <li key={topic.title || topic.id} className={styles.in_sm}>
                <a className={topic === active ? styles.bar_btn + ' ' + styles.b_active : styles.bar_btn + ' ' + styles.b_passive} onClick={() => this.setState({ active: topic })} aria-label={topic.title}></a>
            </li>
        ));

        return (
            <div className={styles.viewport}>
                <div className={styles.tabbarWrapper}>
                    <ul className={styles.bar + ' ' + styles.tabsFull}>{fullTabs}</ul>
                    <ul className={styles.bar_sm + ' ' + styles.tabsCompact}>{compactTabs}</ul>
                </div>
                <br/>
                <div>
                    <h3 className={styles.smTitle}>{active.title}</h3>
                    <p className={styles.summ2}>{active.description}</p>
                </div>
                <div className={styles.box}>
                    <button className={styles.submit} onClick={() => doSomething(active.id)}>This one!</button>
                </div>
            </div>
        );
    }
}

export class TabbedContent extends Component {
    /* Inputs:
        topics : list { title: .. , content: .. }
     */
    constructor(props) {
        super(props);
        if (!props.topics || props.topics.length === 0) throw new Error('Tabbed Content Error: no topics provided');
        this.state = { active: this.props.topics[0] };
    }

    render() {
        const tabs = this.props.topics.map(
            (topic) =>
                (
                    <li key={topic.title} className={styles.in}>
                        <a className={topic === this.state.active ? styles.active : styles.passive} onClick={() => { this.setState({ active: topic }); }}>{topic.title}</a>
                        <div className={topic === this.state.active ? styles.active : styles.passive}></div>
                    </li>
                )
        );
        const tabbar = <ul className={styles.bar}>{tabs}</ul>;
        const content =
            (
                <div className={styles.confined_viewport}>
                    <div>{tabbar}</div><br/>
                    <div className={styles.activecontent}>{this.state.active.content}</div>
                </div>
            );
        return content;
    }
}
