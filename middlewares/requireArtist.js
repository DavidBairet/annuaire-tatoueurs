function requireArtist(req, res, next) {
  if (!req.session?.artistId) {
    return res.redirect("/artists/login");
  }
  next();
}

module.exports = requireArtist;