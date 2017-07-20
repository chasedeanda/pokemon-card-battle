import axios from 'axios';

export const typeModifier = (pokeType, opponentType) => {
    const BASE = 'https://pokeapi.co/api/v2';
    return axios.get(`${BASE}/type/${pokeType}`)
}