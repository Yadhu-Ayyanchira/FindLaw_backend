import Slot from "../Models/SlotModel.js";
import Lawyer from "../Models/LawyerModel.js";
import moment from "moment";
import mongoose from "mongoose";

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
        console.log("existt");
        return res.status(409).json({ message: "Slot already exists" });
      }
      console.log("date error", startTime, endTime, slotDuration, date);
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
      const slotData = createdSlots.map((slotObj) => {
        return {
          lawyer: lawyerId,
          slotes: slotObj.slots,
        };
      });
      const savedSlots = await Slot.create(slotData);
      return res.status(200).json({ savedSlots });
    }
  } catch (error) {
    console.log("hghhjghjgjhgjgh");
    console.log(error);
    next(error);
  }
};
function generateTimeSlots(startTime, endTime, slotDuration, date) {
  console.log("date is", startTime, endTime, slotDuration, date);
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
    console.log("getSlotDate");
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
    console.log("getslots");
    const { date } = req.query;
    console.log("date is", date);
    if (!date) {
      console.log("okkkk");
      return res.status(200).json({ message: "please select Date" });
    }

    const lawyerId = req.headers.lawyerId;
    const yesterday = moment().subtract(1, "days").format("YYYY-MM-DD");
    console.log(yesterday, "yesterday");
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
      console.log("slot avail");
      return res.status(200).json({ data: availableSlots, message: "success" });
    } else {
      console.log("not avail");
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
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate());
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

      return res.status(200).json({ data: slotDates, message: "success" });
    }else{
            return res.status(200).json({cmessage: "No slots" });

    }
  } catch (error) {
    console.log(error);
    next(error);
  }
};

// const getSlotsUser = async (req,res,next)=>{
//   try {
//     const { date, lawyerId } = req.query;
//     const validDate = moment(date, "YYYY-MM-DD", true);
//     console.log("getSlotsUser",date);
//      if (!date) {
//       console.log("no date gfgf");
//        return res.status(400).json({ message: "please select Date" });
//      }
//      const availableSlots = await Slot.find({
//        lawyer: lawyerId,
//        "slotes.slotDate": validDate.toDate(), // Convert date to JavaScript Date object
//        "slotes.isBooked": false,
//      }).exec();
//      if (availableSlots) {
//        // console.log(availableSlots);
//        const mergedObject = availableSlots.reduce((result, slot) => {
//          slot.slotes.forEach((slotInfo) => {
//            if (slotInfo.slotDate) {
//              if (!result[slotInfo.slotDate]) {
//                result[slotInfo.slotDate] = [];
//              }
//              result[slotInfo.slotDate].push(slotInfo);
//            }
//          });
//          return result;
//        }, {});
//        const mergedArray = [].concat(...Object.values(mergedObject));

//        console.log(mergedArray);
//        return res.status(200).json({ data: mergedArray, message: "success" });
//      } else {
//        return res.status(200).json({ message: "slote not avilble" });
//      }
//   } catch (error) {
//     console.log(error);
//     next(error)    
//   }
// }
const getSlotsUser = async (req, res, next) => {
  try {
    console.log("jhjjhj");
    const { date, lawyerId } = req.query;
    if (!date) {
      console.log("no date");
      return res.status(400).json({ message: "Please select a Date" });
    }

    const validDate = moment(date, "YYYY-MM-DD").toDate();
    // if (!validDate.isValid()) {
    //   console.log("not vaid");
    //   return res.status(400).json({ message: "Invalid Date format" });
    // }

    const availableSlots = await Slot.find({
      lawyer: lawyerId,
      "slotes.slotDate": validDate,
      "slotes.isBooked": false,
    }).exec();

    if (availableSlots) {
      console.log("slot avail");
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

      console.log(mergedArray);
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


export default {
  addSlot,
  getSlotDate,
  getSlots,
  getSlotDateUser,
  getSlotsUser,
};
