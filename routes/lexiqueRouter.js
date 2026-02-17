const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.render("lexique/index", {
    title: "lexique",
  });
});

module.exports = router;