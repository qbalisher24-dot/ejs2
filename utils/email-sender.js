const nodemailer = require("nodemailer");

const emailSender = async (email, code) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        // Videodagi o'qituvchi manzili o'rniga o'z manzilingiz .env dan olinadi.
        user: process.env.MAIL_USER,
        pass: process.env.APP_KEY,
      },
    });

    const info = await transporter.sendMail({
      from: process.env.MAIL_USER,
      to: email, // list of recipients
      subject: "Hello", // Subject line
      text: "matn", // plain text body
      html: `<b style="font-size: 20px; color: blue;">${code}</b>`, // HTML body
    });

    console.log("Message sent: %s", info.messageId);
    // Preview URL is only available when sending through an Ethereal test account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = emailSender;
