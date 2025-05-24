import express from 'express';
import { pokemonRouter } from './pokemon/pokemon.router';
import { userRouter } from './user/user.router';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';

export const app = express();
const port = process.env.PORT || 3000;

//middleware
app.use(express.json());
app.use('/pokemons-cards', pokemonRouter);
app.use('/users', userRouter);

//chemin doc swagger
const swaggerDocument = YAML.load(path.join(__dirname, '../doc/swagger.yaml'));
app.use('/api-doc', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

export function stopServer() {
    server.close();
}

export const server = app.listen(port);