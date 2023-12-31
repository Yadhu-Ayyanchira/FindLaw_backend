/* eslint-disable linebreak-style */
import Lawyer from "../Models/LawyerModel.js";
import Appointment from "../Models/AppointmentModel.js";
import Token from "../Models/TokenModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import sendMail from "../Utils/SendMail.js";
import crypto from "crypto";
import uploadToClodinary from "../Utils/Cloudinary.js";
import Appoinment from "../Models/AppointmentModel.js";

const register = async (req, res, next) => {
  try {
    const { name, email, password, mobile } = req.body;
    const exists = await Lawyer.findOne({ email: email });
    if (exists) {
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
      const lawyer = await newUser.save().then(console.log("Registered"));

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
    console.log(error);
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
      lawyerId: lawyer._id,
      token: req.params.token,
    });
    if (!token) {
      return res.status(400).json({ message: "invalid linkk" });
    }
    await Lawyer.updateOne({ _id: lawyer._id }, { $set: { verified: true } });
    await Token.deleteOne({ _id: token._id });

    // const jwtToken = jwt.sign({lawyerId: lawyer._id, role: 'lawyer'}, process.env.JWTKEY_LAWYER, {
    // expiresIn: "24hr",
    // });
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
      const user = await newUser.save().then(console.log("saved"));
      await Lawyer.updateOne({ _id: user._id }, { $set: { verified: true } });
      const token = jwt.sign(
        { lawyerId: user._id, role: "lawyer" },
        process.env.JWTKEY_LAWYER,
        {
          expiresIn: "24hr",
        }
      );
      return res.status(200).json({
        created: true,
        token: token,
        user,
        message: "Account Registered",
      });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    console.log("djcbd");
    const { email, password } = req.body;
    console.log("email", email);
    const user = await Lawyer.findOne({ email });
    if (!user) {
      return res.status(201).json({ access: false, message: "User not found" });
    }

    if (user.verified == false) {
      return res
        .status(201)
        .json({ access: false, message: "User not verified" });
    }
    if (user.is_blocked) {
      return res.status(201).json({ access: false, message: "User Blocked" });
    }
    const isCorrect = bcrypt.compareSync(password, user.password);
    if (!isCorrect) {
      return res
        .status(201)
        .json({ access: false, message: "Wrong password or username!" });
    }
    const token = jwt.sign(
      { lawyerId: user._id, role: "lawyer" },
      process.env.JWTKEY_LAWYER,
      {
        expiresIn: "24hr",
      }
    );
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
const lawyerData = async (req, res, next) => {
  try {
    const id = req.params.id;

    const lawyer = await Lawyer.findById(id);
    if (lawyer) {
      return res.status(200).json({ data: lawyer });
    }
  } catch (error) {
    next(error);
    console.log(error);
  }
};

const profileEdit = async (req, res, next) => {
  try {
    const { name, place, experience, mobile } = req.body;

    const lawyerId = req.params.id;

    const lawyer = await Lawyer.findByIdAndUpdate(
      { _id: lawyerId },
      { $set: { name, place, experience, mobile } },
      { new: true }
    );

    if (!lawyer) {
      return res
        .status(404)
        .json({ updated: false, msg: "No such lawyer found" });
    }

    return res
      .status(200)
      .json({ updated: true, data: lawyer, msg: "Updated successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const aboutEdit = async (req, res, next) => {
  try {
    const { about } = req.body;
    const lawyerId = req.params.id;

    const lawyer = await Lawyer.findByIdAndUpdate(
      { _id: lawyerId },
      { $set: { about } },
      { new: true }
    );

    if (!lawyer) {
      return res
        .status(404)
        .json({ updated: false, msg: "No such lawyer found" });
    }

    console.log(lawyer);
    return res
      .status(200)
      .json({ updated: true, data: lawyer, msg: "Updated successfully" });
  } catch (error) {
    console.error(error);
    next(error);
  }
};

const updateImage = async (req, res, next) => {
  try {
    const id = req.body.userId;
    const image = req.file.path;
    console.log("backend img up", image);
    const uploadDp = await uploadToClodinary(image, "dp");
    const updated = await Lawyer.findByIdAndUpdate(
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

const shareLink = async (req, res, next) => {
  try {
    const { link, id } = req.body;
    const updatedAppointment = await Appointment.findOneAndUpdate(
      { _id: id },
      {
        $set: {
          callId: link,
        },
      }
    )
       if (updatedAppointment) {
         return res.status(200).json({ created: true });
       } else {
         return res.status(200).json({ created: false });
       }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const dashboardData = async (req, res, next) => {
  try {
    const lawyerId = req.headers.lawyerId;
    const appointmentCount = await Appointment.find().countDocuments();
    const rejectCount = await Appointment.find({lawyer: lawyerId, AppoinmentStatus: "rejected",}).countDocuments();
    const consultCount = await Appointment.find({lawyer: lawyerId, AppoinmentStatus: "consulted",}).countDocuments();
    console.log("dsswswsws", consultCount);
    return res.status(200).json({appointments: appointmentCount, consulted: consultCount, rejected: rejectCount,});
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const callUpdate = async (req,res,next) => {
  try {
    console.log("im doem");
    const appointmentId=req.params.appointmentId
    console.log("sdkmedmedkmekdmekmde",appointmentId);
    const appoiment =await Appoinment.updateOne(
      {_id : appointmentId},
      {$set:{AppoinmentStatus : "consulted"}}
    )
    if(!appoiment){
      return res.status(201).send({ message: "success" });
      }else{
      return res.status(201).send({message:'success'})
    }
    
  } catch (error) {
   console.log(error); 
   next(error)
  }
}

const addExpertise = async (req, res, next) => {
  try {
    const { data } = req.body;
    const lawyerId = req.headers.lawyerId;

    const updatedLawyer = await Lawyer.findOneAndUpdate(
      { _id: lawyerId },
      {
        $push: { specialised: data },
      },
      { new: true }
    );

    if (updatedLawyer) {
      return res.status(200).json({ created: true, lawyer: updatedLawyer });
    } else {
      return res.status(200).json({ created: false });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const removeExpertise = async (req, res, next) => {
  try {
    const { data } = req.body;
    const lawyerId = req.headers.lawyerId;
    const updatedLawyer = await Lawyer.findOneAndUpdate(
      { _id: lawyerId },
      {
        $pull: { specialised: data },
      },
      { new: true }
    );

    if (updatedLawyer) {
      return res.status(200).json({ created: true, lawyer: updatedLawyer });
    } else {
      return res.status(200).json({ created: false });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default {
  register,
  verification,
  SignupWithGoogle,
  login,
  lawyerData,
  profileEdit,
  aboutEdit,
  updateImage,
  shareLink,
  dashboardData,
  callUpdate,
  addExpertise,
  removeExpertise,
};
