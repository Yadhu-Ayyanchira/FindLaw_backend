import mongoose from "mongoose";
const { Schema, ObjectId } = mongoose;

const slotSchema = new Schema({
  lawyer: {
    type: Schema.Types.ObjectId,
    ref: "Lawyer",
    required: true,
  },
  slotes: {
    type: [
      {
        slotTime: {
          type: String,
          required: true,
        },
        date: {
          type: Date,
        },
        slotDate: {
          type: Date,
          required: true,
        },
        isBooked: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const Slot = mongoose.model("Slot", slotSchema);

export default Slot;
