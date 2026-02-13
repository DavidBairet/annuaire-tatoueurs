const express = require("express");
const router = express.Router();
const Artist = require("../models/Artist");

// =========================
// LISTE + RECHERCHE
// =========================
router.get("/", async (req, res) => {
  const q = (req.query.q || "").trim();

  const filter = q
    ? {
        $or: [
          { name: { $regex: q, $options: "i" } },
          { city: { $regex: q, $options: "i" } },
          { styles: { $regex: q, $options: "i" } },
        ],
      }
    : {};

  const artists = await Artist.find(filter).sort({ createdAt: -1 });

  res.render("artists/index", {
    title: "Tatoueurs",
    artists,
    q,
    total: await Artist.countDocuments(),
  });
});

// =========================
// FORMULAIRE INSCRIPTION
// =========================
router.get("/new", (req, res) => {
  res.render("artists/create", { title: "Inscription artiste" });
});

// =========================
// ENREGISTREMENT EN BASE
// =========================
router.post("/", async (req, res) => {
  try {
    const { name, city, styles, instagram, contact } = req.body;

    const artist = new Artist({
      name: name?.trim(),
      city: city?.trim(),
      styles: styles
        ? styles.split(",").map(s => s.trim()).filter(Boolean)
        : [],
      instagram: instagram?.trim(),
      contact: contact?.trim(),
    });

    await artist.save();

    res.redirect("/artists");
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'inscription");
  }
});

module.exports = router;
