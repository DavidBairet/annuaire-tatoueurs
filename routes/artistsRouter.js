const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const bcrypt = require("bcrypt");
const fs = require("fs/promises");
const path = require("path");

const Artist = require("../models/Artist");
const sendVerificationEmail = require("../config/mailer");
const upload = require("../config/multer");

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

function cleanUrl(v = "") {
  const url = String(v).trim();
  if (!url) return "";
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

function cleanPhone(v = "") {
  const digits = String(v).replace(/\D/g, "");
  if (digits.length === 10) return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  return digits;
}

function deptFromPostal(cp) {
  const s = String(cp || "").trim();
  if (!s) return "";
  if (s.startsWith("97") || s.startsWith("98")) return s.slice(0, 3);
  return s.slice(0, 2);
}

function escapeRegex(s = "") {
  return String(s).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function normalizeForSearch(s = "") {
  return String(s)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function requireArtist(req, res, next) {
  if (!req.session?.artistId) return res.redirect("/artists/login");
  next();
}

router.get("/", async (req, res) => {
  try {
    const q = cleanText(req.query.q || "");
    const pageParam = parseInt(req.query.page || "1", 10);
    const page = q ? 1 : Math.max(Number.isFinite(pageParam) ? pageParam : 1, 1);
    const limit = 12;
    const skip = (page - 1) * limit;
    const filter = { status: "approved" };

    if (q) {
      const qNorm = normalizeForSearch(q);
      const tokens = qNorm.split(" ").filter(Boolean).slice(0, 8);

      const andSearchText = tokens.map((t) => ({
        searchText: { $regex: escapeRegex(t), $options: "i" },
      }));

      const qEsc = escapeRegex(q);
      const rxContains = new RegExp(qEsc, "i");
      const rxPrefix = new RegExp("^" + qEsc, "i");

      const fallbackOr = [
        { name: rxContains },
        { city: rxContains },
        { styles: { $elemMatch: { $regex: rxContains } } },
        { postalCode: rxPrefix },
        { department: rxPrefix },
      ];

      if (/^\d{5}$/.test(q)) {
        const dept = deptFromPostal(q);
        const deptEsc = escapeRegex(dept);
        fallbackOr.push({ department: new RegExp("^" + deptEsc, "i") });
      }

      filter.$or = [{ $and: andSearchText }, { $or: fallbackOr }];
    }

    const [artists, total] = await Promise.all([
      Artist.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
      Artist.countDocuments(filter),
    ]);

    const totalPages = Math.max(Math.ceil(total / limit), 1);

    res.render("artists/index", {
      title: "Tatoueurs",
      artists,
      q,
      total,
      page,
      totalPages,
      queryString: q ? `&q=${encodeURIComponent(q)}` : "",
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors du chargement des tatoueurs");
  }
});

router.get("/apply", (req, res) => {
  res.render("artists/apply", { title: "Inscription artiste" });
});

router.get("/deja-inscrit", (req, res) => {
  res.render("artists/deja_inscrit", { title: "Déjà inscrit ?" });
});

router.get("/login", (req, res) => {
  res.render("artists/login", { title: "Connexion artiste", error: null });
});

router.post("/login", async (req, res) => {
  try {
    const email = cleanText(req.body.email).toLowerCase();
    const password = String(req.body.password || "");

    const artist = await Artist.findOne({ email });

    if (!artist) {
      return res.status(401).render("artists/login", {
        title: "Connexion artiste",
        error: "Email ou mot de passe incorrect",
      });
    }

    const ok = await bcrypt.compare(password, artist.passwordHash);

    if (!ok) {
      return res.status(401).render("artists/login", {
        title: "Connexion artiste",
        error: "Email ou mot de passe incorrect",
      });
    }

    req.session.artistId = artist._id;
    res.redirect("/artists/me");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur serveur");
  }
});

router.post("/logout", (req, res) => {
  req.session.artistId = null;
  res.redirect("/");
});

router.get("/me", requireArtist, async (req, res) => {
  try {
    const artist = await Artist.findById(req.session.artistId);
    if (!artist) {
      req.session.artistId = null;
      return res.redirect("/artists/login");
    }

    res.render("artists/me", {
      title: "Mon espace artiste",
      artist,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

router.post("/me/upload", requireArtist, upload.single("image"), async (req, res) => {
  try {
    const artist = await Artist.findById(req.session.artistId);
    if (!artist) {
      req.session.artistId = null;
      return res.redirect("/artists/login");
    }

    if (!req.file) return res.redirect("/artists/me");

    artist.gallery = artist.gallery || [];
    artist.gallery.push("/uploads/tattoos/" + req.file.filename);
    await artist.save();

    res.redirect("/artists/me");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur upload");
  }
});

router.post("/me/gallery/delete", requireArtist, async (req, res) => {
  try {
    const artist = await Artist.findById(req.session.artistId);
    if (!artist) {
      req.session.artistId = null;
      return res.redirect("/artists/login");
    }

    const img = cleanText(req.body.img || "");
    if (!img) return res.redirect("/artists/me");

    const idx = (artist.gallery || []).indexOf(img);
    if (idx === -1) return res.redirect("/artists/me");

    artist.gallery.splice(idx, 1);
    await artist.save();

    const rel = img.startsWith("/") ? img.slice(1) : img;
    if (rel.startsWith("uploads/tattoos/")) {
      const filePath = path.join(process.cwd(), "public", rel);
      await fs.unlink(filePath).catch(() => {});
    }

    res.redirect("/artists/me");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur suppression image");
  }
});

router.get("/me/edit", requireArtist, async (req, res) => {
  try {
    const artist = await Artist.findById(req.session.artistId);
    if (!artist) {
      req.session.artistId = null;
      return res.redirect("/artists/login");
    }

    res.render("artists/edit", {
      title: "Modifier ma fiche",
      artist,
      error: null,
      success: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

router.post("/me/edit", requireArtist, async (req, res) => {
  try {
    const artist = await Artist.findById(req.session.artistId);
    if (!artist) {
      req.session.artistId = null;
      return res.redirect("/artists/login");
    }

    const name = cleanText(req.body.name);
    const city = cleanText(req.body.city);
    const postalCode = cleanText(req.body.postalCode);
    const department = deptFromPostal(postalCode);

    const phone = cleanPhone(req.body.phone);
    const styles = cleanList(req.body.styles);

    const instagram = cleanUrl(req.body.instagram);
    const facebook = cleanUrl(req.body.facebook);
    const website = cleanUrl(req.body.website);

    const bio = cleanText(req.body.bio);

    const artistForRender = {
      ...artist.toObject(),
      name,
      city,
      postalCode,
      department,
      phone,
      styles,
      instagram,
      facebook,
      website,
      bio,
    };

    if (name.length < 2 || name.length > 50) {
      return res.status(400).render("artists/edit", {
        title: "Modifier ma fiche",
        artist: artistForRender,
        error: "Nom invalide",
        success: null,
      });
    }

    if (city.length < 2 || city.length > 50) {
      return res.status(400).render("artists/edit", {
        title: "Modifier ma fiche",
        artist: artistForRender,
        error: "Ville invalide",
        success: null,
      });
    }

    if (!/^\d{5}$/.test(postalCode)) {
      return res.status(400).render("artists/edit", {
        title: "Modifier ma fiche",
        artist: artistForRender,
        error: "Code postal invalide",
        success: null,
      });
    }

    artist.name = name;
    artist.city = city;
    artist.postalCode = postalCode;
    artist.department = department;
    artist.phone = phone;
    artist.styles = styles;
    artist.instagram = instagram;
    artist.facebook = facebook;
    artist.website = website;
    artist.bio = bio;

    await artist.save();

    res.render("artists/edit", {
      title: "Modifier ma fiche",
      artist,
      error: null,
      success: "✅ Fiche mise à jour !",
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

router.get("/me/delete", requireArtist, async (req, res) => {
  try {
    const artist = await Artist.findById(req.session.artistId);
    if (!artist) {
      req.session.artistId = null;
      return res.redirect("/artists/login");
    }

    res.render("artists/delete", {
      title: "Supprimer mon compte",
      artist,
      error: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

router.post("/me/delete", requireArtist, async (req, res) => {
  try {
    const artist = await Artist.findById(req.session.artistId);
    if (!artist) {
      req.session.artistId = null;
      return res.redirect("/artists/login");
    }

    const password = String(req.body.password || "");
    const confirm = cleanText(req.body.confirm || "");

    const ok = await bcrypt.compare(password, artist.passwordHash);

    if (!ok || confirm !== "SUPPRIMER") {
      return res.status(400).render("artists/delete", {
        title: "Supprimer mon compte",
        artist,
        error: "Mot de passe incorrect ou confirmation invalide (tape SUPPRIMER).",
      });
    }

    await Artist.deleteOne({ _id: artist._id });
    req.session.artistId = null;
    res.redirect("/");
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

router.post("/apply", async (req, res) => {
  try {
    if (req.body.honeypot && String(req.body.honeypot).trim() !== "") {
      return res.status(400).send("Erreur");
    }

    const name = cleanText(req.body.name);
    const city = cleanText(req.body.city);
    const postalCode = cleanText(req.body.postalCode);
    const department = deptFromPostal(postalCode);

    const phone = cleanPhone(req.body.phone);
    const styles = cleanList(req.body.styles);

    const instagram = cleanUrl(req.body.instagram);
    const facebook = cleanUrl(req.body.facebook);
    const website = cleanUrl(req.body.website);

    const email = cleanText(req.body.email);
    const confirmEmail = cleanText(req.body.confirmEmail);

    const password = String(req.body.password || "");
    const confirmPassword = String(req.body.confirmPassword || "");

    const bio = cleanText(req.body.bio);

    if (name.length < 2 || name.length > 50) return res.status(400).send("Nom requis");
    if (city.length < 2 || city.length > 50) return res.status(400).send("Ville requise");
    if (!/^\d{5}$/.test(postalCode)) return res.status(400).send("Code postal invalide");

    if (!email || email.length < 5 || email.length > 120) return res.status(400).send("Email requis");
    if (!confirmEmail) return res.status(400).send("Confirmation email requise");
    if (email.toLowerCase() !== confirmEmail.toLowerCase()) return res.status(400).send("Les emails ne correspondent pas");

    if (password.length < 8 || password.length > 72) return res.status(400).send("Mot de passe requis");
    if (!confirmPassword) return res.status(400).send("Confirmation mot de passe requise");
    if (password !== confirmPassword) return res.status(400).send("Les mots de passe ne correspondent pas");

    const emailLower = email.toLowerCase();
    const exists = await Artist.findOne({ email: emailLower });
    if (exists) return res.redirect("/artists/deja-inscrit");

    const passwordHash = await bcrypt.hash(password, 10);

    const artist = new Artist({
      name,
      city,
      postalCode,
      department,
      phone,
      styles,
      instagram,
      facebook,
      website,
      email: emailLower,
      bio,
      status: "pending",
      emailVerified: false,
      passwordHash,
      gallery: [],
    });

    const token = crypto.randomBytes(32).toString("hex");
    artist.verifyToken = token;
    artist.verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await artist.save();
    await sendVerificationEmail(artist.email, token);

    const verifyUrl = (process.env.BASE_URL || "http://localhost:3000") + `/artists/verify/${token}`;

    res.render("artists/apply_success", {
      title: "Demande envoyée",
      email: artist.email,
      verifyUrl: process.env.MAIL_MODE === "console" ? verifyUrl : null,
    });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) return res.redirect("/artists/deja-inscrit");
    res.status(500).send("Erreur lors de l'envoi de la demande");
  }
});

router.get("/verify/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const artist = await Artist.findOne({
      verifyToken: token,
      verifyTokenExpires: { $gt: new Date() },
    });

    if (!artist) return res.status(400).send("Lien invalide");

    artist.emailVerified = true;
    artist.verifyToken = null;
    artist.verifyTokenExpires = null;

    await artist.save();

    res.render("artists/verify_success", {
      title: "Email vérifié",
      artistName: artist.name,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur serveur");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const artist = await Artist.findOne({
      _id: req.params.id,
      status: "approved",
    });

    if (!artist) return res.status(404).send("Artiste introuvable");

    res.render("artists/show", {
      title: artist.name,
      artist,
    });
  } catch (error) {
    console.error(error);
    res.status(404).send("Artiste introuvable");
  }
});

module.exports = router;