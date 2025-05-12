import { Router } from "express";
import { authenticateToken } from "../common/jwt.middleware";
import { getPokemon, getPokemonId, postPokemon, patchPokemonCardId, deletePokemonId} from "./pokemon.controller";

export const pokemonRouter = Router();

//Routes
pokemonRouter.get('/', getPokemon);
pokemonRouter.get('/:pokemonCardId', getPokemonId);
pokemonRouter.post('/', authenticateToken, postPokemon);
pokemonRouter.patch('/:pokemonCardId', authenticateToken, patchPokemonCardId);
pokemonRouter.delete('/:pokemonCardId', authenticateToken, deletePokemonId);
