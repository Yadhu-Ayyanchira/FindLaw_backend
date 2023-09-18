import express from "express";
import UserController from "../Controllers/UserController.js"

const UserRouter = express.Router();

UserRouter.get('/login',UserController.login)
UserRouter.post('/signup',UserController.signup)
UserRouter.post("/googleSignup", UserController.SignupWithGoogle);
UserRouter.get("/:id/verify/:token", UserController.verification);


export default UserRouter;