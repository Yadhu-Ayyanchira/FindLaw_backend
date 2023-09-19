import Express from "express";
import AdminController from '../Controllers/AdminController' 
const AdminRout = Express.Router();

AdminRout.post("/login",()=>console.log('hello admin backend'))

