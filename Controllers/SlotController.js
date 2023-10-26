const addSlot = (req,res,next) => {
    try {
        console.log("add slot controller",req.body);
        const lawyerId = req.headers.lawyerId
        const { startTime, endTime, startDate, endDate } = req.body;

    } catch (error) {
        console.log(error);
        next(error)
    }
}

export default{
    addSlot
}