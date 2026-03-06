function requireArtist(req, res, next) {

  if (!req.session || !req.session.artistId) {
    req.session = null;
    return res.redirect("/artists/login");
  }

  next();

}

module.exports = requireArtist;