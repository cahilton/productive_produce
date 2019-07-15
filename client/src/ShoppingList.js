import React from 'react';
import axios from "axios";



export default class ShoppingList extends React.Component {
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
            pantry: [],
            grocery: [],
            item_cache: {}
        };
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeGrocery = this.removeGrocery.bind(this);
        this.moveToPantry = this.moveToPantry.bind(this);

        this.removePantry = this.removePantry.bind(this);
        this.moveToGrocery = this.moveToGrocery.bind(this);
        this.mapItem = this.mapItem.bind(this);
    }

    mapItem(res, input) {
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
        if (!data['image']) {
            data['image'] = 'watermelon.jpg'
        }
        data['name'] = input;
        return data
    }

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
                    const data = this.mapItem(res, this.state.value);

                    this.setState({
                        grocery : this.state.grocery.concat(data),
                        value: ''
                    })
                });
        }
        event.preventDefault();
    }


    componentDidMount() {
        const shopItems = ['Baby Carrots', 'Bag Lettuce'];
        for (let i in shopItems) {
            axios.get(this.api_url + '/info/' + shopItems[i])
                .then(res => {
                    const data = this.mapItem(res, shopItems[i]);
                    this.setState({
                         grocery : this.state.grocery.concat(data)
                    })
                });
        }

        const defaultItems = ['Salt', 'Sugar'];
        for (let i in defaultItems) {
            axios.get(this.api_url + '/info/' + defaultItems[i])
                .then(res => {
                    const data = this.mapItem(res, defaultItems[i]);
                    this.setState({
                         pantry : this.state.pantry.concat(data)
                    })
                });
        }

    }

    handleClick() {
        this.props.goHome();
    }

    removeGrocery(index) {
      let array = [...this.state.grocery];
      if (index !== -1) {
        array.splice(index, 1);
        this.setState({grocery: array});
      }
    }

    removePantry(index) {
      let array = [...this.state.pantry];
      if (index !== -1) {
        array.splice(index, 1);
        this.setState({pantry: array});
      }
    }

    moveToPantry(row, index) {
        this.setState({
             pantry : this.state.pantry.concat(row)
        });
        this.removeGrocery(index);
    }

    moveToGrocery(row, index) {
        this.setState({
             grocery : this.state.grocery.concat(row)
        });
        this.removePantry(index);
    }



    render() {
        const {value, pantry, grocery} = this.state;

        const pStyle = {
          width: '10px',
          marginLeft: '5px',
          textAlign: 'center'
        };

         const iStyle = {
          width: '32px',
          marginLeft: '5px',
          textAlign: 'center'
        };

         const rowStyle = {
             padding: '2em 1em',
             margin: '2em'
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
                    <h1 className="h3 list-header ">Shopping List</h1>
                   <table className="table is-fullwidth is-hoverable">
                        <thead>
                            <tr>
                                <th style={pStyle}>#</th>
                                <th style={iStyle}>Item</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        {

                            grocery.map((d, i) => {
                                return (
                                    <tr key={i} style={rowStyle}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <div>
                                                <figure>
                                                    <p className="image is-32x32">
                                                        <img className="food-icon" src={`https://spoonacular.com/cdn/ingredients_100x100/${d.image}`}/>
                                                    </p>
                                                </figure>

                                            </div>
                                        </td>
                                        <td>
                                            {d.name} <small className="aisle">{ d['aisle']}</small>

                                        </td>
                                        <td>

                                            <button className="row-button button is-pulled-right tooltip" data-tooltip={ "Remove " + d.name} onClick={() => this.removeGrocery(i)}>
                                                <i className="fas fa-trash">&nbsp;</i>
                                            </button>
                                             <button className="row-button button is-pulled-right tooltip"  data-tooltip={ "Move " + d.name + " to Pantry"} onClick={() => this.moveToPantry(d, i)}>
                                                <i className="fas fa-home">&nbsp;</i>
                                            </button>
                                        </td>
                                      </tr>
                                );
                            })
                        }
                        </tbody>
                    </table>
                </div>

                <div>
                    <h1 className="h3 list-header ">Pantry List</h1>
                                     <table className="table is-fullwidth is-hoverable">
                        <thead>
                            <tr>
                                <th style={pStyle}>#</th>
                                <th style={iStyle}>Item</th>
                                <th></th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                        {

                            pantry.map((d, i) => {
                                return (
                                    <tr key={i} style={rowStyle}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <div>
                                                <figure>
                                                    <p className="image is-32x32">
                                                        <img  className="food-icon" src={`https://spoonacular.com/cdn/ingredients_100x100/${d.image}`}/>
                                                    </p>
                                                </figure>

                                            </div>
                                        </td>
                                        <td>
                                            {d.name} <small className="aisle">{ d['aisle']}</small>

                                        </td>
                                        <td>
                                            <button className="row-button  button is-pulled-right tooltip" data-tooltip={ "Remove " + d.name} onClick={() => this.removePantry(i)}>
                                                <i className="fas fa-trash">&nbsp;</i>
                                            </button>
                                            <button className="row-button button is-pulled-right tooltip"  data-tooltip={ "Add " + d.name + " to Grocery List"}  onClick={() => this.moveToGrocery(d, i)}>
                                                <i className="fas fa-shopping-basket">&nbsp;</i>
                                            </button>

                                        </td>
                                      </tr>
                                );
                            })
                        }
                        </tbody>
                    </table>
                </div>

            </div>
        );
    }
}
