import React from 'react';

export default class IntroPage extends React.Component {

    constructor(props) {
        super(props);

        window.history.pushState(null, '', '/welcome')
    }

    componentDidMount() {
        window.scrollTo(0, 0);
    }

    render() {
        return (
            <div>hiii</div>
        )
    }
}
