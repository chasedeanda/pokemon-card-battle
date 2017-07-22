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
        const battles = firebase.database().ref('battles');
        const battle = {
            player1Loaded: false,
            player2Loaded: false
        };
        const battleRef = battles.push(battle);
        battle.code = battleRef.key;
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
                    <div className="code-form">
                        <h1 className="pulsate-fwd">Online Battle</h1>
                        <img src="/online.svg" />
                        {hasCode &&
                            <div>
                                <p>Copy and Paste your Battle Code below</p>
                                <input type="text" placeholder="Enter Battle Code" ref={ref => this.code = ref} /><br/>
                                <button className="enter-battle-btn" onClick={this.handleClick}>ENTER BATTLE</button><br/><br/>
                                <button className="no-code-btn" onClick={this.handleNoCode}>Don't have a code?</button>
                            </div>
                        }
                         {!hasCode &&
                            <div>
                                <p>Get a Battle Code and share it with your opponent</p>
                                <input type="text" placeholder="Enter Battle Code" value={this.state.battleCode} readOnly /><br/>
                                <button className="no-code-btn" onClick={this.handleGetCode}>Get Battle Code</button><br/><br/>
                                {battleCode && <button className="enter-battle-btn" onClick={this.handleEnterBattle}>BATTLE</button> }
                            </div>
                        }
                    </div>
                }
            </div>
        )
    }
}