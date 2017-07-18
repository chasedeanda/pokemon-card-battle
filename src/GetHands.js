import React, { Component } from 'react';
import autoBind from 'react-autobind';
import _ from 'lodash';
import Hand from './Hand';

export default class GetHands extends Component {
    constructor(){
        super();
        autoBind(this);
        this.state = {
            poke1: {
                img: '',
                turns: 0
            },
            poke2: {
                img: '',
                turns: 0
            },
            graveyard: [],
            playerTurn: '',
            mute: false,
            gameOver: false,
            battleMusic: ''
        }
        this.battleMusicTracks = ['battle-music.mp3', 'battle-music-2.mp3','battle-music-3.mp3', 'battle-music-4.mp3', 'battle-music-5.mp3'];
    }
    componentDidMount(){
        this.audio.volume = .2;
        this.attack.volume = .5;
        this.setState({
            battleMusic: _.shuffle(this.battleMusicTracks)[0]
        })
    }
    selectPokemon(pokemon, hand){
        const { poke1, poke2 } = this.state;
        let state = {};
        if(hand === 1 && !poke1.id){
            state = {
                poke1: pokemon,
                playerTurn: 'Player 2'
            }
        }else if(hand === 2 && !poke2.id){
            state = {
                poke2: pokemon,
                playerTurn: 'Player 1'
            }
        }
        this.setState(state);
    }
    handleFight(){
        const { poke1, poke2, graveyard, mute } = this.state;
        let first = _.clone(poke1),
            second = _.clone(poke2),
            state = {};
        let _graveyard = _.clone(graveyard);
        
        if(first.turns === 0 && second.turns === 0){
            if(first.spd > second.spd){
                state = this.firstWithSpeed(first,second,_graveyard);
            }else if(second.spd > first.spd){
                state = this.secondWithSpeed(first,second,_graveyard);
            }else{
                state = this.normalBattle(first,second,_graveyard);
            }
        }else{
            if(first.turns === 0){
                if(first.spd > second.spd){
                    state = this.firstWithSpeed(first,second,_graveyard);
                }else{
                    state = this.normalBattle(first,second,_graveyard);
                }
            }
            if(second.turns === 0){
                if(second.spd > first.spd){
                    state = this.secondWithSpeed(first,second,_graveyard);
                }else{
                    state = this.normalBattle(first,second,_graveyard);
                }
            }
            if(first.turns > 0 && second.turns > 0){
                state = this.normalBattle(first,second,_graveyard);
            }
        }
        state.first.turns = state.first.turns+1;
        state.second.turns = state.second.turns+1;

        state.first.def = Math.round( state.first.def * 10 ) / 10;
        state.second.def = Math.round( state.second.def * 10 ) / 10;

        let turn = this.state.playerTurn;
        if(state.first.id && !state.second.id){
            turn = 'Player 2';
        }
        if(state.second.id && !state.first.id){
            turn = 'Player 1';
        }

        if(!mute) this.attack.play();
        
        this.setState({
            poke1: state.first,
            poke2: state.second,
            graveyard: state._graveyard,
            playerTurn: turn
        });
    }
    firstWithSpeed(first, second, _graveyard){
        const { poke1, poke2 } = this.state;
        first.firstAttack = true;
        second.firstAttack = false;
        second.def = poke2.def - poke1.atk;
        if(second.def <= 0){
            second = {
                img: {}
            };
            _graveyard.push(poke2.id);
        }
        return {
            first,
            second,
            _graveyard
        }
    }
    secondWithSpeed(first, second, _graveyard){
        const { poke1, poke2 } = this.state;
        second.firstAttack = true;
        first.firstAttack = false;
        first.def = poke1.def - poke2.atk;
        if(first.def <= 0){
            first = {
                img: {}
            };
            _graveyard.push(poke1.id);
        }
        return {
            first,
            second,
            _graveyard
        }
    }
    normalBattle(first, second, _graveyard){
        const { poke1, poke2 } = this.state;
        first.firstAttack = false;
        second.firstAttack = false;
        second.def = poke2.def - poke1.atk;
        first.def = poke1.def - poke2.atk;
        if(first.def <= 0){
            first = {
                img: {}
            };
            _graveyard.push(poke1.id);
        }
        if(second.def <= 0){
            second = {
                img: {}
            };
            _graveyard.push(poke2.id);
        }
        return {
            first,
            second,
            _graveyard
        }
    }
    flipACoin(){
        let state = {};
        const player = this.coinToss();
        if(player === 1){
            state = {
                playerTurn: 'Player 1'
            }
        }else{
            state = {
                playerTurn: 'Player 2'
            }
        }
        this.setState(state)
    }
    toggleMute(){
        this.setState({
            mute: !this.state.mute,
            battleMusic: _.shuffle(this.battleMusicTracks)[0]
        }, () => {
            if(!this.state.mute){
                this.audio.volume = .2;
                this.attack.volume = .5;
            }
        });
    }
    endBattle(player){
        this.setState({
            gameOver: true,
            winner: player === 1 ? 2 : 1,
            battleMusic: 'victory.mp3'
        });
    }
    newGame(){
        this.setState({
            poke1: {
                img: '',
                turns: 0
            },
            poke2: {
                img: '',
                turns: 0
            },
            graveyard: [],
            playerTurn: ''
        })
    }
    coinToss(){
        return Math.floor(Math.random()*2 + 1)
    }
    render(){
        let { poke1, poke2, graveyard, playerTurn, mute, gameOver, battleMusic, winner } = this.state;
        poke1 = poke1 || {};
        poke2 = poke2 || {};
        return (
            <div>
                <div className="main">
                    
                    <Hand selectPokemon={this.selectPokemon} player={1} graveyard={graveyard} endBattle={this.endBattle} gameOver={gameOver} winner={winner}/>
                    <div className="battle-cont">
                        {!gameOver && playerTurn.length > 0 && (!poke1.id || !poke2.id) &&
                            <span className="player-turn pulsate-fwd">
                                Your Turn 
                                <span className={playerTurn === 'Player 1' ? 'one' : 'two'}>{` ${playerTurn}`}</span>
                            </span>
                        }
                        {gameOver && <span className="player-turn pulsate-fwd">
                            <span className={`${winner === 1 ? 'one' : 'two'}`}>
                                {`${winner === 1 ? 'Player 1 ' : 'Player 2 '} `}
                            </span>
                            Wins!
                            </span>
                        }
                        {poke1.id && poke2.id && <span className="player-turn pulsate-fwd battle">BATTLE!</span>}
                        {!poke1.id && <CardOutline />}
                        {poke1.id && <BattlePoke pokemon={poke1} player={1} animation="poke1" />}
                        {!poke2.id && <CardOutline />}
                        {poke2.id && <BattlePoke pokemon={poke2} player={2} animation="poke2" />}
                        <br/>
                        <button className={`battle-button ${poke1.id && poke2.id ? '' : 'disabled'}`} disabled={!poke1.id || !poke2.id} onClick={this.handleFight}>Battle</button>
                        <br/>
                        {playerTurn.length === 0 && <button className="new-hand-btn" onClick={this.flipACoin}>Flip a coin</button>}
                    </div>
                    <Hand selectPokemon={this.selectPokemon} player={2} graveyard={graveyard} endBattle={this.endBattle} gameOver={gameOver} winner={winner}/>
                </div>
                
                {!mute && 
                <div>
                    <audio
                        src={battleMusic}
                        ref={ref => this.audio = ref}
                        autoPlay
                        loop>
                        Your browser does not support the <code>audio</code> element.
                    </audio>
                    <audio src="attack2.mp3" ref={ref => this.attack = ref}></audio>
                </div>
                }
                <a className="mute-toggle" onClick={this.toggleMute}>{`Mute ${mute ? 'On' : 'Off'}`}</a>
            </div>
        )
    }
}

const BattlePoke = ({pokemon, animation}) => (
    <div key={`${pokemon.id}-${pokemon.turns}`} className={`card battle-poke ${animation} ${pokemon.type} ${pokemon.turns > 0 ? 'not-first-turn' : ''} ${pokemon.firstAttack && 'first-attack'}`}>
        <img src={pokemon.img} />
        <div className="info">
            <div className="name">
                <span>{_.capitalize(pokemon.name)}</span>
            </div>
            <div className="stats">
                <span>ATK</span>
                <span>DEF</span>
                <span>SPD</span>
                <span className="atk">{pokemon.atk}</span>
                <span className="def">{pokemon.def}</span>
                <span className="spd">{pokemon.spd}</span>
            </div>
        </div>
    </div>
);

const CardOutline = () => (
    <div className="card-outline">
        <span>Select A Pokemon</span>
    </div>
);