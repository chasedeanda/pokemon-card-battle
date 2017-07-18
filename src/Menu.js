import React, { Component } from 'react';
import GetHands from './GetHands';

export default class Main extends Component {
    render(){
        return (
            <div>
                <div className="App-header">
                </div>
                <h2 className="tracking-in-expand">Prepare to Battle!</h2>
                <GetHands />
            </div>
        );
    }
}