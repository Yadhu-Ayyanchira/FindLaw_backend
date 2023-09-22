import Express from "express";
const AdminRout = Express.Router();
import AdminController from "../Controllers/AdminController.js"; 

AdminRout.post("/login",AdminController.login)
AdminRout.get('/users',AdminController.getUsers)

export default AdminRout;