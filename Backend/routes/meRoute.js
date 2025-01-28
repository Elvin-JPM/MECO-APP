const express = require("express");
const verifyJWT = require("../middleware/verifyJWT"); // Your middleware to validate JWT
const router = express.Router();

router.get("/me", verifyJWT, (req, res) => {
  // The `req.user` object is populated by the `verifyJWT` middleware
  res.json({
    username: req.user.username,
    fullName: req.user.nombre,
    departmentId: req.user.id_departamento,
    cargoId: req.user.id_cargo,
  });
});

module.exports = router;
