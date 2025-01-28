const express = require("express");
const router = express.Router();
const verifyJWT = require("../middleware/verifyJWT");

router.get("/protected", verifyJWT, (req, res) => {
  console.log("Token received at /protected: ", req.headers);
  res
    .status(200)
    .json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
