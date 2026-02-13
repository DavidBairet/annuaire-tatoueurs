const express = require("express");
const router = express.Router();

const Artist = require("../models/Artist");

// =========================
// LISTE + RECHERCHE (PUBLIC) => approved uniquement
// =========================
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();

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

  const artists = await Artist.find(filter).sort({ createdAt: -1 });
  const total = await Artist.countDocuments(filter);

  res.render("artists/index", {
    title: "Tatoueurs",
    artists,
    q,
    total,
  });
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
    if (req.body.website && req.body.website.trim() !== "") {
      return res.status(400).send("Erreur");
    }

    const name = (req.body.name || "").trim();
    const city = (req.body.city || "").trim();
    const styles = (req.body.styles || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    if (name.length < 2 || city.length < 2) {
      return res.status(400).send("Nom et ville requis.");
    }

    await Artist.create({
      name,
      city,
      styles,
      instagram: (req.body.instagram || "").trim(),
      contact: (req.body.contact || "").trim(),
      status: "pending",
    });

    res.render("artists/apply_success", { title: "Demande envoyée" });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'envoi de la demande");
  }
});

module.exports = router;
