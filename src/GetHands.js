import React, { Component } from 'react';
import autoBind from 'react-autobind';
import _ from 'lodash';
import Hand from './Hand';
import axios from 'axios';
import { Link } from 'react-router-dom';
import firebase from './FirebaseConnect';

export default class GetHands extends Component {
    constructor(props){
        super(props);
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
            playerTurn: 0,
            mute: false,
            gameOver: false,
            battleMusic: '',
            player1Hand: [],
            player2Hand: [],
            player1Loaded: props.online ? false : true,
            player2Loaded: props.online ? false : true
        }
        this.onlinePlayer = +props.match.params.player;
        this.computerPlayer = props.players === 1;
        this.battleMusicTracks = ['battle-music.mp3', 'battle-music-2.mp3','battle-music-3.mp3', 'battle-music-4.mp3', 'battle-music-5.mp3'];
        if(props.online){

        this.battleRef = firebase.database().ref(`battles/${this.props.match.params.code}`);
        }
    }
    componentDidMount(){
        this.audio.volume = .2;
        this.attack.volume = .5;
        if(this.props.online && this.battleRef){
            this.battleRef.on('value', snapshot => this.handleSocketUpdate(snapshot.val()));
        }
        this.setState({
            battleMusic: _.shuffle(this.battleMusicTracks)[0]
        })
    }
    selectPokemon(pokemon, hand){
        if(!this.state.gameOver){
            const { poke1, poke2 } = this.state;
            let state = {};
            if(hand === 1 && !poke1.id){
                state = {
                    poke1: pokemon,
                    playerTurn: 2
                }
            }else if(hand === 2 && !poke2.id){
                state = {
                    poke2: pokemon,
                    playerTurn: 1
                }
            }
            this.setState(state);
        }
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
        state.first.turns = state.first.turns+1 || 1;
        state.second.turns = state.second.turns+1 || 1;

        state.first.def = Math.round( state.first.def * 10 ) / 10 || 0;
        state.second.def = Math.round( state.second.def * 10 ) / 10 || 0;

        state.first.evolved = false;
        state.second.evolved = false;

        if(state.first.def === 0){
            const wins = state.second.wins || 0;
            state.second.wins = wins+1;
        }
        if(state.second.def === 0){
            const wins = state.first.wins || 0;
            state.first.wins = wins+1;
        }

        if(state.second.wins > 0 && state.second.def > 0){
            this.evolvePokemon(second, 'poke2', this.state.poke2.def - state.second.def);
        }
        if(state.first.wins > 0 && state.first.def > 0){
            this.evolvePokemon(first, 'poke1', this.state.poke1.def - state.first.def);
        }

        let turn = this.state.playerTurn;
        if(state.first.id && !state.second.id){
            turn = 2;
        }
        if(state.second.id && !state.first.id){
            turn = 1;
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
            _graveyard.push(poke2);
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
            _graveyard.push(poke1);
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
            _graveyard.push(poke1);
        }
        if(second.def <= 0){
            second = {
                img: {}
            };
            _graveyard.push(poke2);
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
                playerTurn: 1
            }
        }else{
            state = {
                playerTurn: 2
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
    evolvePokemon(pokemon, key, defDiff){
        const BASE_V1 = 'https://pokeapi.co/api/v1';
        const BASE_V2 = 'https://pokeapi.co/api/v2';
        axios.get(`${BASE_V1}/pokemon/${pokemon.id}`)
            .then( response => {
                const nextEvolution = _.get(_.shuffle(response.data.evolutions)[0], 'to') || '';
                if(nextEvolution.length){
                    this.setState({
                        [key]: {
                            ...pokemon,
                            evolving: true
                        }
                    })
                    axios.get(`${BASE_V2}/pokemon/${nextEvolution.toLowerCase()}`)
                        .then( response => {
                            if(pokemon.id === this.state[key].id){
                                this.setState({
                                    [key]: {
                                        ...pokemon,
                                        id: response.data.id,
                                        name: response.data.name,
                                        img: response.data.sprites.front_default,
                                        shinyImg: response.data.sprites.front_shiny,
                                        atk: this.getAverage(response.data.stats[4].base_stat/10, response.data.stats[2].base_stat/10),
                                        def: this.roundNum(this.getAverage(response.data.stats[1].base_stat/10, response.data.stats[3].base_stat/10) - defDiff),
                                        spd: response.data.stats[0].base_stat/10,
                                        type: response.data.types[0].type.name,
                                        wins: 0,
                                        evolved: true,
                                        evolving: false,
                                        evolvedCount: pokemon.evolvedCount + 1
                                    }
                                });
                            }
                        })
                        .catch(() => {
                            this.setState({
                                [key]: {
                                    ...pokemon,
                                    evolving: false
                                }
                            })
                        });
                }
            });
    }
    getAverage(num1, num2){
        const avg = (num1+num2)/2;
        return this.roundNum(avg);
    }
    roundNum(num){
        return Math.round( num * 10 ) / 10
    }
    handlePlayerReady(player){
        let state = {};
        if(player === 1){
            state = {
                player1Loaded: true
            }
        }else{
            state = {
                player2Loaded: true
            }
        }
        this.setState(state);
    }
    updateHands(player, hand){
        const key = player === 1 ? 'player1Hand' : 'player2Hand';
        this.setState({
            [key]: hand
        });
    }
    getPokemon(player){
        return this.state[`player${player}Hand`].filter( pokemon => !_.find(this.state.graveyard, {safeId: pokemon.safeId, player: player}))
    }
    handleSocketUpdate(data) {
        if(!_.isEqual(this.state, data.battleData) && !this.state.gameOver){
            // console.log('socke: ', data.battleData)
            this.setState(data.battleData);
        }
    }
    componentDidUpdate(prevProps, prevState){
        if(this.props.online){
            if(!_.isEqual(this.state, prevState)){
                // console.log('set data: ', this.state)
                //Update online battleData
                this.battleRef.set({ battleData: this.state });
            }
        }
    }
    render(){
        const { poke1, poke2, graveyard, playerTurn, mute, gameOver, battleMusic, winner, player1Hand, player2Hand, player1Loaded, player2Loaded } = this.state;
        const { players, online } = this.props;
        const evolving = (poke1.evolving || poke2.evolving);
        return (
            <div>
                <div className="home-link">
                    <Link to="/">{`< Back to Home`}</Link>
                </div>
                <div className="main">
                    
                    <Hand 
                        selectPokemon={this.selectPokemon} 
                        player={1} 
                        endBattle={this.endBattle}
                        hasSelected={poke1.id}
                        updateHands={this.updateHands}
                        hand={this.getPokemon(1)}
                        playerReady={player1Loaded}
                        handlePlayerReady={this.handlePlayerReady}
                        onlinePlayer={this.onlinePlayer}
                        {...this.props}
                        {...this.state}
                    />
                    <div className="battle-cont">
                        <h1 className="tracking-in-expand">Prepare to Battle!</h1>
                        {!gameOver && playerTurn > 0 && (!poke1.id || !poke2.id) && !evolving &&
                            <span className="player-turn pulsate-fwd">
                                Your Turn 
                                <span className={playerTurn === 1 ? 'one' : 'two'}>{` ${playerTurn === 1 ? 'Player 1' : 'Player 2'}`}</span>
                            </span>
                        }
                        {gameOver && <span className="player-turn pulsate-fwd winner">
                            <span className={`${winner === 1 ? 'one' : 'two'}`}>
                                {`${winner === 1 ? 'Player 1 ' : 'Player 2 '} `}
                            </span>
                            Wins!
                            <br/><br/>
                            <Link to={`/new-game/${players === 1 ? 'single-player' : online ? `multiplayer/online/${this.props.match.params.code}/${this.onlinePlayer}` : 'multiplayer'}`}>PLay Again?</Link>
                        </span>
                        }
                        {evolving && <span className="player-turn pulsate-fwd battle">A POKEMON IS EVOLVING!</span>}
                        {poke1.id && poke2.id && !evolving && <span className="player-turn pulsate-fwd battle">BATTLE!</span>}
                        {!poke1.id && <CardOutline />}
                        {poke1.id && <BattlePoke pokemon={poke1} player={1} animation="poke1" />}
                        {!poke2.id && <CardOutline />}
                        {poke2.id && <BattlePoke pokemon={poke2} player={2} animation="poke2" />}
                        <br/>
                        <button className={`battle-button ${poke1.id && poke2.id || evolving ? '' : 'disabled'}`} disabled={!poke1.id || !poke2.id || evolving} onClick={this.handleFight}>Battle</button>
                        {playerTurn === 0 && <button className="new-hand-btn" onClick={this.flipACoin}>Flip a coin</button>}
                    </div>
                    <Hand 
                        selectPokemon={this.selectPokemon} 
                        player={2} 
                        endBattle={this.endBattle} 
                        opponent={poke1}
                        hasSelected={poke2.id}
                        computerPlayer={this.computerPlayer}
                        updateHands={this.updateHands}
                        hand={this.getPokemon(2)}
                        playerReady={player2Loaded}
                        handlePlayerReady={this.handlePlayerReady}
                        onlinePlayer={this.onlinePlayer}
                        {...this.props}
                        {...this.state}
                    />
                </div>
                
                {!mute && 
                <div>
                    <audio
                        src={`/${battleMusic}`}
                        ref={ref => this.audio = ref}
                        autoPlay
                        loop>
                        Your browser does not support the <code>audio</code> element.
                    </audio>
                    <audio src="/attack2.mp3" ref={ref => this.attack = ref}></audio>
                </div>
                }
                <a className="mute-toggle" onClick={this.toggleMute}>{`Mute ${mute ? 'On' : 'Off'}`}</a>
            </div>
        )
    }
}

const BattlePoke = ({pokemon, animation}) => (
    <div key={`${pokemon.id}-${pokemon.turns}`} className={`card battle-poke ${animation} ${pokemon.type} ${pokemon.turns > 0 && 'not-first-turn'} ${!!pokemon.firstAttack && 'first-attack'} ${pokemon.evolving && 'evolving'} ${pokemon.evolved && 'evolved'}`}>
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



/*

TODO:

Add Player 1 Ready and Player 2 Ready buttons
    player has to pick which one they are, then go fetch their hand
    need to save each hand as player1Hand, player2Hand to sync battleData
Figure out how to hide the other players cards when playing online

Update mobile layou
    ready buttons
    multiplayer menu

when you enter the page you should always be player 1 and you should only see your cards
    choose to get new hand or ready for battle
    the other player also has to be ready
    flip a coin and then reveal the hands
*/