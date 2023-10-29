/* eslint-disable linebreak-style */
import express from 'express';
import UserController from '../Controllers/UserController.js';
import upload from '../Middleware/Multer.js';
import SlotController from '../Controllers/SlotController.js';
import { userAuth } from '../Middleware/Auth.js';

// eslint-disable-next-line new-cap
const UserRouter = express.Router();

UserRouter.post('/login', UserController.login);
UserRouter.post('/signup', UserController.signup);
UserRouter.post('/googleSignup', UserController.SignupWithGoogle);
UserRouter.get('/:id/verify/:token', UserController.verification);
UserRouter.get('/userData/:id',userAuth, UserController.userData);
UserRouter.post('/profileEdit/:id',userAuth, UserController.profileEdit);
UserRouter.post('/imgupdate', upload.single('image'), UserController.updateImage);
UserRouter.get('/lawyerData', UserController.lawyerData);
UserRouter.get('/lawyerView', UserController.lawyerView);
UserRouter.get("/slotdate",userAuth, SlotController.getSlotDateUser);
UserRouter.get("/slotsuser",userAuth, SlotController.getSlotsUser);
UserRouter.get("/forgotpassword", UserController.forgotpassword);
UserRouter.post("/changepassword", UserController.changepassword);


export default UserRouter;
