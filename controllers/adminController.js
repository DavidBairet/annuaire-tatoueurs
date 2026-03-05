const bcrypt = require("bcrypt");
const User = require("../models/User");
const Artist = require("../models/Artist");


function cleanText(v = "") {
  return String(v).trim();
}
function cleanList(v = "") {
  return String(v)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 20);
}

exports.loginForm = (req, res) => {
  res.render("admin/login", {
    title: "Admin - Login",
    csrfToken: req.csrfToken(),
    error: null,
  });
};

exports.login = async (req, res) => {
  try {
    const email = (req.body.email || "").toLowerCase().trim();
    const password = req.body.password || "";

    const user = await User.findOne({ email });

   
    if (!user || user.role !== "admin") {
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

    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
    };

    return res.redirect("/admin");
  } catch (err) {
    console.error(err);
    return res.status(500).render("admin/login", {
      title: "Admin - Login",
      csrfToken: req.csrfToken(),
      error: "Erreur serveur",
    });
  }
};

exports.dashboard = async (req, res) => {
  try {
    const q = cleanText(req.query.q || "");
    const status = cleanText(req.query.status || "pending");

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
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
};

exports.newArtistForm = (req, res) => {
  res.render("admin/artists_new", { title: "Ajouter un artiste" });
};

exports.createArtist = async (req, res) => {
  try {
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
};

exports.setStatusApproved = async (req, res) => {
  await Artist.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.redirect("/admin");
};

exports.setStatusRejected = async (req, res) => {
  await Artist.findByIdAndUpdate(req.params.id, { status: "rejected" });
  res.redirect("/admin");
};

exports.setStatusPending = async (req, res) => {
  await Artist.findByIdAndUpdate(req.params.id, { status: "pending" });
  res.redirect("/admin");
};

exports.deleteArtist = async (req, res) => {
  await Artist.findByIdAndDelete(req.params.id);
  res.redirect("/admin");
};

exports.logout = (req, res) => {
  req.session.destroy(() => res.redirect("/admin/login"));
};