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
            newHand: 0
        }
        this.handSize = 6;
        this.BASE = 'http://pokeapi.co/api/v2';
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
        return Math.floor(Math.random()*718 + 1);
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
                        atk: this.getAverage(results[i].data.stats[4].base_stat/10, results[i].data.stats[2].base_stat/10),
                        def: this.getAverage(results[i].data.stats[1].base_stat/10, results[i].data.stats[3].base_stat/10),
                        spd: results[i].data.stats[0].base_stat/10,
                        type: results[i].data.types[0].type.name,
                        turns: 0
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
    }
    componentWillReceiveProps(nextProps){
        let hand = this.state.hand.filter( pokemon => !_.includes(nextProps.graveyard, pokemon.id))
        this.setState({
            hand: hand
        });
    }
    render(){
        const { loading, hand, newHand } = this.state;
        if(loading){
            return <div className="loading">Loading hand...</div>
        }else{
            const pokemon = hand.map( pokemon => <Pokemon key={pokemon.id} selectPokemon={this.handleSelect} pokemon={pokemon} /> );
            return( 
                <div>
                    <div className="poke-hand">
                        {pokemon}
                    </div>
                    {newHand < 2 && <button className={`new-hand-btn ${this.props.player}`} onClick={this.handleClick}>Get New Hand</button>}
                </div>
            );
        }
    }
}

const Pokemon = ({pokemon, selectPokemon}) => (
<div onClick={selectPokemon.bind(this, pokemon)} className={`card ${pokemon.type}`}>
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