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


router.get("/login", csrfProtection, (req, res) => {
  res.render("admin/login", {
    title: "Admin - Login",
    csrfToken: req.csrfToken(),
    error: null,
  });
});

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

router.get("/", requireAdmin, async (req, res) => {
  const q = (req.query.q || "").trim();
  const status = (req.query.status || "pending").trim();

  const baseFilter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { address1: { $regex: q, $options: "i" } },
          { address2: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
          { postalCode: { $regex: q, $options: "i" } },
          { department: { $regex: q, $options: "i" } },
          { styles: { $regex: q, $options: "i" } },
          { instagram: { $regex: q, $options: "i" } },
          { facebook: { $regex: q, $options: "i" } },
          { website: { $regex: q, $options: "i" } },
          { email: { $regex: q, $options: "i" } },
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

router.get("/artists/new", requireAdmin, (req, res) => {
  res.render("admin/artists_new", { title: "Ajouter un artiste" });
});

router.post("/artists", requireAdmin, async (req, res) => {
  try {
    const cleanText = (v = "") => String(v).trim();
    const cleanList = (v = "") =>
      String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .slice(0, 20);

    const name = cleanText(req.body.name);
    const address1 = cleanText(req.body.address1);
    const address2 = cleanText(req.body.address2);

    const city = cleanText(req.body.city);
    const postalCode = cleanText(req.body.postalCode);
    const department = cleanText(req.body.department);
    const phone = cleanText(req.body.phone);

    const styles = cleanList(req.body.styles);

    const instagram = cleanText(req.body.instagram);
    const facebook = cleanText(req.body.facebook);
    const website = cleanText(req.body.website);

    const emailRaw = cleanText(req.body.email);
    const email = emailRaw ? emailRaw.toLowerCase() : null;

    const bio = cleanText(req.body.bio);

    if (name.length < 2) return res.status(400).send("Nom requis.");
    if (address1.length < 3) return res.status(400).send("Adresse requise.");
    if (city.length < 2) return res.status(400).send("Ville requise.");

    const artist = await Artist.create({
      name,
      address1,
      address2,
      city,
      postalCode,
      department,
      phone,
      styles,
      instagram,
      facebook,
      website,
      email,               
      bio,
      status: "approved",  
      emailVerified: true, 
      source: "admin",
    });

    return res.redirect(`/artists/${artist._id}`);
  } catch (err) {
    console.error(err);
    if (err.code === 11000) return res.status(400).send("Cet email est déjà utilisé.");
    return res.status(500).send("Erreur lors de la création.");
  }
});

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

router.post("/logout", requireAdmin, (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
});

module.exports = router;