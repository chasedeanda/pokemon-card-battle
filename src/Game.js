import React, { Component } from 'react';
import GetHands from './GetHands';
import firebase from './FirebaseConnect';
import autoBind from 'react-autobind';

export default class Game extends Component {
    constructor(){
        super();
        autoBind(this);
        this.state = {
            game: {},
            hasCode: true
        }
    }
    handleClick(){
        //Set battle code and pass it to GetHands where they can join their opponent
        this.props.history.push(`/multiplayer/online/${this.code.value}`);
    }
    handleNoCode(){
        this.setState({
            hasCode: false
        });
    }
    handleEnterBattle(){
        //Route to GetHands with battle code
        this.props.history.push(`/multiplayer/online/${this.state.battleCode}`);
    }
    handleGetCode(){
        //Create new firebase game and show unique code. Then redirect to their game while they wait for their opponent
        const games = firebase.database().ref('battles');
        const battle = {
            code: this.getBattleCode(),
            player1Loaded: false,
            player2Loaded: false
        };
        games.push(battle);
        this.setState({
            battleCode: battle.code
        });
    }
    getBattleCode(){
        return Date.now();
    }
    render(){
        const { game, hasCode, battleCode } = this.state;
        return (
            <div>
                {game.id && <GetHands {...this.props} />}
                {!game.id && 
                    <div>
                        {hasCode &&
                            <div>
                                <input type="text" placeholder="Enter Battle Code" ref={ref => this.code = ref} />
                                <button onClick={this.handleClick}>BATTLE</button><br/><br/>
                                <button onClick={this.handleNoCode}>Don't have a code?</button>
                            </div>
                        }
                         {!hasCode &&
                            <div>
                                <input type="text" placeholder="Enter Battle Code" value={this.state.battleCode} readOnly />
                                <button onClick={this.handleGetCode}>Get Battle Code</button><br/><br/>
                                {battleCode && <button onClick={this.handleEnterBattle}>BATTLE</button> }
                            </div>
                        }
                    </div>
                }
            </div>
        )
    }
}