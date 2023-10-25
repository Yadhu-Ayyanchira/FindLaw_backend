/* eslint-disable linebreak-style */
import User from "../Models/UserModel.js";
import Lawyer from "../Models/LawyerModel.js";
import Token from "../Models/TokenModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../Utils/SendMail.js";
import crypto from "crypto";
import uploadToClodinary from "../Utils/Cloudinary.js";

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
      const user = await newUser.save().then(console.log("Registered"));

      const emailtoken = await new Token({
        userId: user._id,
        token: crypto.randomBytes(32).toString("hex"),
      }).save();
      const url = `${process.env.SERVERURL}/${user._id}/verify/${emailtoken.token}`;
      await sendMail(user.email, "Verify Email", url);
      console.log("email Succes");
      return res.status(200).json({
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

    // const jwtToken = jwt.sign({_id: user._id}, process.env.JWTKEY_USER, {
    //   expiresIn: '24hr',
    // });
    const redirectUrl = process.env.REDIRECTURL;
    res.redirect(redirectUrl);
    // res.status(200).json({user:user,jwtToken,message:"email verification success"})
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "internal server error" });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log("req.body.email", email);

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(201).json({ access: false, message: "User not found" });
    }
    if (user.verified == false) {
      return res
        .status(201)
        .json({ access: false, message: "User not verified" });
    }
    if (user.is_blocked) {
      console.log("bloked");
      return res.status(201).json({ access: false, message: "User Blocked" });
    }
    const isCorrect = bcrypt.compareSync(password, user.password);
    if (!isCorrect) {
      return res
        .status(201)
        .json({ access: false, message: "Wrong password or username!" });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWTKEY_USER, {
      expiresIn: "24hr",
    });
    // const { pass, ...info } = user._doc;

    return res.status(200).json({
      access: true,
      token,
      info: user,
      message: "Logged in successfully",
    });
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
      const user = await newUser.save().then(console.log("saved"));
      await User.updateOne({ _id: user._id }, { $set: { verified: true } });
      const token = jwt.sign({ userId: user._id }, process.env.JWTKEY_USER, {
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

const userData = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      return res.status(200).json({ data: user });
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
};

const profileEdit = async (req, res, next) => {
  try {
    const { name, place, mobile } = req.body;

    const userId = req.params.id;
    console.log("user id", userId);

    const user = await User.findByIdAndUpdate(
      { _id: userId },
      { $set: { name, place, mobile } },
      { new: true }
    );

    if (!user) {
      return res
        .status(404)
        .json({ updated: false, msg: "No such user found" });
    }

    return res
      .status(200)
      .json({ updated: true, data: user, msg: "Updated successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateImage = async (req, res, next) => {
  console.log("inn img");
  try {
    const id = req.body.userId;
    const image = req.file.path;
    console.log("backend img up", image);
    const uploadDp = await uploadToClodinary(image, "dp");
    const updated = await User.findByIdAndUpdate(
      { _id: id },
      { $set: { image: uploadDp.url } },
      { new: true }
    );
    if (updated) {
      console.log("updated image");
      return res
        .status(200)
        .json({ data: updated, message: "Profile picture updated" });
    }
    return res.status(202).json({ message: "Upload failed" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const lawyerData = async (req, res, next) => {
  try {
    const { page, filter, search } = req.query;
    console.log("page searchedd", page, filter, search);
    const query = { is_approved: true };

    if (search) {
      query.$or = [
        { name: { $regex: new RegExp(search, "i") } },
        { place: { $regex: new RegExp(search, "i") } },
      ];
    }
    const lawyers = await Lawyer.find(query);
    return res.status(200).json({ data: lawyers });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const lawyerView = async (req,res,next) =>{
  try {
    const {id} = req.query 
    const lawyer = await Lawyer.findById(id)
    return res.status(200).json({ data: lawyer });
  } catch (error) {
    console.log(error);
    next(error)
  }
}

export default {
  login,
  signup,
  SignupWithGoogle,
  verification,
  userData,
  profileEdit,
  updateImage,
  lawyerData,
  lawyerView,
};
