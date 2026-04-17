const mailer = require("nodemailer")
require("dotenv").config()

const mailSend = async (to, subject, text) => {

    const transporter = mailer.createTransport({
        service: "gmail",
        auth: {
            user: process.env.SMTP_USER,   
            pass: process.env.SMTP_PASS      
        }
    });

    const mailOptions = {
        to: to,
        subject: subject,
        html: text
    }

    const mailResponse = await transporter.sendMail(mailOptions)
    console.log(mailResponse);
    return mailResponse

}

module.exports = mailSend