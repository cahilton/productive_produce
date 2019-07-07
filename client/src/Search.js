import React from 'react';

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            select_mode: true,
            value: ''
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {

    if (this.state.value === '') {
        console.log('empty input')
    } else{
        console.log(this.state.value);
    }
    event.preventDefault();
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
                <div className="content content-body">
                  <form onSubmit={this.handleSubmit}>
                      <div className="field">
                    <label>
                      Search:
                      <input type="text" className="input is-primary" placeholder="Search term..."
                             value={this.state.value} onChange={this.handleChange} />
                    </label>
                      </div>
                      <div className="field">
                        <input className="button is-primary is-medium" type="submit" value="Go" />
                      </div>
                  </form>
                </div>
            </div>
        );
    }
}
