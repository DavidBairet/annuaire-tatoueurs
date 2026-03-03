const express = require("express");
const router = express.Router();

const tips = require("../data/adviceTips");


router.get("/", (req, res) => {
  res.render("advice/index", {
    title: "Conseils & Astuces",
    tips,
  });
});

module.exports = router;