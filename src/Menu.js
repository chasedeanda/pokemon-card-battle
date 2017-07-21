import React, { Component } from 'react';
import GetHands from './GetHands';
import Game from './Game';
import { Route, Link, Redirect, Switch } from 'react-router-dom';

export default class Main extends Component {
    render(){
        return (
            <div>
                <div className="App-header">
                </div>
                <Switch>
                    <Route exact path="/" component={Menu} />
                    <Route exact path="/single-player/" render={props => <GetHands players={1} {...props} />} />
                    <Route exact path="/multiplayer/online/" component={Game} />
                    <Route exact path="/multiplayer/online/:code" render={props => <GetHands players={2} online {...props} />} />
                    <Route exact path="/multiplayer" render={props => <GetHands players={2} {...props} />} />
                    <Route exact path="/new-game/:type" render={props => <Redirect to={`/${props.match.params.type}`} /> }/>
                </Switch>
            </div>
        );
    }
};

const Menu = () => (
    <div>
        <h1 className="tracking-in-expand">Prepare to Battle!</h1>
        <div className="game-types scale-in-center">
            <MenuOption to="/single-player" text="1P" />
            <MenuOption to="/multiplayer" text="2P"/>
        </div>
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