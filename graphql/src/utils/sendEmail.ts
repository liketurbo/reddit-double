import nodemailer from "nodemailer";
import Redis from "ioredis";

const redisClient = new Redis(process.env.REDIS_URL);

// async..await is not allowed in global scope, must use a wrapper
const sendEmail = async (to: string, html: string) => {
  let testAccount = null;

  const exists = await redisClient.exists("email-account");

  if (exists) {
    testAccount = {
      user: (await redisClient.hget("email-account", "user")) as string,
      pass: (await redisClient.hget("email-account", "pass")) as string,
    };
  } else {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    testAccount = await nodemailer.createTestAccount();

    await redisClient.hset("email-account", "user", testAccount.user);
    await redisClient.hset("email-account", "pass", testAccount.pass);
  }

  // create reusable transporter object using the default SMTP transport
  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: testAccount.user, // generated ethereal user
      pass: testAccount.pass, // generated ethereal password
    },
  });

  // send mail with defined transport object
  const info = await transporter.sendMail({
    from: `"Fred Foo 👻" <${testAccount.user}>`, // sender address
    to, // list of receivers
    subject: "Change password", // Subject line
    html, // plain text body
  });

  console.log("Message sent: %s", info.messageId);
  // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

  // Preview only available when sending through an Ethereal account
  console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
};

export default sendEmail;
