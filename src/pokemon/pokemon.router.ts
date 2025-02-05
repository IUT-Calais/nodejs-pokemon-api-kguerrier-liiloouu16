import { Router } from "express";
import { getPokemon, getPokemonId, postPokemon } from "./pokemon.controller";

export const pokemonRouter = Router();

//Routes
pokemonRouter.get('/', getPokemon);
pokemonRouter.get('/:pokemonCardId', getPokemonId);
pokemonRouter.post('/', postPokemon);