import Express from "express";
const LawyerRoute = Express.Router();
import LawyerController from "../Controllers/LawyerController.js";

LawyerRoute.post("/register", LawyerController.register);
LawyerRoute.get("/:id/verify/:token", LawyerController.verification);

export default LawyerRoute;
