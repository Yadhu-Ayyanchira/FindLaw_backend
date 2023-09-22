import Express from "express";
const AdminRout = Express.Router();
import AdminController from "../Controllers/AdminController.js"; 

AdminRout.post("/login",AdminController.login)
AdminRout.get('/users',AdminController.getUsers)
AdminRout.get('/lawyers',AdminController.getLawyers)
AdminRout.put("/managelawyer/:id", AdminController.manageLawyers);

export default AdminRout;