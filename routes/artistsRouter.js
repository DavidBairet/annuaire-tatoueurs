const { Router } = require("express");
const artistsController = require("../controllers/artistsController");

const router = Router();

router.get("/", artistsController.artistsListGet);
router.get("/create", artistsController.artistCreateGet);
router.post("/create", artistsController.artistCreatePost);
router.get("/:id", artistsController.artistShowGet);

module.exports = router;
