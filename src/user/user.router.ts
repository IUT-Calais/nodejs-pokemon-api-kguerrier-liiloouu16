import { Router } from "express";
import { getUser, postUser, postUserLogin } from './user.controller';


export const userRouter = Router();

//Routes
userRouter.get('/', getUser);
userRouter.post('/', postUser);
userRouter.post('/login', postUserLogin);