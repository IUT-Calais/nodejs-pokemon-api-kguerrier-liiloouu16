import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';


describe('PokemonCard API', () => {

  //fetch all PokemonCards
  describe('GET /pokemon-cards', () => {

    it('should fetch all PokemonCards', async () => {
      const allPokemonCards = [{id: 1, name: 'Flamiaou', pokedexId: 725, type: { id: 1, name: 'Fire' }, typeId: 2, lifePoints: 70, size: 0.7, weight: 4, imageUrl: 'https://www.pokepedia.fr/images/thumb/6/6c/Flamiaou-USUL.png/800px-Flamiaou-USUL.png' }];
      prismaMock.pokemonCard.findMany.mockResolvedValue(allPokemonCards);
      const response = await request(app).get('/pokemons-cards');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(allPokemonCards);
    });
  });


  //fetch PokemonCards par id
  describe('GET /pokemon-cards/:pokemonCardId', () => {

    //test correct
    it('should fetch a PokemonCard by ID', async () => {
      const pokemonCardById = {id: 1, name: 'Flamiaou', pokedexId: 725, typeId: 2, type: { id: 1, name: 'Fire' }, lifePoints: 70, size: 0.7, weight: 4, imageUrl: 'https://www.pokepedia.fr/images/thumb/6/6c/Flamiaou-USUL.png/800px-Flamiaou-USUL.png',};
      prismaMock.pokemonCard.findUnique.mockResolvedValue(pokemonCardById);
      const response = await request(app).get('/pokemons-cards/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(pokemonCardById);
    });

    //test pokemon non trouvé
    it('should return 404 if PokemonCard is not found', async () => {
      const pokemonCardById = null;
      prismaMock.pokemonCard.findUnique.mockResolvedValue(pokemonCardById);
      const response = await request(app).get('/pokemons-cards/999');

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Pokemon non trouvé' });
    });

    //test ID invalide
    it('should return 400 if ID is invalid', async () => {
      const response = await request(app).get('/pokemons-cards/char');
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'ID invalide' });
    });
  });


  //create a PokemonCard
  describe('POST /pokemon-cards', () => {

    //test création ok
    it('should create a new PokemonCard', async () => {
      const createdPokemonCard = {id: 1, name: 'Flamiaou', pokedexId: 725, typeId: 2, type: { id: 1, name: 'Fire' }, lifePoints: 70, size: 0.7, weight: 4, imageUrl: 'https://www.pokepedia.fr/images/thumb/6/6c/Flamiaou-USUL.png/800px-Flamiaou-USUL.png',};
      prismaMock.pokemonCard.create.mockResolvedValue(createdPokemonCard);
      const response = await request(app)
        .post('/pokemons-cards')
        .set('Authorization', 'Bearer mockedToken')
        .send(createdPokemonCard);

      expect(response.status).toBe(201);
      expect(response.body).toEqual(createdPokemonCard);
    });

    //test propriété(s) manquante(s)
    it('should return 400 if required properties are missing', async () => {
      const incompleteData = {pokedexId: 725, typeId: 2, type: { id: 1, name: 'Fire' }};
      const response = await request(app)
        .post('/pokemons-cards')
        .set('Authorization', 'Bearer mockedToken')
        .send(incompleteData);

      expect(response.status).toBe(400);
      expect(response.body).toEqual('Propriétés manquantes : Veuillez renseigner tous les champs');
    });

    //test pokemon déjà existant
    it ('should return 400 if pokemon already exists', async () =>{
      const existingPokemon = {id: 1, name: 'Flamiaou', pokedexId: 725, typeId: 2, type: { id: 1, name: 'Fire' }, lifePoints: 70, size: 0.7, weight: 4, imageUrl: 'https://www.pokepedia.fr/images/thumb/6/6c/Flamiaou-USUL.png/800px-Flamiaou-USUL.png',};
      prismaMock.pokemonCard.findFirst.mockResolvedValue(existingPokemon);
      const response = await request(app)
        .post('/pokemons-cards')
        .set('Authorization', 'Bearer mockedToken')
        .send(existingPokemon);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Pokemon déjà existant' });
    });
  });


  //update a PokemonCard
  describe('PATCH /pokemon-cards/:pokemonCardId', () => {
    
    const updatedPokemonCard = {id: 1, name: 'Flamiaou', pokedexId: 725, typeId: 2, type: { id: 1, name: 'Fire' }, lifePoints: 70, size: 0.7, weight: 4, imageUrl: 'https://www.pokepedia.fr/images/thumb/6/6c/Flamiaou-USUL.png/800px-Flamiaou-USUL.png',};

    //test update ok
    it('should update an existing PokemonCard', async () => {
      prismaMock.pokemonCard.update.mockResolvedValue(updatedPokemonCard);
      const response = await request(app)
        .patch('/pokemons-cards/1')
        .set('Authorization', 'Bearer mockedToken')
        .send(updatedPokemonCard);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedPokemonCard);
    });

    //test ID invalide
    it('should return 400 if ID is invalid', async () => {
      const response = await request(app)
        .patch('/pokemons-cards/char')
        .set('Authorization', 'Bearer mockedToken')
        .send(updatedPokemonCard);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'ID invalide' });
    });

    //test pokemon non trouvé
    it('should return 400 if PokemonCard is not found', async () => {
      prismaMock.pokemonCard.update.mockRejectedValue(new Error('Pokemon non trouvé'));
      const response = await request(app)
        .patch('/pokemons-cards/999')
        .set('Authorization', 'Bearer mockedToken')
        .send(updatedPokemonCard);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Pokemon non trouvé' });
    });
  });

  //delete a PokemonCard
  describe('DELETE /pokemon-cards/:pokemonCardId', () => {

    //test delete ok
    it('should delete a PokemonCard', async () => {
      const mockPokemonCard = {id: 1, name: 'Flamiaou', pokedexId: 725, typeId: 2, type: { id: 1, name: 'Fire' }, lifePoints: 70, size: 0.7, weight: 4, imageUrl: 'https://www.pokepedia.fr/images/thumb/6/6c/Flamiaou-USUL.png/800px-Flamiaou-USUL.png',};
      prismaMock.pokemonCard.delete.mockResolvedValue(mockPokemonCard);
      const response = await request(app)
        .delete('/pokemons-cards/1')
        .set('Authorization', 'Bearer mockedToken');
      
      expect(response.status).toBe(200);
    });

    //test ID invalide
    it('hould return 400 if ID is invalid', async () => {
      const response = await request(app)
        .delete('/pokemons-cards/char')
        .set('Authorization', 'Bearer mockedToken');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'ID invalide' });
    });
  });
});
