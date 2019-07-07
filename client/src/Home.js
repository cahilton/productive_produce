import React from 'react';
import ShoppingList from './ShoppingList';
import Search from './Search';
import MealPlan from './MealPlan';

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            select_mode: true,
            active_view: "search"
        };
        this.settingView = this.settingView.bind(this);
        this.goHome = this.goHome.bind(this);
    }

    componentDidMount() {

    }

    settingView(active) {
        this.setState({
            'active_view': active,
            'select_mode': false
        })
    }

    goHome() {
        this.setState({
            select_mode: true,
            active_view: "search"
        });
    }

    render() {
        let viewComponent;
        if (this.state.active_view === "search") {
            viewComponent = <Search goHome={this.goHome}/>;
        } else if (this.state.active_view === "shopping") {
            viewComponent = <ShoppingList goHome={this.goHome}/>;
        } else {
            viewComponent = <MealPlan goHome={this.goHome}/>;
        }
        return (
            <div style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                {this.state.select_mode ?
                    <div className="container">
                        <h1 className="subtitle">
                            Our aim is to help you save money, eat healthfully, and reduce waste, by
                            optimizing your <strong>produce</strong> purchasing and consumption habits.
                        </h1>
                        <div className="columns">
                            <div className="column">
                                <button className="button is-large is-primary is-fullwidth"
                                    onClick={() => this.settingView('search')}>
                                    Search Produce
                                </button>
                            </div>
                            <div className="column">
                                <button className="button is-large is-link is-fullwidth"
                                onClick={() => this.settingView('shopping')}>
                                    Create Shopping List
                                </button>
                            </div>
                            <div className="column">
                                <button className="button is-large is-info is-fullwidth"
                                onClick={() => this.settingView('mealplan')}>
                                    Create Meal Plan
                                </button>
                            </div>
                        </div>
                    </div>
                    :
                    <div>
                        {viewComponent}
                    </div>
                }
            </div>
        );
    }
}