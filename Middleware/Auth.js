import jwt from "jsonwebtoken"
import User from "../Models/UserModel"
import Lawyer from "../Models/LawyerModel"

import dotenv from 'dotenv'
dotenv.config()

export const lawyerAuth = async (req, res, next) => {
    try {
        if(req.headers.Authorization){
            let token = req.headers.Authorization.split(" ")[1];
            const decoded = jwt.verify(token, process.env.JWTKEY_LAWYER);
            const lawyer = await Lawyer.findOne({_id:decoded.lawyerId})
            if(lawyer){
                if(lawyer.is_blocked==false){
                    req.headers.lawyerId = decoded.lawyerId
                    next()
                }else{
                    return res
                      .status(403)
                      .json({ data: { message: "You are blocked by admin " } });
                }
            }else{
                return res
                  .status(400)
                  .json({ message: "user not authorised or inavid user" });
            }
        }else{
            return res.status(400).json({ message: "user not authorised" });
        }
    } catch (error) {
        console.log(error);
        next(error)
    }
}