const express = require("express");
const upload = require("../config/multer");
const requireArtist = require("../middlewares/requireArtist");
const artistsController = require("../controllers/artistsController");

const router = express.Router();

router.get("/", artistsController.index);

router.get("/apply", artistsController.applyForm);
router.post("/apply", artistsController.apply);
router.get("/deja-inscrit", artistsController.dejaInscrit);

router.get("/login", artistsController.loginForm);
router.post("/login", artistsController.login);
router.post("/logout", artistsController.logout);

router.get("/forgot-password", artistsController.forgotPasswordGet);
router.post("/forgot-password", artistsController.forgotPasswordPost);

router.get("/reset-password/:token", artistsController.resetPasswordGet);
router.post("/reset-password/:token", artistsController.resetPasswordPost);

router.get("/me", requireArtist, artistsController.me);
router.get("/me/edit", requireArtist, artistsController.editForm);
router.post("/me/edit", requireArtist, artistsController.edit);
router.get("/me/delete", requireArtist, artistsController.deleteForm);
router.post("/me/delete", requireArtist, artistsController.deleteAccount);

router.post(
  "/me/upload",
  requireArtist,
  upload.single("image"),
  artistsController.uploadToGallery
);

router.post(
  "/me/gallery/delete",
  requireArtist,
  artistsController.deleteFromGallery
);

router.get("/verify/:token", artistsController.verify);

router.get("/:id", artistsController.show);

module.exports = router;