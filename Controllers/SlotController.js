import Slot from "../Models/SlotModel.js";
import Lawyer from "../Models/LawyerModel.js";
import Appointment from "../Models/AppointmentModel.js";
import moment from "moment";
import mongoose from "mongoose";
import User from "../Models/UserModel.js";

const addSlot = async (req, res, next) => {
  try {
    const lawyerId = req.headers.lawyerId;
    const { startTime, endTime, startDate, endDate } = req.body;
    if (new Date(endDate) < new Date(startDate)) {
      return res.status(400).json({
        message: "End date should be greater than the start date",
      });
    }
    const slotDuration = 30;
    const createdSlots = [];
    const currentDate = new Date(startDate);
    const endDateObj = new Date(endDate);
    while (currentDate <= endDateObj) {
      const date = moment(currentDate).format("YYYY-MM-DD");
      const findSlotExist = await Slot.findOne({
        lawyer: lawyerId,
        slotes: {
          $elemMatch: {
            slotDate: date,
            $or: [
              {
                slotTime: { $gte: startTime, $lt: endTime },
              },
              {
                slotTime: { $lte: startTime },
                endTime: { $gt: startTime },
              },
              {
                slotTime: { $lt: endTime },
                endTime: { $gte: endTime },
              },
            ],
          },
        },
      });
      if (findSlotExist) {
        return res.status(409).json({ message: "Slot already exists" });
      }
      const createSlots = generateTimeSlots(
        startTime,
        endTime,
        slotDuration,
        date
      );
      createdSlots.push({
        date: currentDate,
        slots: createSlots,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
      const slotData = createdSlots.map((slotObj) => {
        return {
          lawyer: lawyerId,
          slotes: slotObj.slots,
        };
      });
      const savedSlots = await Slot.create(slotData);
      return res.status(200).json({ savedSlots });
    
  } catch (error) {
    console.log(error);
    next(error);
  }
};
function generateTimeSlots(startTime, endTime, slotDuration, date) {
  console.log("inside gwnerate tiem slot",startTime, endTime, slotDuration, date);
  const slots = [];
  const end = new Date(`${date} ${endTime}`);
  const start = new Date(` ${date} ${startTime} `);
  while (start < end) {
    const slotTime = start.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const slotDoc = {
      slotTime: slotTime,
      slotDate: date,
      date: start,
      isBooked: false,
    };

    slots.push(slotDoc);
    start.setMinutes(start.getMinutes() + slotDuration);
  }
  return slots;
}

const getSlotDate = async (req, res, next) => {
  try {
    const lawyerId = req.headers.lawyerId;
    const result = await Slot.aggregate([
      { $match: { lawyer: new mongoose.Types.ObjectId(lawyerId) } },
      { $unwind: "$slotes" },
      {
        $group: {
          _id: "$slotes.slotDate",
          slotDates: { $addToSet: "$slotes.slotDate" },
        },
      },
      {
        $project: {
          _id: 0,
          slotDates: 1,
        },
      },
    ]);
    if (result) {
      const slotArray = result.map((item) => item.slotDates);
      const slotDates = slotArray.flat();
      res
        .status(200)
        .json({ statusCode: 200, data: slotDates, message: "success" });
    } else {
      return res.status(200).json({ message: "No slots" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getSlots = async (req, res, next) => {
  try {
    const { date } = req.query;
    if (!date) {
      return res.status(200).json({ message: "please select Date" });
    }

    const lawyerId = req.headers.lawyerId;
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
    await Slot.updateMany(
      {
        lawyer: lawyerId,
        "slotes.slotDate": { $lte: yesterday },
      },
      {
        $pull: {
          slotes: {
            slotDate: { $lte: yesterday },
          },
        },
      }
    );

    const availableSlots = await Slot.find({
      lawyer: lawyerId,
      "slotes.slotDate": { $eq: new Date(date) },
    }).exec();
    if (availableSlots) {
      return res.status(200).json({ data: availableSlots, message: "success" });
    } else {
      return res.status(200).json({ message: "slote not avilble" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getSlotDateUser = async (req, res, next) => {
  try {
    const { lawyerId } = req.query;
    console.log("sl dat",lawyerId);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
    tomorrow.setHours(0);
    tomorrow.setMinutes(0);
    tomorrow.setSeconds(0);
    tomorrow.setMilliseconds(0);
    const formattedDate = tomorrow.toISOString().replace("Z", "+00:00");
    const result = await Slot.aggregate([
      {
        $match: {
          lawyer: new mongoose.Types.ObjectId(lawyerId),
          "slotes.slotDate": { $gte: tomorrow },
        },
      },
      { $unwind: "$slotes" },
      {
        $group: {
          _id: "$slotes.slotDate",
          slotDates: { $addToSet: "$slotes.slotDate" },
        },
      },
      {
        $project: {
          _id: 0,
          slotDates: 1,
        },
      },
    ]);
    if (result) {
      const slotArray = result.map((item) => item.slotDates);
      const slotDates = slotArray.flat();
      console.log(slotDates);
      return res.status(200).json({ data: slotDates, message: "success" });
    } else {
      return res.status(200).json({ cmessage: "No slots" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getSlotsUser = async (req, res, next) => {
  try {
    const { date, lawyerId } = req.query;
    console.log("law",date,lawyerId);
    if (!date) {
      return res.status(400).json({ message: "Please select a Date" });
    }

    const validDate = moment(date, "YYYY-MM-DD")
      .startOf("day")
      .format("YYYY-MM-DDTHH:mm:00.000[Z]");

    const availableSlots = await Slot.find({
      lawyer: lawyerId,
      "slotes.slotDate": validDate,
      "slotes.isBooked": false,
    }).exec();

    if (availableSlots) {
      const mergedObject = availableSlots.reduce((result, slot) => {
        slot.slotes.forEach((slotInfo) => {
          if (slotInfo.slotDate) {
            if (!result[slotInfo.slotDate]) {
              result[slotInfo.slotDate] = [];
            }
            result[slotInfo.slotDate].push(slotInfo);
          }
        });
        return result;
      }, {});
      const mergedArray = [].concat(...Object.values(mergedObject));

      return res.status(200).json({ data: mergedArray, message: "success" });
    } else {
      console.log("no slot");
      return res.status(200).json({ message: "Slot not available" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const addAppointment = async (req, res, next) => {
  try {
    const { slId, lawyerId, slTime, slDate } = req.body.data;
    const userId = req.headers.userId;

    // const lawyer = await Lawyer.findById(lawyerId);
    const userdata = await User.findById(userId);
    if (userdata.flc < 300) {
      return res.status(403).json({ created: false, message: "You dont have enough FLC" });
    }

    const updatedSlot = await Slot.findOneAndUpdate(
      {
        lawyer: lawyerId,
        slotes: {
          $elemMatch: { _id: slId },
        },
      },
      { $set: { "slotes.$.isBooked": true } }
    );
    console.log("slotid", slId);
    if (updatedSlot) console.log("slotid", updatedSlot._id);
    const Appoinment = new Appointment({
      lawyer: lawyerId,
      user: userId,
      slotId: slId,
      scheduledAt: {
        slotTime: slTime,
        slotDate: slDate,
      },
    });
    if (Appoinment) {
      console.log("have appo");
      await Appoinment.save();
      const user = await User.findOneAndUpdate(
        { _id: userId },
        { $inc: { flc: -300 } },
        { new: true }
      );

      return res
        .status(200)
        .json({
          created: true,
          data: user,
          message: "Appoinment added successfully",
        });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// const getAppointments = async (req,res,next) => {
//   try {
//     const userId = req.headers.userId
//     const appointments = Appointment.find({user: userId}).populate("lawyer")
//     if (appointments) {
//       return res.status(200).json({ data: appointments, message: "success" });
//     } else {
//       return res.status(200).json({ message: "somthing went wrong" });
//     }
//   } catch (error) {
//     console.log(error);
//     next(error)
//   }
// }

const getAppointments = async (req, res, next) => {
  try {
    const userId = req.headers.userId;
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00.000[Z]")
    console.log("yedsdns date",yesterday);
     await Appointment.updateMany(
       {
         user: userId,
         "scheduledAt.slotDate": { $lte: yesterday },
       },
       {
         $set: {
           AppoinmentStatus: "expired",
         },
       }
     );
    const appointments = await Appointment.find({ user: userId })
      .populate("lawyer")
      .exec();

    if (appointments) {
      return res.status(200).json({ data: appointments, message: "success" });
    } else {
      return res.status(200).json({ message: "something went wrong" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const cancelAppointment = async (req, res, next) => {
  try {
    const userId = req.headers.userId;
    const { id, slotId, slotTime } = req.body;
    console.log("sdjsjdn", req.body);
    const appointment = await Appointment.findOne({ _id: id }).populate(
      "lawyer"
    );
    const lawyerId = appointment.lawyer._id;
    let scheduledDate = new Date(appointment.scheduledAt.slotDate);

    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const formattedScheduledDate = moment(scheduledDate).format(
      "YYYY-MM-DD HH:mm:ss"
    );
    const formattedCurrentDate = moment(currentDate).format(
      "YYYY-MM-DD HH:mm:ss"
    );

    if (formattedScheduledDate > formattedCurrentDate) {
      const updated = await Appointment.findOneAndUpdate(
        { _id: id },
        {
          $set: {
            status: "cancelled",
          },
        }
      );
      if (updated) {
         const slot = await Slot.findOneAndUpdate(
           {
             lawyer: lawyerId,
             slotes: {
               $elemMatch: { _id: slotId },
             },
           },
           { $set: { "slotes.$.isBooked": false } }
         );
          console.log("slot idd",slot);
        await User.findByIdAndUpdate({ _id: userId }, { $inc: { flc: 300 } });
        return res
          .status(200)
          .json({ updated: true, message: "your appointment is canceled" });
      } else {
        return res.status(200).json({
          updated: false,
          message: "somthing went wrong please try later",
        });
      }
    } else {
      return res
        .status(200)
        .json({ message: "You Cant Cancel today Appointment" });
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};



const getAppointmentDate = async (req, res, next) => {
  try {
    const lawyerId = req.headers.lawyerId;

    const result = await Appointment.aggregate([
      {
        $match: {
          lawyer: new mongoose.Types.ObjectId(lawyerId),
        },
      },
      { $unwind: "$scheduledAt" },
      { 
        $group: {
          _id: "$scheduledAt.slotDate",
          appointmentDates: { $addToSet: "$scheduledAt.slotDate" },
        },
      },
      {
        $project: {
          _id: 0,
          appointmentDates: 1,
        },
      },
    ]);
    if (result) {
      const mergedDates = result.reduce((results, obj) => {
        return results.concat(obj.appointmentDates);
      }, []);
      return res.status(200).json({ data: mergedDates, message: "success" });
    } else {
      return res.status(200).json({ message: "No slots" });
    }
  } catch (error) {
    console.log(error.message);
  }
};


const appointmentRequest = async (req, res, next) => {
  try {
    let { date } = req.query;
    if (!date) {
      return res.status(400).json({ message: "Please select a Date" });
    }
   const formatedDate = moment(date, "YYYY-MM-DD");
    date = formatedDate.format("YYYY-MM-DDT00:00:00.000[Z]");
    const lawyerId = req.headers.lawyerId;
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DDT00:00:00.000[Z]");

    await Appointment.updateMany(
      {
        lawyer: lawyerId,
        "scheduledAt.slotDate": { $lte: yesterday },
      },
      {
        $set: {
          AppoinmentStatus: "expired",
        },
      }
    );

    const appointments = await Appointment.find({
      lawyer: lawyerId,
      "scheduledAt.slotDate": date,
    })
      .populate("user")
      .exec();

    if (appointments) {
      return res.status(200).json({ data: appointments, message: "Success" });
    } else {
      return res.status(200).json({ message: "No appointments available" });
    }
  } catch (error) {
    console.log("Error:", error.message);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

const rejectAppointment = async (req,res,next) => {
  try {
    const lawyerId = req.headers.lawyerId;
    const id =req.body.id
    const appointment = await Appointment.findOne({ _id: id }).populate(
      "lawyer"
    );
    const slotId = appointment.slotId
    const userId = appointment.user
    const updated = await Appointment.findOneAndUpdate(
      { _id:id },
      { $set: { AppoinmentStatus: "rejected" } },
    )

    if(updated){
       await Slot.findOneAndUpdate(
         {
           lawyer: lawyerId,
           slotes: {
             $elemMatch: { _id: slotId },
           },
         },
         { $set: { "slotes.$.isBooked": false } }
       );
      await User.findByIdAndUpdate({ _id: userId }, { $inc: { flc: 300 } });
       return res.status(200).json({ message: "Rejection Successful!" });
    }else{
      return res.status(401).json({ message: "Invalid Request" });
    }
  } catch (error) {
    console.log(error);
    next(error)
  }
}

export default {
  addSlot,
  getSlotDate,
  getSlots,
  getSlotDateUser,
  getSlotsUser,
  addAppointment,
  getAppointments,
  cancelAppointment,
  appointmentRequest,
  getAppointmentDate,
  rejectAppointment,
};
