const Artist = require("../models/Artist");

// GET /artists?q=
exports.index = async (req, res) => {
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
};

// GET /artists/new
exports.newForm = (req, res) => {
  res.render("artists/create", { title: "Inscription artiste" });
};

// POST /artists
exports.create = async (req, res) => {
  try {
    const { name, city, styles, instagram, contact } = req.body;

    const artist = await Artist.create({
      name: (name || "").trim(),
      city: (city || "").trim(),
      styles: (styles || "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      instagram: (instagram || "").trim(),
      contact: (contact || "").trim(),
    });

    // redirection vers la page profil
    res.redirect(`/artists/${artist._id}`);
  } catch (err) {
    console.error(err);
    res.status(500).send("Erreur lors de l'inscription");
  }
};

// GET /artists/:id
exports.show = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id);
    if (!artist) return res.status(404).send("Artiste introuvable");

    res.render("artists/show", {
      title: artist.name,
      artist,
    });
  } catch (err) {
    res.status(400).send("ID invalide");
  }
};
