/* eslint-disable linebreak-style */
/* eslint-disable new-cap */
import Express from 'express';
const AdminRout = Express.Router();
import AdminController from '../Controllers/AdminController.js';
import {adminAuth} from '../Middleware/Auth.js';

AdminRout.post('/login', AdminController.login);
AdminRout.get('/users', adminAuth, AdminController.getUsers);
AdminRout.get('/lawyers', adminAuth, AdminController.getLawyers);
AdminRout.get('/lawyerRequests', adminAuth, AdminController.getLawyerRequests);
AdminRout.put('/managelawyer/:id', adminAuth, AdminController.manageLawyers);
AdminRout.put('/manageuser/:id', adminAuth, AdminController.manageUsers);
AdminRout.put('/approvelawyer/:id', adminAuth, AdminController.approveLawyer);
AdminRout.get('/gettodays', adminAuth, AdminController.getTodaysAppointment);


export default AdminRout;
