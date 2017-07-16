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
            graveyard: []
        }
    }
    selectPokemon(pokemon, hand){
        const { poke1, poke2 } = this.state;
        let state = {};
        if(hand === 1 && !poke1.id){
            state = {
                poke1: pokemon
            }
        }else if(hand === 2 && !poke2.id){
            state = {
                poke2: pokemon
            }
        }
        this.setState(state);
    }
    handleFight(){
        const { poke1, poke2, graveyard } = this.state;
        let first = _.clone(poke1),
            second = _.clone(poke2),
            state = {};
        let _graveyard = _.clone(graveyard);
        debugger
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
        }
        first.turns = first.turns+1;
        second.turns = second.turns+1;

        first.def = Math.round( first.def * 10 ) / 10;
        second.def = Math.round( second.def * 10 ) / 10;
        
        this.setState({
            poke1: state.first,
            poke2: state.second,
            graveyard: state._graveyard
        });
    }
    firstWithSpeed(first, second, _graveyard){
        const { poke1, poke2 } = this.state;
        debugger
        second.def = poke2.def - poke1.atk;
        if(second.def <= 0){
            second = {
                img: {}
            };
            _graveyard.push(poke2.id);
        }else{
            first.def = poke1.def - poke2.atk;
            if(first.def <= 0){
                first = {
                    img: {}
                };
                _graveyard.push(poke1.id);
            }
        }
        return {
            first,
            second,
            _graveyard
        }
    }
    secondWithSpeed(first, second, _graveyard){
        const { poke1, poke2 } = this.state;
        debugger
        first.def = poke1.def - poke2.atk;
        if(first.def <= 0){
            first = {
                img: {}
            };
            _graveyard.push(poke1.id);
        }else{
            second.def = poke2.def - poke1.atk;
            if(second.def <= 0){
                second = {
                    img: {}
                };
                _graveyard.push(poke2.id);
            }
        }
        return {
            first,
            second,
            _graveyard
        }
    }
    normalBattle(first, second, _graveyard){
        const { poke1, poke2 } = this.state;
        debugger
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
    render(){
        let { poke1, poke2, graveyard } = this.state;
        poke1 = poke1 || {};
        poke2 = poke2 || {};
        return (
            <div>
                <div className="battle-cont">
                    {!poke1.id && <CardOutline />}
                    {poke1.id && <BattlePoke pokemon={poke1} animation="vibrate-1" />}
                    {!poke2.id && <CardOutline />}
                    {poke2.id && <BattlePoke pokemon={poke2} animation="vibrate-2" />}
                    <br/>
                    <button className={`battle-button ${poke1.id && poke2.id ? '' : 'disabled'}`} disabled={!poke1.id || !poke2.id} onClick={this.handleFight}>Battle</button>
                </div><br/>
                <div className="hands">
                    <Hand selectPokemon={this.selectPokemon} player={1} graveyard={graveyard}/>
                    <Hand selectPokemon={this.selectPokemon} player={2} graveyard={graveyard}/>
                </div>
            </div>
        )
    }
}

const BattlePoke = ({pokemon, animation}) => (
    <div className={`card battle-poke ${animation} ${pokemon.type}`}>
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