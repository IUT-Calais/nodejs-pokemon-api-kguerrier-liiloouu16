import request from 'supertest';
import { app } from '../src';
import { prismaMock } from './jest.setup';
import prisma from '../src/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('User API', () => {

  //fetch all users
  describe('GET /users', () =>{
    it ('should fetch all users', async () => {
      const users = {id: 123, email: 'test@gmail.com', password:'hashedPassword'};
      prismaMock.user.findMany.mockResolvedValue([users]);
      const response = await request(app).get('/users');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([users]);
    });
  });

  //create a user
  describe('POST /users', () => {

    //test creation ok
    it('should create a new user', async () => {
      const createdUser = {id: 123, email: 'test@gmail.com', password:'hashedPassword'};
      prismaMock.user.create.mockResolvedValue(createdUser);
      const response = await request(app)
        .post('/users')
        .send(createdUser);

      expect(response.status).toBe(201);
      expect(response.text).toEqual('Utilisateur test@gmail.com enregistré');
    });

    //test données manquantes
    it ('should return 400 if required properties are missing', async () => {
      const userDataMissing = {email : 'test@gmail.com'};
      const response = await request(app)
        .post('/users')
        .send(userDataMissing);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Propriétés manquantes : Veuillez renseigner tous les champs' });
    });

    //test utilisateur déjà existant
    it('should return 400 if user already exists', async () => {
      const existingUser = {id: 123, email: 'test@gmail.com', password:'hashedPassword'};
      prismaMock.user.findFirst.mockResolvedValue(existingUser);
      const response = await request(app)
        .post('/users')
        .send(existingUser);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Utilisateur déjà existant' });
    });

  });

  //login a user
  describe('POST /login', () => {

    //test données manquantes
    it('should return 400 if required properties are missing', async () => {
      const userDataMissing = {email : 'test@gmail.com'};
      const response = await request(app)
        .post('/users/login')
        .send(userDataMissing);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Propriétés manquantes : Veuillez renseigner tous les champs'});
    });

    //test utilisateur non trouvé
    it('should return 404 if user not found', async () => {
      prismaMock.user.findFirst.mockResolvedValue(null);
      const response = await request (app)
        .post('/users/login')
        .send({ email: 'notfound@example.com', password: 'password123' });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Utilisateur non trouvé'});
    });

    //test comparaison de mot de passe échouée
    it('should return 400 if password is incorrect', async () => {
      const user = { id: 123, email: 'test@gmail.com', password: 'hashedPassword' };
      prismaMock.user.findFirst.mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(false);//mdp faux

      const response = await request(app)
        .post('/users/login')
        .send({ email: user.email, password: 'wrongPassword' });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'Mot de passe incorrect' });

      jest.restoreAllMocks();
    });


    //test connexion réussie
    it('should login a user and return a token', async () => {
      const user = {id: 123, email: 'test@gmail.com', password: 'hashedPassword'};
      const token = 'mockedToken';
      prismaMock.user.findFirst.mockResolvedValue(user);
      (jest.spyOn(bcrypt, 'compare') as jest.Mock).mockResolvedValue(true);
      (jest.spyOn(jwt, 'sign') as jest.Mock).mockReturnValue(token);

      const response = await request(app)
        .post('/users/login')
        .send({ email: user.email, password: 'password123' });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        message: 'Connexion réussie, bienvenue ' + user.email,
        token: token,
      });

      jest.restoreAllMocks();
    });

  });

});