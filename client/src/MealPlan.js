import React from 'react';
import axios from "axios";
import Autosuggest from 'react-autosuggest';


const suggs = ['Apple'];

const getSuggestions = value => {
    const inputValue = value.trim().toLowerCase();
    const inputLength = inputValue.length;

    return inputLength === 0 ? [] : suggs.filter(s =>
        s.toLowerCase().slice(0, inputLength) === inputValue
    );
};

const getSuggestionValue = suggestion => suggestion;

const renderSuggestion = suggestion => (
    <div>
        {suggestion}
    </div>
);


export default class MealPlan extends React.Component {
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
                    {
                        'amount': 0,
                        'unit': 'cal'
                    }
                ]
            },
            suggestions: [],
            pantry: [],
            grocery: []
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onSuggestionsFetchRequested = this.onSuggestionsFetchRequested.bind(this);
        this.onSuggestionsClearRequested = this.onSuggestionsClearRequested.bind(this);
    }

    onChange = (event, {newValue}) => {
        this.setState({
            value: newValue
        });
    };

    onSuggestionsFetchRequested = ({value}) => {
        this.setState({
            suggestions: getSuggestions(value)
        });
    };

    onSuggestionsClearRequested = () => {
        this.setState({
            suggestions: []
        });
    };

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {

        if (this.state.value === '') {
            console.log('empty input')
        } else {
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
                                {
                                    'amount': '?',
                                    'unit': 'cal'
                                }
                            ]
                        }
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
        const {value, suggestions} = this.state;

        const inputProps = {
          placeholder: 'Type a food...like apple',
          value,
          onChange: this.onChange
        };

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
                                       value={this.state.value} onChange={this.handleChange}/>
                            </label>
                        </div>
                        <div className="field">
                            <input className="button is-primary is-medium" type="submit" value="Go"/>
                        </div>
                    </form>
                </div>
                <div>
                    <h1>Shopping List</h1>
                    <table>

                    </table>
                </div>
                <div>
                    <h1>Pantry List</h1>
                    <table>

                    </table>
                </div>

            </div>
        );
    }
}
