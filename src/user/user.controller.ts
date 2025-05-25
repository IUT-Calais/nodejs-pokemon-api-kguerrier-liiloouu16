import { Request, Response } from 'express';
import prisma from '../client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';


//liste tous les users
export const getUser =  async (req: Request, res: Response) => {
    const users = await prisma.user.findMany();
    res.status(200).send(users);
    return;
};

// affiche un user selon son id
export const getUserId =  async (req: Request, res: Response) => {
  const {userId} = req.params;

  if (isNaN(Number(userId))) {
    res.status(400).send({ error: 'ID invalide' });
    return; 
  }

  const existuserId = await prisma.user.findUnique({
    where: { id: Number(userId)}
  });

  if(!existuserId){
    res.status(404).send({ error: 'Utilisateur non trouvé' });
    return;
  }

  res.status(200).send(existuserId);
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

    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
  
    await prisma.user.create({
      data:{
        email: email,
        password: hashedPassword,
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
      where: { email: email },
    });
    
    if(!user){
      res.status(404).send({ error: 'Utilisateur non trouvé' });
      return;
    }

    const decryptedPassword = await bcrypt.compare(password, user.password);

    //comparer le mot de passe
    if(!decryptedPassword){
      res.status(400).send({ error: 'Mot de passe incorrect' });
      return;
    }

    //générer un token
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET as string,
      {
        //expiresIn: process.env.JWT_EXPIRES_IN,
        expiresIn: '1h',
      }
    );

    res.status(201).json({
      message:'Connexion réussie, bienvenue ' + email,
      token: token,
    });
  
};


//modifie le user selon son id 
export const patchUserId = async (req: Request, res: Response) => {
  
  const {userId} = req.params;
  const {email, password} = req.body;

  if (isNaN(Number(userId))) {
    res.status(400).send({ error: 'ID invalide' });
    return;
  }

  const existUser = await prisma.user.findUnique({
    where: { id: Number(userId)}
  });
  
  if(!existUser){
    res.status(404).send({ error: 'Utilisateur non trouvé' });
    return;
  }
  
  //user connecté correspond à l'id de la req ?
  if ((req as any).user.id !== Number(userId)) {
    res.status(403).send({ error: "Accès interdit : ce n’est pas votre compte" });
    return;
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  const updatedUser = await prisma.user.update({
  where: { id: Number(userId)},
  data:{
      email: email,
      password: hashedPassword
  }});
  res.status(200).send(updatedUser);
  return;
    
}





//supprimer un user selon son id
export const deleteUserId = async (req: Request, res: Response) => {
  const {userId} = req.params;
  
  if (isNaN(Number(userId))) {
    res.status(400).send({ error: 'ID invalide' });
    return;
  }

  const existUser = await prisma.user.findUnique({
    where: { id: Number(userId)}
  });
  
  if(!existUser){
    res.status(404).send({ error: 'Utilisateur non trouvé' });
    return;
  }
  
  //user connecté correspond à l'id de la req ?
  if ((req as any).user.id !== Number(userId)) {
    res.status(403).send({ error: "Accès interdit : ce n’est pas votre compte" });
    return;
  }

  await prisma.user.delete({ where: { id: Number(userId) } });
  res.status(200).send('User supprimé');
  return;
}
