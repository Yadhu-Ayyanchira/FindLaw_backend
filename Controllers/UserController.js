import User from "../Models/UserModel.js";
import Token from "../Models/TokenModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from '../Utils/SendMail.js'
import crypto from "crypto";

const signup = async (req, res, next) => {
  try {
    console.log("in useReg");
    const { name, email, password, mobile } = req.body;
    const exists = await User.findOne({ email: email });
    if (exists) {
      console.log("email already exists");
      return res
        .status(200)
        .json({ message: "Email already Exists", created: false });
    } else {
      const hash = await bcrypt.hash(password, 10);
      const newUser = new User({
        name: name,
        email: email,
        mobile: mobile,
        password: hash,
      });
      let user = await newUser.save().then(console.log("Registered"));

      const emailtoken = await new Token({
        userId : user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
        const url = `${process.env.SERVERURL}/${user._id}/verify/${emailtoken.token}`
        await sendMail(user.email, "Verify Email", url);
        console.log("email Succes");
      return res
        .status(200)
        .json({
          token: emailtoken,
          user: user,
          message: "Registerd",
          created: true,
        });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const verification = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.params.id });
    if (!user) {
      return res.status(400).json({ message: "invalid link" });
    }
    const token = await Token.findOne({
      userId: user._id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).json({ message: "invalid link" });
    }
    await User.updateOne({ _id: user._id }, { $set: { verified: true } });
    await Token.deleteOne({ _id: token._id });

    const jwtToken = jwt.sign({ _id: user._id }, process.env.JWTKEY, {
      expiresIn: "24hr",
    });
    const redirectUrl = process.env.REDIRECTURL;
    res.redirect(redirectUrl);
    // res.status(200).json({user:user,jwtToken,message:"email verification success"})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "internal server error" });
  }
};

// const login = async (req, res, next) => {
//  try {
//   const { email, pass } = req.body;
//   console.log("req.body.email", email);
//    const user = await User.findOne({ email: req.body.email });
//    if (!user)
//      return res.status(201).json({ access: false, message: "User not found" });

//    const isCorrect = bcrypt.compareSync(pass, user.password);
//    if (!isCorrect)
//      return res
//        .status(201)
//        .json({ access: false, message: "wrong password or username!" });

//    const token = jwt.sign(
//      { userId: user._id, },
//      process.env.JWTKEY,
//      { expiresIn: "24hr" }
//    );

//    const { password, ...info } = user._doc;
//    return res
//      .status(200)
//      .json({ access: true, token, info, message: "logged in successfully" });
//  } catch (err) {
//    next(err);
//  }
// };

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body; // Retrieve email and password from request body
    console.log("req.body.email", email);

    const user = await User.findOne({ email }); // Search for user by email
    if (!user)
      return res.status(201).json({ access: false, message: "User not found" });

    const isCorrect = bcrypt.compareSync(password, user.password); // Compare passwords
    if (!isCorrect)
      return res
        .status(201)
        .json({ access: false, message: "Wrong password or username!" });

    const token = jwt.sign({ userId: user._id }, process.env.JWTKEY, {
      expiresIn: "24hr",
    });

    const { pass, ...info } = user._doc; // Exclude password from response
    return res
      .status(200)
      .json({ access: true, token, info, message: "Logged in successfully" });
  } catch (err) {
    next(err);
  }
};


const SignupWithGoogle = async (req, res, next) => {
  try {
     console.log("SignupWithGoogle");
     const { name, email, id } = req.body;
     const exist = await User.findOne({ email: email });
      if (exist) {
        return res
          .status(200)
          .json({ created: false, message: "email Already exists" });
      } else {
        const hash = await bcrypt.hash(id, 10);
        const newUser = new User({
          name: name,
          email: email,
          password: hash,
        });
        let user = await newUser.save().then(console.log("saved"));
        await User.updateOne({ _id: user._id }, { $set: { verified: true } });
        const token = jwt.sign({ userId: user._id }, process.env.JWTKEY, {
          expiresIn: "24hr",
        });
        return res
          .status(200)
          .json({
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

export default {
  login,
  signup,
  SignupWithGoogle,
  verification,
};
