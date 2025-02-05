import { Request, Response } from 'express';
import prisma from '../client';


//liste tous les pokemons
export const getPokemon =  async (req: Request, res: Response) => {
    const pokemons = await prisma.pokemonCard.findMany({ include: { type: true } });
    res.status(200).send(pokemons);
};

// affiche un pokemon selon son id
export const getPokemonId =  async (req: Request, res: Response) => {
  const {pokemonCardId} = req.params;

  if (isNaN(Number(pokemonCardId))) {
    res.status(400).send({ error: 'ID invalide' });
  }

  const pokemon = await prisma.pokemonCard.findUnique({
    where: { id: Number(pokemonCardId)},
    include: { type: true },
  });

  if (!pokemon) {
    res.status(404).send({ error: 'Pokemon non trouvé' });
  }

  res.status(200).send(pokemon);
};


//enregistre un pokémon selon les propriétés dans le body
export const postPokemon =  async (req: Request, res: Response) => {

    



};

// app.patch('/pokemon-cards/:pokemonCardId', (_req: Request, _res: Response) => {
//   _res.status(200).send('Modification du pokemon');
// });

// app.delete('/pokemon-cards/:pokemonCardId', (_req: Request, _res: Response) => {
//   _res.status(200).send('Suppression du pokemon');
// });


// export function stopServer() {
//   server.close();
// }