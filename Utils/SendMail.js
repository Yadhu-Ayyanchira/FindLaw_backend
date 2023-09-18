import nodemailer from 'nodemailer'

const sendMail = async (email,subject,text) => {
    try {
        const transporter = nodemailer.createTransport({
          host: "smtp.gmail.com",
          service: "gmail",
          port: 587,
          secure: false,
          auth: {
            user: "yadhu2k15@gmail.com",
            pass: process.env.PASS,
          },
        });
        await transporter.sendMail({
          from: "yadhu2k15@gmail.com",
          to: email,
          subject: subject,
          text: text,
        });
        console.log("email sent successfully");
    } catch (error) {
        console.log("Email not sent");
        console.log(error);
    }
}


export default sendMail;