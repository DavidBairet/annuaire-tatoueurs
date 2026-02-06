exports.homeGet = (req, res) => {
    res.render("index", { title: "Annuaire de tatoueurs" });
};
