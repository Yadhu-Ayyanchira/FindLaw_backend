/* eslint-disable linebreak-style */
import express from 'express';
import UserController from '../Controllers/UserController.js';
import upload from '../Middleware/Multer.js';
// eslint-disable-next-line new-cap
const UserRouter = express.Router();

UserRouter.post('/login', UserController.login);
UserRouter.post('/signup', UserController.signup);
UserRouter.post('/googleSignup', UserController.SignupWithGoogle);
UserRouter.get('/:id/verify/:token', UserController.verification);
UserRouter.get('/userData/:id', UserController.userData);
UserRouter.post('/profileEdit/:id', UserController.profileEdit);
// eslint-disable-next-line max-len
UserRouter.post('/imgupdate', upload.single('image'), UserController.updateImage);
UserRouter.get('/lawyerData', UserController.lawyerData);


export default UserRouter;
