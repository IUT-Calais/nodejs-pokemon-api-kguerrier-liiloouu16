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


  //fetch a user by id
    describe('GET /users/:userId', () => {
  
      //test correct
      it('should fetch a user by ID', async () => {
        const userId = {id: 123, email: 'test@gmail.com', password:'hashedPassword'};
        prismaMock.user.findUnique.mockResolvedValue(userId);
        const response = await request(app).get('/users/1');
  
        expect(response.status).toBe(200);
        expect(response.body).toEqual(userId);
      });
  
      //test user non trouvé
      it('should return 404 if the user is not found', async () => {
        const userId = null;
        prismaMock.user.findUnique.mockResolvedValue(userId);
        const response = await request(app).get('/users/999');
  
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ error: 'Utilisateur non trouvé' });
      });
  
      //test ID invalide
      it('should return 400 if ID is invalid', async () => {
        const response = await request(app).get('/users/char');
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ error: 'ID invalide' });
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

  //update a user
  describe('PATCH /users/:userId', () => {
    
    const updatedUser = {id: 1, email: 'test@gmail.com', password: 'hashedpassword'};
    
    //test update ok
    it('should update an existing user', async () => {
      const userId = 1;
      const updatedUser = { id: userId, email: 'test@gmail.com', password: 'hashedpassword' };
      prismaMock.user.findUnique.mockResolvedValue({ id: userId, email: 'old@gmail.com', password: 'oldhashed' });
      prismaMock.user.update.mockResolvedValue(updatedUser);
      const jwtSpy = jest.spyOn(jwt, 'verify').mockReturnValue({id: userId, email: 'test@gmail.com'} as any);
      const response = await request(app)
        .patch(`/users/${userId}`)
        .set('Authorization', 'Bearer mockedToken')
        .send(updatedUser);

      expect(response.status).toBe(200);
      expect(response.body).toEqual(updatedUser);

      jwtSpy.mockRestore();
    });

    //test ID invalide
    it('should return 400 if ID is invalid', async () => {
      const response = await request(app)
        .patch('/users/char')
        .set('Authorization', 'Bearer mockedToken')
        .send(updatedUser);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'ID invalide' });
    });

    //test utilisateur non trouvé
    it('should return 400 if the user is not found', async () => {
      prismaMock.user.update.mockRejectedValue(new Error('Utilisateur non trouvé'));
      const response = await request(app)
        .patch('/users/999')
        .set('Authorization', 'Bearer mockedToken')
        .send(updatedUser);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ error: 'Utilisateur non trouvé' });
    });

    //test si user n'est pas connecté au bon compte
    it('should return 403 if user tries to update another user', async () => {
      jest.spyOn(jwt, 'verify').mockReturnValue({id: 1, email: 'test@gmail.com',} as any);
      prismaMock.user.findUnique.mockResolvedValue({
        id: 2,
        email: 'other@gmail.com',
        password: 'hashed',
      });
      const response = await request(app)
        .patch('/users/2')
        .set('Authorization', `Bearer faketoken`)
        .send({ email: 'new@gmail.com' });

      expect(response.status).toBe(403);
      expect(response.body.error).toBe("Accès interdit : ce n’est pas votre compte");
    });

  });

  //delete a user
  describe('DELETE /users/:userId', () => {

    //test delete ok
    it('should delete a user', async () => {
      const mockUser = { id: 1, email: 'test@gmail.com', password: 'hashedpassword' };
      prismaMock.user.delete.mockResolvedValue(mockUser);
      const response = await request(app)
        .delete('/users/1')
        .set('Authorization', 'Bearer mockedToken');
      
      expect(response.status).toBe(200);
    });

    //test ID invalide
    it('hould return 400 if ID is invalid', async () => {
      const response = await request(app)
        .delete('/users/char')
        .set('Authorization', 'Bearer mockedToken');

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ error: 'ID invalide' });
    });
    
  });

});