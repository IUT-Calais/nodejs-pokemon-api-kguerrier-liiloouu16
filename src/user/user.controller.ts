import { Request, Response } from 'express';
import prisma from '../client';


//liste tous les users
export const getUser =  async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.status(200).send(users);
    return;
};

//enregistre un user selon les propriétés dans le body
export const postUser = async (req: Request, res: Response) => {

    const {email, password} = req.body;
  
    if (!email || !password) {
      res.status(400).send({ error: 'Propriétés manquantes : Veuillez renseigner tous les champs' });
      return;
    }
  
    const existUser = await prisma.user.findFirst({
      where: {
        OR: [{ email: email }, { password: password }],
      },
    });
  
    if(existUser){
      res.status(400).send({ error: 'Utilisateur déjà existant' });
      return;
    }
  
    await prisma.user.create({
      data:{
        email: email,
        password: password
      }
      });
  
    res.status(201).send('Utilisateur ' + email + ' enregistré');
    return;
  
};

//permet de se connecter à l'application
export const postUserLogin = async (req: Request, res: Response) => {

    const {email, password} = req.body;
  
    if (!email || !password) {
      res.status(400).send({ error: 'Propriétés manquantes : Veuillez renseigner tous les champs' });
      return;
    }
  
    const user = await prisma.user.findFirst({
      where: {
        AND: [{ email: email }, { password: password }],
      },
    });
  
    if(!user){
      res.status(404).send({ error: 'Utilisateur non trouvé' });
      return;
    }
  
    res.status(200).send('Bienvenue ' + email);
    return;
  
};

