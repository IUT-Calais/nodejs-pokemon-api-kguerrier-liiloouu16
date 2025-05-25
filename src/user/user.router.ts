import { Router } from "express";
import { authenticateToken } from "../common/jwt.middleware";
import { getUser, postUser, postUserLogin, getUserId, deleteUserId, patchUserId } from './user.controller';


export const userRouter = Router();

//Routes
userRouter.get('/', getUser);//fetch all
userRouter.get('/:userId', getUserId);//fetch one
userRouter.post('/', postUser);//create
userRouter.post('/login', postUserLogin);//login
userRouter.patch('/:userId',authenticateToken, patchUserId);//update
userRouter.delete('/:userId',authenticateToken, deleteUserId);//delete