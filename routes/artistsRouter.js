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
    .slice(0, 20); // limite pour éviter abus
}

function cleanUrl(v = "") {
  const url = String(v).trim();
  if (!url) return "";
  // ajoute https:// si l’utilisateur met juste "instagram.com/..."
  if (!/^https?:\/\//i.test(url)) return `https://${url}`;
  return url;
}

// =========================
// LISTE + RECHERCHE (PUBLIC) => approved uniquement
// + pagination simple
// =========================
router.get("/", async (req, res) => {
  try {
    const q = cleanText(req.query.q || "");
    const page = Math.max(parseInt(req.query.page || "1", 10), 1);
    const limit = 12; // ajuste si tu veux
    const skip = (page - 1) * limit;

    const filter = {
      status: "approved",
      ...(q
        ? {
            $or: [
              { name: { $regex: q, $options: "i" } },
              { city: { $regex: q, $options: "i" } },
              { styles: { $regex: q, $options: "i" } },
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
    // honeypot anti-bot
    if (req.body.website && String(req.body.website).trim() !== "") {
      return res.status(400).send("Erreur");
    }

    // (optionnel) anti-bot temps minimal (ajoute un champ hidden "ts" dans le form)
    // if (req.body.ts && Date.now() - Number(req.body.ts) < 1500) {
    //   return res.status(400).send("Erreur");
    // }

    const name = cleanText(req.body.name);
    const city = cleanText(req.body.city);
    const styles = cleanList(req.body.styles);
    const instagram = cleanUrl(req.body.instagram);
    const contact = cleanText(req.body.contact);

    // validations simples
    if (name.length < 2 || name.length > 50) {
      return res.status(400).send("Nom requis (2-50).");
    }
    if (city.length < 2 || city.length > 50) {
      return res.status(400).send("Ville requise (2-50).");
    }

    await Artist.create({
      name,
      city,
      styles,
      instagram,
      contact,
      status: "pending",
    });

    res.render("artists/apply_success", { title: "Demande envoyée" });
  } catch (error) {
    console.error(error);

    // Exemple si tu ajoutes un index unique plus tard (ex: instagram unique)
    if (error.code === 11000) {
      return res.status(400).send("Cet artiste semble déjà existant.");
    }

    res.status(500).send("Erreur lors de l'envoi de la demande");
  }
});

module.exports = router;
