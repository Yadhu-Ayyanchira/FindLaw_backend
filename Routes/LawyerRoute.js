import Express from "express";
const LawyerRoute = Express.Router();
import LawyerController from "../Controllers/LawyerController.js";
import upload from "../Middleware/Multer.js";

LawyerRoute.post("/register", LawyerController.register);
LawyerRoute.get("/:id/verify/:token", LawyerController.verification);
LawyerRoute.post("/googleSignup", LawyerController.SignupWithGoogle);
LawyerRoute.post('/login',LawyerController.login)
LawyerRoute.get("/lawyerData/:id", LawyerController.lawyerData);
LawyerRoute.post("/profileEdit/:id", LawyerController.profileEdit);
LawyerRoute.put("/aboutEdit/:id", LawyerController.aboutEdit);
LawyerRoute.post("/imgupdate",upload.single("image"), LawyerController.updateImage)
export default LawyerRoute;
