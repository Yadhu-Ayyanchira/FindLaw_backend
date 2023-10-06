import Lawyer from "../Models/LawyerModel.js";
import Token from "../Models/TokenModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../Utils/SendMail.js";
import crypto from "crypto";

const register = async (req, res, next) => {
  try {
    console.log("in lawyer Reg");
    const { name, email, password, mobile } = req.body;
    const exists = await Lawyer.findOne({ email: email });
    if (exists) {
      console.log("email already exists");
      return res
        .status(200)
        .json({ message: "Email already Exists", created: false });
    } else {
      const hash = await bcrypt.hash(password, 10);
      const newUser = new Lawyer({
        name: name,
        email: email,
        mobile: mobile,
        password: hash,
      });
      let lawyer = await newUser.save().then(console.log("Registered"));

      const emailtoken = await new Token({
        userId: lawyer._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
      const url = `${process.env.SERVERURL}/lawyer/${lawyer._id}/verify/${emailtoken.token}`;
      await sendMail(lawyer.email, "Verify Email", url);
      console.log("email Succes");
      return res.status(200).json({
        token: emailtoken,
        user: lawyer,
        message: "Registerd",
        created: true,
      });
    }
  } catch (error) {
    onsole.log(error);
    return res.status(500).json({ message: "internal server error" });
  }
};

const verification = async (req, res) => {
  try {
    console.log("lawyer is");
    const lawyer = await Lawyer.findOne({ _id: req.params.id });
    if (!lawyer) {
      return res.status(400).json({ message: "invalid link" });
    }
    const token = await Token.findOne({
      userId: lawyer._id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).json({ message: "invalid linkk" });
    }
    await Lawyer.updateOne({ _id: lawyer._id }, { $set: { verified: true } });
    await Token.deleteOne({ _id: token._id });

    const jwtToken = jwt.sign({ _id: lawyer._id }, process.env.JWTKEY, {
      expiresIn: "24hr",
    });
    const redirectUrl = process.env.LAWYERREDIRECTURL;
    res.redirect(redirectUrl);
    // res.status(200).json({user:user,jwtToken,message:"email verification success"})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "internal server error" });
  }
};

const SignupWithGoogle = async (req, res, next) => {
  try {
    console.log("SignupWithGoogle lawyer");
    const { name, email, id } = req.body;
    const exist = await Lawyer.findOne({ email: email });
    if (exist) {
      return res
        .status(200)
        .json({ created: false, message: "email Already exists" });
    } else {
      const hash = await bcrypt.hash(id, 10);
      const newUser = new Lawyer({
        name: name,
        email: email,
        password: hash,
      });
      let user = await newUser.save().then(console.log("saved"));
      await Lawyer.updateOne({ _id: user._id }, { $set: { verified: true } });
      const token = jwt.sign({ userId: user._id }, process.env.JWTKEY, {
        expiresIn: "24hr",
      });
      return res.status(200).json({
        created: true,
        token: token,
        user,
        message: "Account Registered",
      });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const login = async (req, res, next) => {
  try {
    console.log("djcbd");
    const { email, password } = req.body;
    console.log("email", email);
    const user = await Lawyer.findOne({ email });
    if (!user)
      return res.status(201).json({ access: false, message: "User not found" });
    if(user.verified==false)
      return res.status(201).json({ access: false, message: "User not verified" });
    if (user.is_blocked) {
      console.log("bloked");
      return res.status(201).json({ access: false, message: "User Blocked" });
    }
    const isCorrect = bcrypt.compareSync(password, user.password)
    if (!isCorrect)
      return res
        .status(201)
        .json({ access: false, message: "Wrong password or username!" })

    const token = jwt.sign({ userId: user._id }, process.env.JWTKEY, {
      expiresIn: "24hr",
    });

    // const { pass, ...info } = user._doc;
    return res
      .status(200)
      .json({ access: true, token, info:user, message: "Logged in successfully" })
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  verification,
  SignupWithGoogle,
  login,
};
