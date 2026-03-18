const { Router } = require("express");
const indexController = require("../controllers/indexController");

const router = Router();
router.get("/", indexController.homeGet);

router.get("/confidentialite", (req, res) => {
  res.render("confidentialite", {
    title: "Politique de confidentialité",
  });
});

module.exports = router;
