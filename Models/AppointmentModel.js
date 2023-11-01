import mongoose from "mongoose";

const { Schema,ObjectId } = mongoose;

const appointmentschema = new Schema(
  {
    lawyer: {
      type: Schema.Types.ObjectId,
      ref: "Lawyer",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    slotId: {
      type: Schema.Types.ObjectId,
      ref: "Slot",
      required: true,
    },
    isConsulted: {
      type: Boolean,
      default: false,
    },
    callId: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["consulted", "cancelled", "notConsulted","rejected"],
      default: "notConsulted",
    },
    AppoinmentStatus: {
      type: String,
      enum: ["active", "expired"],
      default: "active",
    },
    scheduledAt: {
      slotTime: { type: String },
      slotDate: { type: String },
    },
  },
  {
    timestamps: { createdAt: "created_at" },
  }
);

const Appoinment = mongoose.model("Appointment", appointmentschema);
export default Appoinment;