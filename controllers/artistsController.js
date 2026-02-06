const artistsStorage = require("../storages/artistsStorage");
const { body, validationResult, matchedData } = require("express-validator");

const validateArtist = [
    body("name").trim().isLength({ min: 2, max: 50 }).withMessage("Nom requis (2-50)."),
    body("city").trim().isLength({ min: 2, max: 50 }).withMessage("Ville requise (2-50)."),
    body("styles").trim().optional({ values: "falsy" }),
    body("instagram").trim().optional({ values: "falsy" }).isURL().withMessage("Instagram doit être une URL valide."),
];

exports.artistsListGet = (req, res) => {
    res.render("artists/index", {
        title: "Tatoueurs",
        artists: artistsStorage.getArtists(),
    });
};

exports.artistShowGet = (req, res) => {
    const artist = artistsStorage.getArtist(req.params.id);
    if (!artist) return res.status(404).send("Artiste introuvable");
    res.render("artists/show", { title: artist.name, artist });
};

exports.artistCreateGet = (req, res) => {
    res.render("artists/create", { title: "Inscrire un tatoueur" });
};

exports.artistCreatePost = [
    ...validateArtist,
    (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).render("artists/create", {
                title: "Inscrire un tatoueur",
                errors: errors.array(),
            });
        }

        const data = matchedData(req);
        const styles = data.styles
            ? data.styles.split(",").map(s => s.trim()).filter(Boolean)
            : [];

        artistsStorage.addArtist({
            name: data.name,
            city: data.city,
            styles,
            instagram: data.instagram || "",
        });

        res.redirect("/artists");
    },
];
