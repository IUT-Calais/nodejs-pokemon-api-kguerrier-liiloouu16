import { Request, Response } from 'express';
import prisma from '../client';


//liste tous les pokemons
export const getPokemon =  async (req: Request, res: Response) => {
    const pokemons = await prisma.pokemonCard.findMany({ include: { type: true } });
    res.status(200).send(pokemons);
    return;
};

//affiche un pokemon selon son id
export const getPokemonId =  async (req: Request, res: Response) => {
  const {pokemonCardId} = req.params;

  if (isNaN(Number(pokemonCardId))) {
    res.status(400).send({ error: 'ID invalide' });
    return;
  }

  const pokemon = await prisma.pokemonCard.findUnique({
    where: { pokedexId: Number(pokemonCardId)},
    include: { type: true },
  });

  if(!pokemon){
    res.status(404).send({ error: 'Pokemon non trouvé' });
    return;
  }

  res.status(200).send(pokemon);
  return;
};

//enregistre un pokémon selon les propriétés dans le body
export const postPokemon = async (req: Request, res: Response) => {

  const {name, pokedexId, typeId, lifePoints, size, weight, imageUrl} = req.body;

  if (!name || !pokedexId || !typeId || !lifePoints || !size || !weight || !imageUrl) {
    res.status(400).send({ error: 'Propriétés manquantes : Veuillez renseigner tous les champs' });
    return;
  }

  const existPokemon = await prisma.pokemonCard.findFirst({
    where: {
      OR: [{ name: name }, { pokedexId: pokedexId }],
    },
  });

  if(existPokemon){
    res.status(400).send({ error: 'Pokemon déjà existant' });
    return;
  }

  await prisma.pokemonCard.create({
    data:{
      name: name,
      pokedexId: pokedexId,
      type: {connect: {id: typeId}},
      lifePoints: lifePoints,
      size: size,
      weight: weight,
      imageUrl: imageUrl
    },
    include: { type: true }
    });

  res.status(201).send(name + ' enregistré');
  return;

};

//modifie le pokemon selon son id 
export const patchPokemonCardId = async (req: Request, res: Response) => {
  
  const {pokemonCardId} = req.params;
  const {name, pokedexId, typeId, lifePoints, size, weight, imageUrl} = req.body;

  if (isNaN(Number(pokemonCardId))) {
      res.status(400).send({ error: 'ID invalide' });
  }

  try{
    await prisma.pokemonCard.update({
    where: { pokedexId: Number(pokemonCardId)},
    data:{
        name: name,
        pokedexId: pokedexId ,
        type: {connect: {id: typeId}} ,
        lifePoints: lifePoints,
        size: size ,
        weight: weight ,
        imageUrl: imageUrl
    }});
  }catch (error){
    res.status(400).send({ error: 'Pokemon non trouvé' });
    return;
  }

  res.status(200).send(name + ' modifié');
  return;

}

//supprime le pokemon selon son id
export const deletePokemonId = async (req: Request, res: Response) => {
  const {pokemonCardId} = req.params;
  
  if (isNaN(Number(pokemonCardId))) {
    res.status(400).send({ error: 'ID invalide' });
  }

  await prisma.pokemonCard.delete({
    where: { pokedexId: Number(pokemonCardId)}
  });

  res.status(200).send('Pokemon supprimé');
  return;
}