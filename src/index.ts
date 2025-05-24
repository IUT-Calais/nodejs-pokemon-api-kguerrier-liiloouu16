import express from 'express';
import { pokemonRouter } from './pokemon/pokemon.router';
import { userRouter } from './user/user.router';

export const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use('/pokemons-cards', pokemonRouter);
app.use('/users', userRouter);

export function stopServer() {
    server.close();
}

export const server = app.listen(port);