import React, { Component } from 'react';
import GetHands from './GetHands';
import { Route, Link } from 'react-router-dom';

export default class Main extends Component {
    render(){
        return (
            <div>
                <div className="App-header">
                </div>
                <h2 className="tracking-in-expand">Prepare to Battle!</h2>
                <Route exact path="/" component={Menu} />
                <Route exact path="/single-player" render={props => <GetHands players={1} />} />
                <Route exact path="/multiplayer" render={props => <GetHands players={2} />} />
            </div>
        );
    }
};

const Menu = () => (
    <div className="game-types scale-in-center">
        <MenuOption to="/single-player" text="1P" />
        <MenuOption to="/multiplayer" text="2P"/>
    </div>
)

class MenuOption extends Component{ 
    constructor(){
        super();
        this.state = {
            ready: false
        }
    }
    render(){
        const { to, text } = this.props;
        const { ready } = this.state;
        return (
            <div className="pulsate-fwd type" onMouseEnter={() => this.setState({ ready: true })} onMouseLeave={() => this.setState({ ready: false })}>
                <Link className="tracking-in-expand" to={to}>{ready ? 'READY!' : text}</Link>
            </div>
        )
    }
}