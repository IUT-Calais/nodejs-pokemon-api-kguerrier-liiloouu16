import { Router } from "express";
import { getPokemon, getPokemonId, postPokemon, patchPokemonCardId} from "./pokemon.controller";

export const pokemonRouter = Router();

//Routes
pokemonRouter.get('/', getPokemon);
pokemonRouter.get('/:pokemonCardId', getPokemonId);
pokemonRouter.post('/', postPokemon);
pokemonRouter.patch('/', patchPokemonCardId);