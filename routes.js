"use strict";
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const { getAuth } = require("firebase-admin/auth");
const serviceAccount = require("./fin1-46e4d-firebase-adminsdk-iind1-4c0c61ffc2.json");
const config = require("dotenv").config();
console.log(process.env.SENDER_EMAIL, process.env.SENDER_EMAIL_PASSWORD);
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_EMAIL_PASSWORD,
  },
});
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId,
  measurementId:process.env.measurementId,
  credential: admin.credential.cert(serviceAccount),
};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

module.exports = function (app, opts) {
  app.post("/", async (req, res) => {
    const { email } = req.body;
    const generatedCode = Math.floor(100000 + Math.random() * 900000);
    const mailOptions = {
      from: process.env.SENDER_EMAIL,
      to: email,
      subject: "Verification Code",
      text: `Your verification code is: ${generatedCode}`,
    };
    try {
      await transporter.sendMail(mailOptions);
      res.json("Verification email sent successfully!");
    } catch (error) {
      res.json({msg:"Error sending verification email", error: error.message });
    }
  });
  app.post("/deleteuser", async (req, res) => {
    try {
      const { email, verificationCode } = req.body;

      auth
        .getUserByEmail(email)
        .then((userRecord) => {
          auth.deleteUser(userRecord.uid);
          console.log(
            `Successfully getch user data:${JSON.stringify(
              userRecord.toJSON()
            )}`
          );
        });

      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting user:", error);
      res.status(500).json({ error: error.message });
    }
  });
};
