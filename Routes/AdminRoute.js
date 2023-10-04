import Express from "express";
const AdminRout = Express.Router();
import AdminController from "../Controllers/AdminController.js"

AdminRout.post("/login",AdminController.login)
AdminRout.get('/users',AdminController.getUsers)
AdminRout.get('/lawyers',AdminController.getLawyers)
AdminRout.get("/lawyerRequests", AdminController.getLawyerRequests);
AdminRout.put("/managelawyer/:id", AdminController.manageLawyers)
AdminRout.put("/manageuser/:id", AdminController.manageUsers)
AdminRout.put("/approvelawyer/:id", AdminController.approveLawyer);


export default AdminRout;