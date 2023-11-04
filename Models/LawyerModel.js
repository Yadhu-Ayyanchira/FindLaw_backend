import mongoose from "mongoose";

const lawyerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  mobile: {
    type: String,
  },
  password: {
    type: String,
    required: true,
  },
  brn: {
    type: String,
  },
  about: {
    type: String,
    default: "About your self",
  },
  place: {
    type: String,
    default: "California",
  },
  practice: {
    type: String,
  },
  is_blocked: {
    type: Boolean,
    default: false,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  is_approved: {
    type: Boolean,
    default: false,
  },
  experience: {
    type: Number,
    default: 0,
  },
  specialised: {
    type: Array,
    default: [],
  },
  image: {
    type: String,
    default:
      "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436178.jpg?w=740&t=st=1694511037~exp=1694511637~hmac=7afb019f7b279def27b7c8cff245f9ab0ecc12fadc50d085af0db00d777ee63b",
  },
});

const Lawyer = mongoose.model("Lawyer", lawyerSchema);
export default Lawyer;
