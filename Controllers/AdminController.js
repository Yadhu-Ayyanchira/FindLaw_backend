/* eslint-disable linebreak-style */
import User from '../Models/UserModel.js';
import Lawyer from '../Models/LawyerModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const login = async (req, res, next) => {
  try {
    console.log('wyd');
    const {email, password} = req.body;
    console.log('object', email);
    const admin = await User.findOne({email});
    if (!admin) {
      return res.status(201).json({access: false, message: 'User not found'});
    }

    const isCorrect = bcrypt.compareSync(password, admin.password);
    if (!isCorrect) {
      return res
          .status(201)
          .json({access: false, message: 'Wrong password or username!'});
    }

    if (admin.is_admin === false) {
      return res
          .status(201)
          .json({access: false, message: 'You are not admin!!!'});
    } else {
      console.log('yesss', process.env.JWTKEY_ADMIN);
      const token = jwt.sign({adminId: admin._id, role: 'admin'}, process.env.JWTKEY_ADMIN, {
        expiresIn: 86400000,
      });

      // eslint-disable-next-line no-unused-vars
      const {pass, ...info} = admin._doc;
      return res
          .status(200)
          .json({access: true, token, info, message: 'Logged in successfully'});
    }
  } catch (err) {
    next(err);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const {active} = req.params;
    const start = (active-1)*5;
    const end=start+5;
    const users = await User.find({is_admin: false}).skip(start).limit(end);
    return res.status(200).json({data: users});
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const getLawyers = async (req, res, next) => {
  try {
    const {active} = req.params;
    console.log('page is', active);
    const start = (active - 1) * 5;
    const end = start + 5;
    const users = await Lawyer.find({is_approved: true}).skip(start).limit(end);
    return res.status(200).json({data: users});
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
          {_id: id},
          {$set: {is_blocked: !user.is_blocked}},
      );
      res
          .status(200)
          .json({message: user.is_blocked ? 'User Blocked' : 'User UnBlocked'});
    } else {
      res.status(404).json({message: 'usernot found'});
    }
  } catch (error) {
    console.log(error.message);
    next(error);
  }
};

const getLawyerRequests = async (req, res, next) => {
  try {
    const {active} = req.params;
    console.log('page is req', active);

    const start = (active - 1) * 5;
    const end = start + 5;
    const users = await Lawyer.find({is_approved: false}).skip(start).limit(end);
    return res.status(200).json({data: users});
  } catch (error) {
    console.log(error);
    next(error);
  }
};
const approveLawyer = async (req, res, next) => {
  try {
    console.log('approve lawyer');
    const id = req.params.id;
    await Lawyer.findByIdAndUpdate(id, {is_approved: true});
    res.status(200).json({message: 'Lawyer Approved'});
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const manageUsers = async (req, res, next) => {
  try {
    const id = req.params.id;
    console.log('user id', id);
    const user = await User.findById(id);
    if (user) {
      await User.updateOne(
          {_id: id},
          {$set: {is_blocked: !user.is_blocked}},
      );
      res
          .status(200)
          .json({message: user.is_blocked ? 'User Blocked' : 'User UnBlocked'});
    } else {
      res.status(404).json({message: 'usernot found'});
    }
  } catch (error) {
    console.log(error.message);
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
};
