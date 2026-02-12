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
        this.state = { active: this.props.topics[0], width: window.innerWidth, height: window.innerHeight };
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    updateWindowDimensions = () => {
        this.setState({ width: window.innerWidth, height: window.innerHeight });
    }

    trimmed_topic = (topic) => {
        const threshold = window.innerWidth < 1100 ? 15 : 25;
        const maxlen = window.innerWidth > 900 && window.innerWidth < 1100 ? 10 : 16;
        let newtopic = '';
        topic.split(' ').forEach((str) => {
            if (str.length > maxlen) newtopic += str.substring(0, maxlen) + '..' + ' ';
            else if (newtopic.length + str.length < threshold)
                newtopic += str + ' ';
            else if (newtopic.substring(newtopic.length - 2, newtopic.length) !== '..')
                newtopic += '..';
        });
        return newtopic;
    }

    render() {
        const small_tabs = this.state.width < 700;
        let tabs;
        if (!small_tabs) {
            tabs = this.props.topics.map(
                (topic) =>
                    (
                        <li className={styles.in}>
                            <a className={topic === this.state.active ? styles.active : styles.passive} onClick={() => { this.setState({ active: topic }); }}>{this.trimmed_topic(topic.title)}</a>
                            <div className={topic === this.state.active ? styles.active : styles.passive}></div>
                        </li>
                    )
            );
        } else {
            tabs = this.props.topics.map(
                (topic) =>
                    (
                        <li className={styles.in_sm}>
                            <a className={topic === this.state.active ? styles.bar_btn + " " + styles.b_active : styles.bar_btn + " " + styles.b_passive} onClick={() => { this.setState({ active: topic }); }}></a>
                        </li>
                    )
            );
        }
        const tabbar = <ul className={small_tabs ? styles.bar_sm : styles.bar}>{tabs}</ul>;
        const sm_title_comp = small_tabs ? <h3 style={{textAlign: 'center'}}>{this.state.active.title}</h3> : null;
        const tabbedSummary =
            (
                <div className={styles.viewport}>
                    <div>{tabbar}</div><br/>
                    <div>
                        {sm_title_comp}
                        <p className={styles.summ2}>{this.state.active.description}</p>
                    </div>
                    <div className={styles.box} style={{marginTop: '25px'}}>
                        <button className={styles.submit} onClick={() => { this.props.doSomething(this.state.active.id); }}>This one!</button>
                    </div>
                </div>
            );
        return tabbedSummary;
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
                    <li className={styles.in}>
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
