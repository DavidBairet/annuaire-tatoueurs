const express = require("express");
const router = express.Router();

const Artist = require("../models/Artist");

// Helpers
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

// =========================
// LISTE + RECHERCHE (PUBLIC) => approved uniquement
// =========================
router.get("/", async (req, res) => {
  try {
    const q = cleanText(req.query.q || "");
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = 12;
    const skip = (page - 1) * limit;

    const filter = {
  status: "approved",
  ...(q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
          { styles: { $regex: q, $options: "i" } },

          // ✅ CP + département : match début (17 → 17000 / 750 → 75000)
          { postalCode: { $regex: "^" + q, $options: "i" } },
          { department: { $regex: "^" + q, $options: "i" } },
        ],
      }
    : {}),
};

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
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors du chargement des tatoueurs");
  }
});

// =========================
// PAGE CANDIDATURE (PUBLIC)
// =========================
router.get("/apply", (req, res) => {
  res.render("artists/apply", { title: "Inscription artiste" });
});

// =========================
// ENVOI CANDIDATURE (PUBLIC) => pending
// =========================
router.post("/apply", async (req, res) => {
  try {
    // honeypot anti-bot (champ "honeypot")
    if (req.body.honeypot && String(req.body.honeypot).trim() !== "") {
      return res.status(400).send("Erreur");
    }

    const name = cleanText(req.body.name);
    const city = cleanText(req.body.city);
    const postalCode = cleanText(req.body.postalCode);

    // ✅ département auto (47000 => "47")
    const department = postalCode ? postalCode.slice(0, 2) : "";  
    const phone = cleanPhone(req.body.phone);

    const styles = cleanList(req.body.styles);

    const instagram = cleanUrl(req.body.instagram);
    const facebook = cleanUrl(req.body.facebook);
    const website = cleanUrl(req.body.website);

    const email = cleanText(req.body.email);
    const bio = cleanText(req.body.bio);

    if (name.length < 2 || name.length > 50) {
      return res.status(400).send("Nom requis (2-50).");
    }
    if (city.length < 2 || city.length > 50) {
      return res.status(400).send("Ville requise (2-50).");
    }
    if (!/^\d{5}$/.test(postalCode)) {
     return res.status(400).send("Code postal invalide (5 chiffres).");
    }
    if (!email || email.length < 5 || email.length > 120) {
      return res.status(400).send("Email requis.");
    }

   await Artist.create({
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
});

    res.render("artists/apply_success", { title: "Demande envoyée" });
  } catch (error) {
    console.error(error);
    if (error.code === 11000) {
      return res.status(400).send("Cet artiste semble déjà existant.");
    }
    res.status(500).send("Erreur lors de l'envoi de la demande");
  }
});

// =========================
// FICHE ARTISTE (PUBLIC) => approved uniquement
// ⚠️ IMPORTANT : toujours APRÈS /apply
// =========================
router.get("/:id", async (req, res) => {
  try {
    const artist = await Artist.findOne({
      _id: req.params.id,
      status: "approved",
    });

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
function cleanPhone(v = "") {
  const digits = String(v).replace(/\D/g, "");

  // format FR : 0612345678 → 06 12 34 56 78
  if (digits.length === 10) {
    return digits.replace(/(\d{2})(?=\d)/g, "$1 ").trim();
  }

  return digits;
}

module.exports = router;
