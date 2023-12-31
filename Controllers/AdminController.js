/* eslint-disable linebreak-style */
import User from "../Models/UserModel.js";
import Lawyer from "../Models/LawyerModel.js";
import Appointment from "../Models/AppointmentModel.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import moment from "moment";

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const admin = await User.findOne({ email });
    if (!admin) {
      return res.status(201).json({ access: false, message: "User not found" });
    }

    const isCorrect = bcrypt.compareSync(password, admin.password);
    if (!isCorrect) {
      return res
        .status(201)
        .json({ access: false, message: "Wrong password or username!" });
    }

    if (admin.is_admin === false) {
      return res
        .status(201)
        .json({ access: false, message: "You are not admin!!!" });
    } else {
      const token = jwt.sign(
        { adminId: admin._id, role: "admin" },
        process.env.JWTKEY_ADMIN,
        {
          expiresIn: 86400000,
        }
      );

      // eslint-disable-next-line no-unused-vars
      const { pass, ...info } = admin._doc;
      return res
        .status(200)
        .json({ access: true, token, info, message: "Logged in successfully" });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const { page, filter, search } = req.query;
    let query = { is_admin: false };
    if (search) {
      query.$or = [{ name: { $regex: new RegExp(search, "i") } }];
    }
    const perPage = 5;
    const skip = (page - 1) * perPage;
    const count = await User.find(query).countDocuments();
    const users = await User.find(query).skip(skip).limit(perPage);
    return res
      .status(200)
      .json({ data: users, count, pageSize: perPage, page });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const getLawyers = async (req, res, next) => {
  try {
    const { page, filter, search } = req.query;
    let query = {is_approved: true};
    if (search) {
      query.$or = [{ name: { $regex: new RegExp(search, "i") } }];
    }
    const perPage = 5;
    const skip = (page - 1) * perPage;
    const count = await Lawyer.find(query).countDocuments();
    const users = await Lawyer.find(query).skip(skip).limit(perPage);
    return res
      .status(200)
      .json({ data: users, count, pageSize: perPage, page });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const manageLawyers = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await Lawyer.findById(id);
    if (user) {
      await Lawyer.updateOne(
        { _id: id },
        { $set: { is_blocked: !user.is_blocked } }
      );
      res
        .status(200)
        .json({ message: user.is_blocked ? "User Blocked" : "User UnBlocked" });
    } else {
      res.status(404).json({ message: "usernot found" });
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const getLawyerRequests = async (req, res, next) => {
  try {
     const { page, filter, search } = req.query;
     let query = { is_approved: false };
     if (search) {
       query.$or = [{ name: { $regex: new RegExp(search, "i") } }];
     }
     const perPage = 5;
     const skip = (page - 1) * perPage;
     const count = await Lawyer.find(query).countDocuments();
    const users = await Lawyer.find(query).skip(skip).limit(perPage);
    return res.status(200).json({ data: users,count, pageSize: perPage, page });
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const approveLawyer = async (req, res, next) => {
  try {
    const id = req.params.id;
    await Lawyer.findByIdAndUpdate(id, { is_approved: true });
    res.status(200).json({ message: "Lawyer Approved" });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const manageUsers = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    if (user) {
      await User.updateOne(
        { _id: id },
        { $set: { is_blocked: !user.is_blocked } }
      );
      res
        .status(200)
        .json({ message: user.is_blocked ? "User Blocked" : "User UnBlocked" });
    } else {
      res.status(404).json({ message: "usernot found" });
    }
  } catch (error) {
    console.log(error.message);
  }
};

const getTodaysAppointment = async (req, res, next) => {
  try {
    const userCount = await User.find().countDocuments();
    const lawyerCount = await Lawyer.find().countDocuments();
    const appointmentCount = await Appointment.find({}).countDocuments();
    const appointments = await Appointment.find({
      "scheduledAt.slotDate": moment().format("YYYY-MM-DDT00:00:00.000[Z]"),
    })
      .populate("user")
      .exec();
    if (appointments) {
      return res.status(200).json({ data: appointments, userCount, lawyerCount, appointmentCount, message: "Success" });
    } else {
      return res.status(200).json({ message: "No appointments available" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

export default {
  login,
  getUsers,
  getLawyers,
  manageLawyers,
  manageUsers,
  getLawyerRequests,
  approveLawyer,
  getTodaysAppointment,
};
