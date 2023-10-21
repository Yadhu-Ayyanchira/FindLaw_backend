import Express from "express";
const AdminRout = Express.Router();
import AdminController from "../Controllers/AdminController.js"
import { adminAuth } from "../Middleware/Auth.js";

AdminRout.post("/login",AdminController.login)
AdminRout.get('/users/:active',adminAuth, AdminController.getUsers)
AdminRout.get('/lawyers/:active',adminAuth, AdminController.getLawyers)
AdminRout.get("/lawyerRequests/:active",adminAuth, AdminController.getLawyerRequests);
AdminRout.put("/managelawyer/:id",adminAuth, AdminController.manageLawyers)
AdminRout.put("/manageuser/:id",adminAuth, AdminController.manageUsers)
AdminRout.put("/approvelawyer/:id",adminAuth, AdminController.approveLawyer);


export default AdminRout;