/* eslint-disable linebreak-style */
import jwt from "jsonwebtoken";
import User from "../Models/UserModel.js";
import Lawyer from "../Models/LawyerModel.js";
import dotenv from "dotenv";
dotenv.config();
export const lawyerAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.JWTKEY_LAWYER);
      const userRole = decoded.role;
      if (userRole == "lawyer") {
        const lawyer = await Lawyer.findOne({ _id: decoded.lawyerId });
        if (lawyer) {
          if (lawyer.is_blocked == false) {
            req.headers.lawyerId = decoded.lawyerId;
            next();
          } else {
            return res
              .status(201)
              .json({ status: false, message: "User Blocked" });
          }
        } else {
          return res
            .status(400)
            .json({ message: "user not authorised or invalid user" });
        }
      } else {
        return res.status(400).json({ message: "user not authorised" });
      }
    } else {
      return res.status(400).json({ message: "user not authorised" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const adminAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.JWTKEY_ADMIN);
      const userRole = decoded.role;
      if (userRole === "admin") {
        const admin = await User.findOne({ _id: decoded.adminId });
        if (admin) {
          if (admin.is_admin) {
            req.headers.adminId = decoded.adminId;
            next();
          } else {
            return res.status(400).json({ message: "Unauthorized access!" });
          }
        } else {
          return res
            .status(400)
            .json({ message: "User not authorized or invalid user" });
        }
      } else {
        return res.status(400).json({ message: "Admin not authorized" });
      }
    } else {
      return res.status(400).json({ message: "Admin not authenticated" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export const userAuth = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      console.log("have header");
      const token = req.headers.authorization;
      const decoded = jwt.verify(token, process.env.JWTKEY_USER);
      const userRole = decoded.role;
      if (userRole === "user") {
        console.log("roll ok",decoded);
        const user = await User.findById(decoded.userId);
        if (user) {
          console.log("have user");
          if (user.is_blocked == false) {
            console.log("not blked user");
            req.headers.userId = decoded._id;
            next();
          } else {
            console.log("user blked");
            return res.status(400).send("User Blocked");
          }
        } else {
          return res.status(400).json({ message: "Invalid user" });
        }
      } else {
        return res.status(400).json({ message: "Invalid role" });
      }
    } else {
      console.log("no headder");
      return res.status(400).json({ message: "Not Authenticated" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
