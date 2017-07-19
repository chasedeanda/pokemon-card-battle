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
        <Link to="/single-player">Single Player</Link>
        <Link to="/multiplayer">Multiplayer</Link>
    </div>
)