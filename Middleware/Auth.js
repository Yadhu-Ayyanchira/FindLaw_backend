import jwt from "jsonwebtoken"
import User from "../Models/UserModel.js"
import Lawyer from "../Models/LawyerModel.js"

import dotenv from 'dotenv'
dotenv.config()

export const lawyerAuth = async (req, res, next) => {
    try {
        if (req.headers.authorization) {
          let token = req.headers.authorization
          console.log("token is",token);
          const decoded = jwt.verify(token, process.env.JWTKEY_LAWYER);
          console.log("decoded is",decoded);
          const userRole = decoded.role;
          console.log("role is",userRole)
          if(userRole == "lawyer"){
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
                .json({ message: "user not authorised or inavid user" });
            }
          }else{
              return res.status(400).json({ message: "user not authorised" });
          }
        } else {
          return res.status(400).json({ message: "user not authorised" });
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}

export const adminAuth = async (req,res,next) => {
  try {
    if(req.headers.authorization){
      let token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWTKEY_ADMIN);
      const userRole = decoded.role;
      if (userRole == "lawyer") {
        const admin = await User.findOne({ _id: decoded.adminId });
        if (admin) {
          if (admin.is_admin) {
            req.headers.adminId = decoded.adminId;
            next();
          } else {
            return res.status(403).json({ message: "Unauthorized access!" });
          }
        } else {
          return res
            .status(400)
            .json({ message: "user not authorized or invalid user" });
        }
      } else {
        return res.status(400).json({ message: "admin not authorised" });
      }
    }else{
      return res.status(400).json({message:"admin not authenticated"});
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
}