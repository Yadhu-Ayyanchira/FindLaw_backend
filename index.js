import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import UserRoutes from './Routes/UserRoute.js'
import AdminRoutes from './Routes/AdminRoute.js'
import LawyerRoutes from "./Routes/LawyerRoute.js";
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/", UserRoutes);
app.use("/admin", AdminRoutes);
app.use("/lawyer", LawyerRoutes);

mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to mongoose");
  })
  .catch((err) => {
    console.log(err.message);
  });

app.listen(4000, () => {
  console.log("server is running @ 4000");
});

app.use(
  cors({
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST", "PUT"],
    credentials: true,
  })
);
