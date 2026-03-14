const express = require("express");
const csrf = require("csurf");

const requireAdmin = require("../middlewares/requireAdmin");
const adminController = require("../controllers/adminController");

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

router.get("/login", csrfProtection, adminController.loginForm);
router.post("/login", csrfProtection, adminController.login);
router.post("/logout", requireAdmin, adminController.logout);


router.get("/", requireAdmin, adminController.dashboard);


router.get("/artists/new", requireAdmin, adminController.newArtistForm);
router.post("/artists", requireAdmin, adminController.createArtist);

router.get("/artists/:id/edit", requireAdmin, adminController.editArtistForm);
router.post("/artists/:id/edit", requireAdmin, adminController.updateArtist);

router.post("/artists/:id/approve", requireAdmin, adminController.setStatusApproved);
router.post("/artists/:id/reject", requireAdmin, adminController.setStatusRejected);
router.post("/artists/:id/pending", requireAdmin, adminController.setStatusPending);
router.post("/artists/:id/delete", requireAdmin, adminController.deleteArtist);

module.exports = router;