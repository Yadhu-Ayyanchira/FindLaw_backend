import User from "../Models/UserModel.js";
import Token from "../Models/TokenModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const login = async (req, res, next) => {
    try {
        console.log('wyd');
      const { email, password } = req.body;
      const admin = await User.findOne({ email });
      if (!admin)
        return res
          .status(201)
          .json({ access: false, message: "User not found" });

      const isCorrect = bcrypt.compareSync(password, admin.password);
      if (!isCorrect)
        return res
          .status(201)
          .json({ access: false, message: "Wrong password or username!" });

        if(admin.is_admin === false){
             return res
               .status(201)
               .json({ access: false, message: "You are not admin!!!" });
        }else{
            console.log('yesss');
      const token = jwt.sign({ userId: admin._id }, process.env.JWTKEY, {
        expiresIn: "24hr",
      });

      const { pass, ...info } = admin._doc;
      return res
        .status(200)
        .json({ access: true, token, info, message: "Logged in successfully" });
    }
    } catch (err) {
      next(err);
    }
}

const getUsers = async (req,res,next) =>{
  try {
    console.log('get users');
    const users = await User.find({is_admin : false})
    return res.status(200).json({data : users})
  } catch (error) {
    console.log(error)
    next(error)
  }
}
const getLawyers = async (req,res,next) =>{
  try {
    console.log('get users');
    const users = await User.find({is_admin : false})
    return res.status(200).json({data : users})
  } catch (error) {
    console.log(error)
    next(error)
  }
}

export default {
    login,
    getUsers,
    getLawyers
}