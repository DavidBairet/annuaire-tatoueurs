const express = require("express");
const router = express.Router();

const terms = require("../data/lexiqueTerms");


router.get("/", (req, res) => {
  res.render("lexique/index", {
    title: "Lexique du Tatouage",
    terms,
  });
});

module.exports = router;