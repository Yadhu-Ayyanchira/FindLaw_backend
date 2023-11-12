import Express from "express";
const LawyerRoute = Express.Router();
import LawyerController from "../Controllers/LawyerController.js";
import upload from "../Middleware/Multer.js";
import { lawyerAuth } from "../Middleware/Auth.js";
import SlotController from "../Controllers/SlotController.js";

LawyerRoute.post("/register", LawyerController.register);
LawyerRoute.get("/:id/verify/:token", LawyerController.verification);
LawyerRoute.post("/googleSignup", LawyerController.SignupWithGoogle);
LawyerRoute.post('/login',LawyerController.login)
LawyerRoute.get("/lawyerData/:id",lawyerAuth , LawyerController.lawyerData);
LawyerRoute.post("/profileEdit/:id",lawyerAuth, LawyerController.profileEdit);
LawyerRoute.put("/aboutEdit/:id",lawyerAuth, LawyerController.aboutEdit);
LawyerRoute.post("/imgupdate",lawyerAuth,upload.single("image"), LawyerController.updateImage)
LawyerRoute.post("/addSlot",lawyerAuth,SlotController.addSlot);
LawyerRoute.get("/slotDate",lawyerAuth,SlotController.getSlotDate)
LawyerRoute.get("/slots",lawyerAuth,SlotController.getSlots);
LawyerRoute.get("/appointmentDate", lawyerAuth, SlotController.getAppointmentDate);
LawyerRoute.get("/appointmentrequest", lawyerAuth, SlotController.appointmentRequest);
LawyerRoute.put("/rejectappointment",lawyerAuth,SlotController.rejectAppointment);
LawyerRoute.post("/sharelink", lawyerAuth, LawyerController.shareLink);
LawyerRoute.get("/dashboarddata", lawyerAuth, LawyerController.dashboardData);
LawyerRoute.put("/callupdate/:appointmentId", lawyerAuth, LawyerController.callUpdate);
export default LawyerRoute;
