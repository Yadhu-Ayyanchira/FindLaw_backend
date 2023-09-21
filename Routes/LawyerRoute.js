import Express from "express";
const LawyerRoute = Express.Router();
import LawyerController from "../Controllers/LawyerController.js";

LawyerRoute.post("/register", LawyerController.register);
LawyerRoute.get("/:id/verify/:token", LawyerController.verification);
LawyerRoute.post("/googleSignup", LawyerController.SignupWithGoogle);
LawyerRoute.post('/login',LawyerController.login)
export default LawyerRoute;
