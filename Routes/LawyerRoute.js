import Express from "express";
const LawyerRoute = Express.Router();
import LawyerController from "../Controllers/LawyerController.js";
import upload from "../Middleware/Multer.js";
import { lawyerAuth } from "../Middleware/Auth.js";

LawyerRoute.post("/register", LawyerController.register);
LawyerRoute.get("/:id/verify/:token", LawyerController.verification);
LawyerRoute.post("/googleSignup", LawyerController.SignupWithGoogle);
LawyerRoute.post('/login',LawyerController.login)
LawyerRoute.get("/lawyerData/:id",lawyerAuth , LawyerController.lawyerData);
LawyerRoute.post("/profileEdit/:id",lawyerAuth, LawyerController.profileEdit);
LawyerRoute.put("/aboutEdit/:id",lawyerAuth, LawyerController.aboutEdit);
export default LawyerRoute;
