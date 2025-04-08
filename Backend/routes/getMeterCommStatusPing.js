const express = require("express");
const router = express.Router();
const { pingDevice } = require("../utils/pingUtils");

router.get("/ping/:ipAddress", async (req, res) => {
  try {
    const { ipAddress } = req.params;
    const result = await pingDevice(ipAddress);

    if (result.success) {
      res.status(200).json(result);
    } else if (result.message.includes("Invalid IP")) {
      res.status(400).json(result);
    } else {
      res.status(503).json(result);
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Server error: ${error.message}`,
    });
  }
});

module.exports = router;
