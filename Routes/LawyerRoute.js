import Express from "express";
const LawyerRoute = Express.Router();
import LawyerController from "../Controllers/LawyerController.js";

LawyerRoute.get("/lawlog", LawyerController.login);

export default LawyerRoute;
