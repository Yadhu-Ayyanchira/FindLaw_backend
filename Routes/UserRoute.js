import express from "express";
import UserController from "../Controllers/UserController.js"

const UserRouter = express.Router();

UserRouter.get('/login',UserController.login)

export default UserRouter;