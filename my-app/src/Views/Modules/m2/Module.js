import React, {Component} from 'react';
import './Styling/style.css';

export class TabbedSummary extends Component {
    /* Inputs:
        topics : list
        doSomething : function
     */
    constructor(props) {
        super(props);
        this.state = { active: this.props.topics[0], width: 0, height: 0 };
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
                    <li class="in">
                        <a class={topic === this.state.active ? "active" : "passive"} onClick={() => { this.setState({ active: topic }); }}>{topic.title}</a>
                        <div class={topic === this.state.active ? "active" : "passive"}></div>
                    </li>
                )
            );
        } else {
            tabs = this.props.topics.map(
            (topic) =>
                (
                    <li class="in_sm">
                        <a class={topic === this.state.active ? "bar_btn b_active" : "bar_btn b_passive"} onClick={() => { this.setState({ active: topic }); }}></a>
                    </li>
                )
            );
        }
        let tabbar = <ul class={small_tabs ? "bar_sm" : "bar"}>{tabs}</ul>
        let sm_title_comp = small_tabs ? <h3 style={{textAlign: 'center'}}>{this.state.active.title}</h3> : null;
    let tabbedSummary =
        (
            <div class="viewport">
                <div >{tabbar}</div><br/>
            <div class="summ2">
                {sm_title_comp}
                <p>{this.state.active.description}</p>
                </div>
                <div class="box" style={{marginTop: '25px'}}>
                    <button class="submit" onClick={() => { this.props.doSomething(this.state.active.id); }} >Submit</button>
                </div>
            </div>
        );
        return tabbedSummary;
    }
}

export const Vote = (page_title, section_title, summary, topics, doSomething) => {
    return (
        <div id="mod2" >
            <h1>{page_title}</h1>
            <div style={{textAlign: 'center'}}>
                <h2>{section_title}</h2>
            </div>
            <div >
            <p class="summ">{summary}</p>
            </div>
            <div  style={{marginTop: '25px'}}>
                <TabbedSummary topics={topics} doSomething={doSomething} />
            </div>
        </div>
    );
}
