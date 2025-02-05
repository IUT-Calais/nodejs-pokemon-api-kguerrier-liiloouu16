import express from 'express';
// import { userRoute } from './user/user.route';
import { Request, Response } from 'express';
import prisma from './client';


export const app = express();
const port = process.env.PORT || 3000;

//use c'est un middleware
app.use(express.json());

// app.use('/users', userRoute);

export const server = app.listen(port);

app.get('/pokemons-cards', async (_req: Request, _res: Response) => {
    // Récupère tous les utilisateurs et leurs posts
    const pokemons = await prisma.pokemonCard.findMany({ include: { type: true } });
    _res.status(200).send(pokemons);
});

app.get('/pokemons-cards/:pokemonCardId', (_req: Request, _res: Response) => {
  _res.status(200).send('Pokemon selon l\'id');
});

app.post('/pokemon-cards', (_req: Request, _res: Response) => {
  _res.status(200).send('Enregistrer le pokemon');
});

app.patch('/pokemon-cards/:pokemonCardId', (_req: Request, _res: Response) => {
  _res.status(200).send('Modification du pokemon');
});

app.delete('/pokemon-cards/:pokemonCardId', (_req: Request, _res: Response) => {
  _res.status(200).send('Suppression du pokemon');
});


export function stopServer() {
  server.close();
}