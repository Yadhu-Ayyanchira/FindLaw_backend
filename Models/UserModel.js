const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
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
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  flc: {
    type: number,
    required: false,
  },
  is_blocked: {
    type: Boolean,
    default: false,
  },
  is_admin: {
    type: Boolean,
    default: false,
  },
  image: {
    type: String,
    default:
      "https://img.freepik.com/free-psd/3d-illustration-person-with-sunglasses_23-2149436178.jpg?w=740&t=st=1694511037~exp=1694511637~hmac=7afb019f7b279def27b7c8cff245f9ab0ecc12fadc50d085af0db00d777ee63b",
  },
});