const express = require("express");
const bcrypt = require("bcrypt");
const csrf = require("csurf");

const User = require("../models/User");
const Artist = require("../models/Artist");

const router = express.Router();
const csrfProtection = csrf({ cookie: true });

function requireAdmin(req, res, next) {
  if (req.session?.user?.role === "admin") return next();
  return res.redirect("/admin/login");
}

// GET login
router.get("/login", csrfProtection, (req, res) => {
  res.render("admin/login", {
    title: "Admin - Login",
    csrfToken: req.csrfToken(),
    error: null,
  });
});

// POST login
router.post("/login", csrfProtection, async (req, res) => {
  const email = (req.body.email || "").toLowerCase().trim();
  const password = req.body.password || "";

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).render("admin/login", {
      title: "Admin - Login",
      csrfToken: req.csrfToken(),
      error: "Identifiants invalides",
    });
  }

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) {
    return res.status(401).render("admin/login", {
      title: "Admin - Login",
      csrfToken: req.csrfToken(),
      error: "Identifiants invalides",
    });
  }

  req.session.user = { id: user._id.toString(), email: user.email, role: user.role };
  res.redirect("/admin");
});

// ✅ DASHBOARD avec recherche + onglets via query
router.get("/", requireAdmin, async (req, res) => {
  const q = (req.query.q || "").trim();
  const status = (req.query.status || "pending").trim();

  const baseFilter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
          { styles: { $regex: q, $options: "i" } },
          { instagram: { $regex: q, $options: "i" } },
          { contact: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const [pendingCount, approvedCount, rejectedCount] = await Promise.all([
    Artist.countDocuments({ status: "pending" }),
    Artist.countDocuments({ status: "approved" }),
    Artist.countDocuments({ status: "rejected" }),
  ]);

  const list = await Artist.find({ status, ...baseFilter })
    .sort({ createdAt: -1 })
    .limit(100);

  res.render("admin/dashboard", {
    title: "Admin",
    q,
    status,
    counts: { pending: pendingCount, approved: approvedCount, rejected: rejectedCount },
    list,
  });
});

// Actions
router.post("/artists/:id/approve", requireAdmin, async (req, res) => {
  await Artist.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.redirect("/admin");
});

router.post("/artists/:id/reject", requireAdmin, async (req, res) => {
  await Artist.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.redirect("/admin");
});

router.post("/artists/:id/pending", requireAdmin, async (req, res) => {
  await Artist.findByIdAndUpdate(req.params.id, { status: "pending" });
  res.redirect("/admin");
});

router.post("/artists/:id/delete", requireAdmin, async (req, res) => {
  await Artist.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
});

// Logout
router.post("/logout", requireAdmin, (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

module.exports = router;
