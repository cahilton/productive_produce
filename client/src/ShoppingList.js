import React from 'react';

export default class ShoppingList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            select_mode: true
        };
        this.handleClick = this.handleClick.bind(this);
    }

    componentDidMount() {

    }

    handleClick() {
        this.props.goHome();
    }


    render() {
        return (
            <div className="container">
                <a className="button" onClick={this.handleClick}>
                    <span className="icon is-small">
                        <i className="fas fa-arrow-left">&nbsp;</i>
                    </span>
                    <h1>Back</h1>
                </a>

            </div>
        );
    }
}
