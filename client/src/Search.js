import React from 'react';
import axios from 'axios';

export default class Search extends React.Component {
    constructor(props) {
        super(props);
        this.api_url = 'https://productive-produce-api.herokuapp.com';
        this.state = {
            select_mode: true,
            value: '',
            info: {},
            food_keeper: {},
            found: false,
            subtitle: '',
            name: '',
            image: 'watermelon.jpg',
            cost: {'value': 0.0, 'unit': 'US Cents'},
            nutrition: {
                'nutrients': [
                    {'amount': 0,
                    'unit': 'cal'}
                ]
            }
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
        axios.get(this.api_url + '/info/' + this.state.value)
          .then(res => {
            const data = res.data[0];
            console.log(data);
            if (!data['estimatedCost']) {
                data['estimatedCost'] = {'value': '?', 'unit': 'US Cents'}
            }
            if (!data['nutrition']) {
                data['nutrition'] = {
                'nutrients': [
                    {'amount': '?',
                    'unit': 'cal'}
                ]}
            }
            this.setState({
                info: data,
                name: data['name'],
                subtitle: data['aisle'],
                found: true,
                image: data['image'],
                cost: data['estimatedCost'],
                nutrition: data['nutrition']
            })
          });
        axios.get(this.api_url + '/foodkeeper/' + this.state.value)
          .then(res => {
            const data = res.data;
            console.log(data);
            this.setState({
                food_keeper: data
            })
          })
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
                <div>
                    {this.state.found ?
                    <div>
                        <article className="media">
                            <figure className="media-left">
                                <p className="image is-128x128">
                                    <img src={`https://spoonacular.com/cdn/ingredients_100x100/${this.state.image}`}/>
                                </p>
                            </figure>
                            <div className="media-content">
                                <div className="content">
                                    <p>
                                        <strong className="item-name">{this.state.name}</strong>
                                        <small> {this.state.subtitle}</small>
                                        <br/>
                                        <span className="icon is-medium has-text-success">
                                                <i className="fas fa-hand-holding-usd">&nbsp;</i>
                                        </span>
                                        <strong>{this.state.cost.value}</strong>
                                        <small> {this.state.cost.unit}</small>
                                         <br/>
                                         <span className="icon is-medium has-text-warning">
                                                <i className="fas fa-walking">&nbsp;</i>
                                        </span>
                                        <strong>{this.state.nutrition.nutrients[0].amount}</strong>
                                        <small> {this.state.nutrition.nutrients[0].unit} per serving</small>
                                    </p>
                                </div>
                            </div>
                        </article>
                    </div> :
                        <div>&nbsp;</div>}
                </div>
            </div>
        );
    }
}
