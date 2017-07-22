import axios from 'axios';
import autoBind from 'react-autobind';
import React, { Component } from 'react';
import _ from 'lodash';
export default class Hand extends Component {
    constructor(props){
        super(props);
        autoBind(this);
        this.state = {
            hand: [],
            loading: true,
            newHand: 0,
            battleStarted: false
        }
        this.handSize = 6;
        this.BASE = 'https://pokeapi.co/api/v2';
    }
    componentDidMount(){
        this.populateHand();
    }
    populateHand(){
        let hand = [];
        for(let i = 0;i < this.handSize;){
            const rand = this.getRandomNumber();
            if(!hand.some(num => num === rand)){
                hand.push(rand);
                i++;
            }
        }
        this.fetchPokemon(hand);
    }
    getRandomNumber(){
        return Math.floor(Math.random()*721 + 1);
    }
    fetchPokemon(hand){
        let requests = [];
        for(let i = 0; i < hand.length; i++){
            requests.push(axios.get(`${this.BASE}/pokemon/${hand[i]}`))
        }
        axios.all(requests)
            .then(results => {
                let pokemon = [];
                for(var i = 0; i < results.length; i++){
                    pokemon.push({
                        id: results[i].data.id,
                        name: results[i].data.name,
                        img: results[i].data.sprites.front_default,
                        shinyImg: results[i].data.sprites.front_shiny,
                        atk: this.getAverage(results[i].data.stats[4].base_stat/10, results[i].data.stats[2].base_stat/10),
                        def: this.getAverage(results[i].data.stats[1].base_stat/10, results[i].data.stats[3].base_stat/10),
                        spd: results[i].data.stats[0].base_stat/10,
                        type: results[i].data.types[0].type.name,
                        turns: 0,
                        wins: 0,
                        safeId: results[i].data.id,
                        player: this.props.player,
                        evolved: false,
                        evolvedCount: 0
                    });
                }
                this.setState({
                    hand: pokemon,
                    loading: false
                });
            });
    }
    getAverage(num1, num2){
        const avg = (num1+num2)/2;
        return Math.round( avg * 10 ) / 10;
    }
    handleClick(){
        this.setState({
            loading: true,
            newHand: this.state.newHand + 1
        });
        this.populateHand();
    }
    handleSelect(pokemon){
        this.props.selectPokemon(pokemon, this.props.player);
        this.setState({
            battleStarted: true,
            computerThinking: false
        });
    }
    autoSelectBest(){
        const { opponent } = this.props;
        if(opponent.id){
            const betterSpd = this.state.hand.filter( pokemon => pokemon.spd > opponent.spd),
            betterAtk = this.state.hand.filter( pokemon => pokemon.atk > opponent.atk),
            betterDef = this.state.hand.filter( pokemon => pokemon.def > opponent.def),
            betterAll = _.intersectionBy(betterSpd,betterAtk,betterDef, 'id');
            if(betterAll.length > 0){
                return _.shuffle(betterAll)[0];
            }else{
                const nextBest = this.state.hand.filter( pokemon => {
                    return _.includes(_.intersectionBy(betterSpd,betterAtk,'id'), pokemon) 
                        || _.includes(_.intersectionBy(betterSpd,betterDef,'id'), pokemon) 
                        || _.includes(_.intersectionBy(betterAtk,betterDef,'id'), pokemon) 
                });
                if(nextBest.length > 0){
                    return _.shuffle(nextBest)[0];
                }else{
                    return this.getBestInHand();
                }
            }
        }else{
            return this.getBestInHand();
        }
    }
    getBestInHand(){
        return _.orderBy(this.state.hand, ['spd', 'atk', 'def'], ['desc','desc','desc'])[0];
    }
    componentWillReceiveProps(nextProps){
        let hand = this.state.hand.filter( pokemon => !_.find(nextProps.graveyard, {safeId: pokemon.safeId, player: nextProps.player}))
        if(hand.length === 0 && !nextProps.gameOver && nextProps.graveyard.length > 0){
            this.props.endBattle(this.props.player);
        }
        if(nextProps.computerPlayer && hand.length > 0 && !nextProps.gameOver && nextProps.playerTurn === this.props.player){
            this.setState({
                computerThinking: true,
                battleStarted: true
            });
            setTimeout(() => { 
                this.handleSelect(this.autoSelectBest())
            }, 2000)
        }
        this.setState({
            hand: hand
        });
    }
    render(){
        const { loading, hand, newHand, battleStarted, computerThinking } = this.state;
        const { player, winner, computerPlayer, hasSelected } = this.props;
        const isThinking = computerThinking && !hasSelected;
        if(loading){
            return <Loading player={player} />;
        }else{
            const pokemon = hand.map( pokemon => <Pokemon key={pokemon.id} cpu={computerPlayer} selectPokemon={this.handleSelect} pokemon={pokemon} winner={winner} player={player} /> );
            return( 
                <div>
                    {!computerPlayer && <h1 className={`${player === 1 ? 'one' : 'two'}`}>{`${player === 1 ? 'Player 1' : 'Player 2'}`}</h1>}
                    {computerPlayer && <h1 className={isThinking ? "ellipsis two":"two"}>{isThinking ? 'Thinking' : 'CPU'}</h1>}
                    <div className={`poke-hand ${player === 1 ? 'slide-in-bck-left' : 'slide-in-bck-right'}`}>
                        {pokemon}
                    </div>
                    {!computerPlayer && newHand < 2 && !battleStarted && <button className={`new-hand-btn ${this.props.player}`} onClick={this.handleClick}>Get New Hand</button>}
                </div>
            );
        }
    }
}

const Pokemon = ({pokemon, cpu, selectPokemon, winner = 0, player}) => (
<div onClick={!cpu ? selectPokemon.bind(this, pokemon) : null} className={`card ${pokemon.type} ${winner === player ? 'pulsate-fwd':''}`}>
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

const Loading = ({player}) => (
    <div className="loading ">
        <img src={player === 1 ? '/pikachu.gif' : '/mew.gif'} /><br/>
        <span className="ellipsis">Catching Pokémon</span>
    </div>
)