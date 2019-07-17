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
            item_cache: {},
            compost_data: {},
            compost_modal_class: 'modal',
            env_data: {},
            env_modal_class: 'modal',
            info_data: {},
            info_modal_class: 'modal'
        }
        ;
        this.handleClick = this.handleClick.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.removeGrocery = this.removeGrocery.bind(this);
        this.moveToPantry = this.moveToPantry.bind(this);

        this.removePantry = this.removePantry.bind(this);
        this.moveToGrocery = this.moveToGrocery.bind(this);
        this.mapItem = this.mapItem.bind(this);
        this.showCompostInfo = this.showCompostInfo.bind(this);
        this.showEnvironmentalInfo = this.showEnvironmentalInfo.bind(this);
        this.showInfo = this.showInfo.bind(this);
    }


    showInfo(d, display){
        if (display) {
            console.log('show modal');
            this.setState({
                info_modal_class: 'modal is-active',
                info_data: {
                    title: "When purchasing " + d.name + ": ",
                    purchasing: d['custom']['Purchasing'],
                    cooking: d['custom']['Tips']
                }
            })
        } else {
            this.setState({
                info_modal_class: 'modal',
                info_data: {}
            })
        }
    }

    showCompostInfo(d, display){
        if (display) {
            console.log('show modal');
            this.setState({
                compost_modal_class: 'modal is-active',
                compost_data: {
                    title: "Compost " + d.name,
                    link: d['custom']['Composting Website'],
                    content: d['custom']['Composting']
                }
            })
        } else {
            this.setState({
                compost_modal_class: 'modal',
                compost_data: {}
            })
        }
    }

    showEnvironmentalInfo(d, display) {
        if (display) {
            console.log('show modal');
            this.setState({
                env_modal_class: 'modal is-active',
                env_data: {
                    title: "Known Impact of " + d.name,
                    link: d['custom']['Environmental impact website'],
                    content: d['custom']['Environmental impact']
                }
            })
        } else {
            this.setState({
                env_modal_class: 'modal',
                env_data: {}
            })
        }
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
                        grocery: this.state.grocery.concat(data),
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
                        grocery: this.state.grocery.concat(data)
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
            pantry: this.state.pantry.concat(row)
        });
        this.removeGrocery(index);
    }

    moveToGrocery(row, index) {
        this.setState({
            grocery: this.state.grocery.concat(row)
        });
        this.removePantry(index);
    }


    render() {
        const {pantry, grocery, compost_modal_class, compost_data, env_data, env_modal_class, info_modal_class, info_data} = this.state;

        const pStyle = {
            width: '10px',
            marginLeft: '5px',
            textAlign: 'center'
        };

        const iStyle = {
            width: '64px',
            marginLeft: '5px',
            textAlign: 'center'
        };

        const rowStyle = {
            padding: '2em 1em',
            margin: '2em'
        };

        return (
            <div className="container">
               <div className={info_modal_class}>
                    <div className="modal-background"/>
                    <div className="modal-card">
                        <section className="modal-card-body">
                            <div className="tile is-ancestor">
                                <div className="tile is-vertical is-8">
                                    <div className="tile is-parent">
                                        <article className="tile is-child notification is-primary">
                                            <p className="subtitle">{info_data.title}</p>
                                            <div className="content">
                                                {info_data.purchasing}
                                            </div>
                                        </article>
                                    </div>
                                </div>
                                <div className="tile is-parent">
                                    <article className="tile is-child notification is-light">
                                        <div className="content">
                                            <p className="subtitle">Cooking Tips</p>
                                            <div className="content">
                                                {info_data.cooking}
                                            </div>
                                        </div>

                                    </article>
                                </div>
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button" onClick={() => this.showInfo({}, false)}>Close</button>
                        </footer>
                        <button className="modal-close is-large" onClick={() => this.showInfo({}, false)} />
                    </div>
                </div>
                <div className={env_modal_class}>
                    <div className="modal-background"/>
                    <div className="modal-card">
                        <section className="modal-card-body">
                            <div className="tile is-ancestor">
                                <div className="tile is-vertical is-8">
                                    <div className="tile is-parent">
                                        <article className="tile is-child notification is-danger">
                                            <p className="title">{env_data.title}</p>
                                            <p className="subtitle"><a href={env_data.link} target="_blank">(Source)</a></p>
                                            <div className="content">
                                                {env_data.content}
                                            </div>
                                        </article>
                                    </div>
                                </div>
                                <div className="tile is-parent">
                                    <article className="tile is-child notification is-light">
                                        <div className="content">
                                            <p className="subtitle">Links</p>
                                            <div className="content">
                                                <a href="https://www.bbc.com/news/science-environment-46459714" target="_blank">Your Food Carbon Footprint</a>
                                            </div>
                                            <div className="content">
                                                <a href="https://www.sciencedirect.com/topics/food-science/environmental-impact-of-food" target="_blank">Learn about the Environmental Impact of Food</a>
                                            </div>
                                        </div>

                                    </article>
                                </div>
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button" onClick={() => this.showEnvironmentalInfo({}, false)}>Close</button>
                        </footer>
                        <button className="modal-close is-large" onClick={() => this.showEnvironmentalInfo({}, false)} />
                    </div>
                </div>
                <div className={compost_modal_class}>
                    <div className="modal-background"/>
                    <div className="modal-card">
                        <section className="modal-card-body">
                            <div className="tile is-ancestor">
                                <div className="tile is-vertical is-8">
                                    <div className="tile is-parent">
                                        <article className="tile is-child notification is-success">
                                            <p className="title">{compost_data.title}</p>
                                            <p className="subtitle"><a href={compost_data.link} target="_blank">(Source)</a></p>
                                            <div className="content">
                                                {compost_data.content}
                                            </div>
                                        </article>
                                    </div>
                                </div>
                                <div className="tile is-parent">
                                    <article className="tile is-child notification is-light">
                                        <div className="content">
                                            <p className="subtitle">Links</p>
                                            <div className="content">
                                                <a href="http://www.findacomposter.com/" target="_blank">Find a Composter Near You</a>
                                            </div>
                                            <div className="content">
                                                <a href="https://sharewaste.com/share-waste" target="_blank">Share Your Waste!</a>
                                            </div>
                                        </div>

                                    </article>
                                </div>
                            </div>
                        </section>
                        <footer className="modal-card-foot">
                            <button className="button" onClick={() => this.showCompostInfo({}, false)}>Close</button>
                        </footer>
                        <button className="modal-close is-large" onClick={() => this.showCompostInfo({}, false)} />
                    </div>
                </div>
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
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {

                            grocery.map((d, i) => {
                                let compost = <span/>;
                                if (d.custom && d.custom['Composting'] && d.custom['Composting'].length > 0) {
                                    compost = <span onClick={() => this.showCompostInfo(d, true)}><i
                                        className="fas fa-recycle has-text-success info-buttons"
                                    >&nbsp;</i></span>;
                                }

                                let environmental = <span/>;
                                if (d.custom && d.custom['Environmental impact'] && d.custom['Environmental impact'].length > 0) {
                                    environmental = <span onClick={() => this.showEnvironmentalInfo(d, true)}><i
                                        className="fas fa-exclamation has-text-danger info-buttons"
                                    >&nbsp;</i></span>;
                                }

                                let info = <span/>;
                                if (d.custom && d.custom['Purchasing'] && d.custom['Purchasing'].length > 0) {
                                    info = <span onClick={() => this.showInfo(d, true)}><i
                                        className="fas fa-info-circle has-text-primary info-buttons"
                                    >&nbsp;</i></span>;
                                }
                                return (
                                    <tr key={i} style={rowStyle}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <div>
                                                <figure>
                                                    <p className="image is-64x64">
                                                        <img className="food-icon"
                                                             src={`https://spoonacular.com/cdn/ingredients_100x100/${d.image}`}/>
                                                    </p>
                                                </figure>

                                            </div>
                                        </td>
                                        <td>
                                            {d.name}
                                            <small className="aisle">{d['aisle']}</small>

                                        </td>
                                        <td>
                                            {info}<span>&nbsp;</span>{compost}<span>&nbsp;</span>{environmental}
                                        </td>
                                        <td>

                                            <button className="row-button button is-pulled-right tooltip"
                                                    data-tooltip={"Remove " + d.name}
                                                    onClick={() => this.removeGrocery(i)}>
                                                <i className="fas fa-trash">&nbsp;</i>
                                            </button>
                                            <button className="row-button button is-pulled-right tooltip"
                                                    data-tooltip={"Move " + d.name + " to Pantry"}
                                                    onClick={() => this.moveToPantry(d, i)}>
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
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        {

                            pantry.map((d, i) => {
                                let compost = <span/>;
                                if (d.custom && d.custom['Composting'] && d.custom['Composting'].length > 0) {
                                    compost = <span onClick={() => this.showCompostInfo(d, true)}><i
                                        className="fas fa-recycle has-text-success info-buttons"
                                    >&nbsp;</i></span>;
                                }
                                let environmental = <span/>;
                                if (d.custom && d.custom['Environmental impact'] && d.custom['Environmental impact'].length > 0) {
                                    environmental = <span onClick={() => this.showEnvironmentalInfo(d, true)}><i
                                        className="fas fa-exclamation has-text-danger info-buttons"
                                    >&nbsp;</i></span>;
                                }
                                let info = <span/>;
                                if (d.custom && d.custom['Purchasing'] && d.custom['Purchasing'].length > 0) {
                                    info = <span onClick={() => this.showInfo(d, true)}><i
                                        className="fas fa-info-circle has-text-primary info-buttons"
                                    >&nbsp;</i></span>;
                                }
                                return (
                                    <tr key={i} style={rowStyle}>
                                        <td>{i + 1}</td>
                                        <td>
                                            <div>
                                                <figure>
                                                    <p className="image is-64x64">
                                                        <img className="food-icon"
                                                             src={`https://spoonacular.com/cdn/ingredients_100x100/${d.image}`}/>
                                                    </p>
                                                </figure>

                                            </div>
                                        </td>
                                        <td>
                                            {d.name}
                                            <small className="aisle">{d['aisle']}</small>

                                        </td>
                                        <td>
                                            {info}<span>&nbsp;</span>{compost}<span>&nbsp;</span>{environmental}
                                        </td>
                                        <td>
                                            <button className="row-button  button is-pulled-right tooltip"
                                                    data-tooltip={"Remove " + d.name}
                                                    onClick={() => this.removePantry(i)}>
                                                <i className="fas fa-trash">&nbsp;</i>
                                            </button>
                                            <button className="row-button button is-pulled-right tooltip"
                                                    data-tooltip={"Add " + d.name + " to Grocery List"}
                                                    onClick={() => this.moveToGrocery(d, i)}>
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
