import React, {Component} from 'react';
import styles from './Styling/styles.module.css';

export class TabbedSummary extends Component {
    /* Inputs:
        topics : list
        doSomething : function
     */
    constructor(props) {
        super(props);
        if (!props.topics || !props.doSomething) throw 'Tabbed Summary Error: Parameters are invalid';
        if (props.topics.length === 0) throw 'Tabbed Summary Error: no topics provided';
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
    render() {
        let small_tabs = this.state.width < 700;
        // let tabsClassname = (small_tabs ? "in" : "in_small");
        let tabs;
        if (!small_tabs) {
            tabs = this.props.topics.map(
            (topic) =>
                (
                    <li class={styles.in}>
                        <a class={topic === this.state.active ? styles.active : styles.passive } onClick={() => { this.setState({ active: topic }); }}>{topic.title}</a>
                        <div class={topic === this.state.active ? styles.active : styles.passive }></div>
                    </li>
                )
            );
        } else {
            tabs = this.props.topics.map(
            (topic) =>
                (
                    <li class={styles.in_sm}>
                        <a class={topic === this.state.active ? styles.bar_btn + " " + styles.b_active : styles.bar_btn + " " + styles.b_passive} onClick={() => { this.setState({ active: topic }); }}></a>
                    </li>
                )
            );
        }
        let tabbar = <ul class={small_tabs ? styles.bar_sm : styles.bar}>{tabs}</ul>
        let sm_title_comp = small_tabs ? <h3 style={{textAlign: 'center'}}>{this.state.active.title}</h3> : null;
        let tabbedSummary =
            (
                <div class={styles.viewport}>
                    <div >{tabbar}</div><br/>
                <div >
                    {sm_title_comp}
                    <p class={styles.summ2}>{this.state.active.description}</p>
                    </div>
                    <div class={styles.box} style={{marginTop: '25px'}}>
                        <button class={styles.submit} onClick={() => { this.props.doSomething(this.state.active.id); }} >Submit</button>
                    </div>
                </div>
        );
        return tabbedSummary;
    }
}

export  class TabbedContent extends Component {
    /* Inputs:
        topics : list { title: .. , content: .. }
     */
    constructor(props) {
        super(props);
        if (!props.topics || props.topics.length === 0) throw 'Tabbed Content Error: no topics provided';
        this.state = { active: this.props.topics[0] };
    }
    render() {
        let tabs = this.props.topics.map(
        (topic) =>
            (
                <li class={styles.in}>
                    <a class={topic === this.state.active ? styles.active : styles.passive} onClick={() => { this.setState({ active: topic }); }}>{topic.title}</a>
                    <div class={topic === this.state.active ? styles.active : styles.passive}></div>
                </li>
            )
        );
        let tabbar = <ul class={styles.bar}>{tabs}</ul>
        let content =
        (
            <div class={styles.confined_viewport}>
                <div >{tabbar}</div><br/>
            <div >{this.state.active.content}</div>
            </div>
        );
        return content;
    }
}
