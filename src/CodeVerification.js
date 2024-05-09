import "./App.css";
import { toast } from "react-toastify";

import React, { useState } from "react";

const VerificationEmail = () => {
  const [email, setEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [verificationError, setVerificationError] = useState(null);
  const [deletionMessage, setDeletionMessage] = useState("");
  const [sendEmail, setSendEmail] = useState("false");
  const handleClick = () => {
    setSendEmail(!sendEmail);
  };
  const notifyEmail = () => toast("Verification Code Sent Successfully");
  const notifyCode = () => toast("User Deleted Successfully");

  const sendVerificationEmail = async () => {
    fetch("http://localhost:8000", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: email }),
    })
      .then((response) => {
        notifyEmail();
        handleClick();
      })
      .catch((error) => {
        console.log(error);
      });
  };

  const deleteUser = async () => {
    try {
      console.log(email, verificationCode);
      const response = await fetch("http://localhost:8000/deleteUser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          verificationCode: verificationCode,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setDeletionMessage(data.message);
        notifyCode();
      } else {
        setVerificationError(data.error);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      setVerificationError("Error deleting user");
    }
  };

  return (
    <div className="main-div">
      <p>Enter Your Email</p>
      <br />
      {sendEmail ? (
        <div className="sub-div">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button onClick={sendVerificationEmail}>
            Send Verification Email
          </button>
        </div>
      ) : (
        <div className="sub-div">
          <input
            type="text"
            placeholder="Enter Verification Code"
            value={deletionMessage}
            onChange={(e) => setDeletionMessage(e.target.value)}
          />
          <button onClick={deleteUser}>Delete User</button>
        </div>
      )}

      {verificationError && <p>{verificationError}</p>}
    </div>
  );
};

export default VerificationEmail;
