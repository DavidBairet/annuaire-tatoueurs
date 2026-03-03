const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const Artist = require("../models/Artist");
const sendVerificationEmail = require("../config/mailer");
const bcrypt = require("bcrypt")
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
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  }
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

    // validations
    if (name.length < 2 || name.length > 50) return res.status(400).send("Nom requis (2-50).");
    if (city.length < 2 || city.length > 50) return res.status(400).send("Ville requise (2-50).");
    if (!/^\d{5}$/.test(postalCode)) return res.status(400).send("Code postal invalide (5 chiffres).");
    if (!email || email.length < 5 || email.length > 120) return res.status(400).send("Email requis.");

    if (!confirmEmail) return res.status(400).send("Confirmation email requise.");
    if (email.toLowerCase() !== confirmEmail.toLowerCase()) {
      return res.status(400).send("Les emails ne correspondent pas.");
    }

    if (password.length < 8 || password.length > 72) {
      return res.status(400).send("Mot de passe requis (8 à 72 caractères).");
    }
    if (!confirmPassword) return res.status(400).send("Confirmation mot de passe requise.");
    if (password !== confirmPassword) {
      return res.status(400).send("Les mots de passe ne correspondent pas.");
    }

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
      email,
      bio,
      status: "pending",
      emailVerified: false,
      passwordHash,
    });

    const token = crypto.randomBytes(32).toString("hex");
    artist.verifyToken = token;
    artist.verifyTokenExpires = new Date(Date.now() + 1000 * 60 * 60 * 24);

    await artist.save();

    await sendVerificationEmail(artist.email, token);

   const verifyUrl =
  (process.env.BASE_URL || "http://localhost:3000") + `/artists/verify/${token}`;

res.render("artists/apply_success", {
  title: "Demande envoyée",
  email,
  verifyUrl: process.env.MAIL_MODE === "console" ? verifyUrl : null,
});
  } catch (error) {
    console.error("❌ /artists/apply error:", error);
    if (error.code === 11000) return res.status(400).send("Cet email est déjà utilisé.");
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

    if (!artist) {
      return res.status(400).render("artists/verify_failed", {
        title: "Lien invalide",
      });
    }

    artist.emailVerified = true;
    artist.verifyToken = null;
    artist.verifyTokenExpires = null;
    await artist.save();

    return res.render("artists/verify_success", {
      title: "Email vérifié",
      artistName: artist.name,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Erreur serveur.");
  }
});

router.get("/:id", async (req, res) => {
  try {
    const artist = await Artist.findOne({ _id: req.params.id, status: "approved" });

    if (!artist) {
      return res.status(404).render("404", { title: "Artiste introuvable" });
    }

    res.render("artists/show", {
      title: artist.name,
      artist,
    });
  } catch (error) {
    console.error(error);
    res.status(404).render("404", { title: "Artiste introuvable" });
  }
});

module.exports = router;